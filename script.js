const hamburger = document.querySelector(".hamburger")

const navLinks = document.querySelector(".nav-links")

hamburger.addEventListener("click",() =>{
    navLinks.classList.toggle("active")
});

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const sendButton = document.querySelector("#send-message-button");

contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    const endpoint = window.CONTACT_FORM_ENDPOINT;
    if (!endpoint || endpoint.includes("your-email")) {
        formStatus.textContent = "The contact service is not configured yet.";
        formStatus.className = "form-status error";
        return;
    }

    const data = Object.fromEntries(new FormData(contactForm).entries());
    sendButton.disabled = true;
    sendButton.textContent = "Sending...";
    formStatus.textContent = "";
    formStatus.className = "form-status";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: new FormData(contactForm)
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.message || "Unable to send your message. Please try again.");
        }

        contactForm.reset();
        formStatus.textContent = result.message || "Thanks! Your message has been sent.";
        formStatus.className = "form-status success";
    } catch (error) {
        formStatus.textContent = error.message || "Unable to send your message. Please try again.";
        formStatus.className = "form-status error";
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = "Send Message";
    }
});
