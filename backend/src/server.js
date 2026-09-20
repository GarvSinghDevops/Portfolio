import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { Contact } from "./models/Contact.js";

const required = ["MONGODB_URI", "FRONTEND_ORIGIN", "NOTIFICATION_EMAIL", "SMTP_HOST", "SMTP_USER", "SMTP_PASS"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);

const app = express();
const allowedOrigins = process.env.FRONTEND_ORIGIN.split(",").map((origin) => origin.trim());
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value) => (typeof value === "string" ? value.trim() : "");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: allowedOrigins, methods: ["POST", "GET"] }));
app.use(express.json({ limit: "20kb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/health", (_request, response) => response.json({ ok: true }));

app.post("/api/contact", async (request, response, next) => {
  try {
    const { name, email, phone, subject, message, website } = request.body ?? {};

    // Hidden honeypot: bots commonly populate every field.
    if (clean(website)) return response.status(200).json({ message: "Thanks! Your message has been sent." });

    const submission = {
      name: clean(name), email: clean(email), phone: clean(phone),
      subject: clean(subject), message: clean(message)
    };
    if (!submission.name || !submission.email || !submission.subject || !submission.message) {
      return response.status(400).json({ message: "Name, email, subject, and message are required." });
    }
    if (!emailPattern.test(submission.email)) return response.status(400).json({ message: "Enter a valid email address." });
    if (submission.name.length > 100 || submission.email.length > 254 || submission.phone.length > 30 || submission.subject.length > 150 || submission.message.length > 5000) {
      return response.status(400).json({ message: "One or more fields are too long." });
    }

    const contact = await Contact.create(submission);
    const text = [
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone || "Not provided"}`,
      `Subject: ${contact.subject}`,
      "",
      contact.message
    ].join("\n");

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.NOTIFICATION_EMAIL,
      replyTo: contact.email,
      subject: `[Portfolio] ${contact.subject}`,
      text
    });

    response.status(201).json({ message: "Thanks! Your message has been sent." });
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: "Unable to send your message right now. Please try again later." });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await transporter.verify();
    app.listen(process.env.PORT || 3000, () => console.log("Contact API is running."));
  })
  .catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
  });
