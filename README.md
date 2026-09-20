# Portfolio contact form

The portfolio uses FormSubmit to send contact-form messages directly to `coder.singhg007@gmail.com`; it works on GitHub Pages without a server. After publishing the site, submit one test message and confirm the activation email FormSubmit sends to that inbox. Future messages will then be delivered normally.

The `backend` directory is also included if you later want a custom Express API that stores messages in MongoDB.

## Publish the easy form

1. Upload the updated `index.html`, `script.js`, `config.js`, and `style.css` to the GitHub repository.
2. Wait for GitHub Pages to publish the update.
3. Submit a test message from the website.
4. Open the activation email sent to `coder.singhg007@gmail.com` and approve it. Do this only once.

## Optional custom backend

## Run locally

1. Create a MongoDB Atlas database and copy its connection string.
2. In `backend`, copy `.env.example` to `.env` and set every value. For Gmail, create an **App Password** (not your normal Gmail password) and use it as `SMTP_PASS`.
3. Run:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. If you choose this custom backend later, change `config.js` and `script.js` to point at it instead of FormSubmit.

## Deploy

1. Push this repository to GitHub.
2. Create a MongoDB Atlas free cluster and allow your API host to connect.
3. Deploy the `backend` directory to Render as a Web Service:
   - Build command: `npm install`
   - Start command: `npm start`
   - Add all variables from `.env.example` in Render's environment settings; do **not** commit `.env`.
4. Set `FRONTEND_ORIGIN` to `https://garvsinghdevops.github.io`.
5. Connect the deployed API to the frontend when you are ready to use the custom backend.

## Security included

- server-side validation and request size limit
- MongoDB persistence with timestamps
- SMTP notification with the visitor's email as `Reply-To`
- CORS limited to the portfolio origin
- security headers, rate limit (5 attempts per 15 minutes), and a hidden bot honeypot
