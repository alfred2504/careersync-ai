import { type FormEvent, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { sendJobMessage } from "../services/messageService";

export default function Contact() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = `${firstName} ${lastName}`.trim();

    if (!fullName || !email || !message) {
      setError("Please enter your name, email, and message.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setStatus("");

      const response = await sendJobMessage({
        name: fullName,
        email,
        phone,
        message,
      });

      setStatus(response?.message || "Message sent successfully");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (submitError) {
      const submitMessage = submitError instanceof Error ? submitError.message : "Failed to send message";
      setError(submitMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <section className="page-hero page-hero-contact">
        <div className="container page-hero-grid">
          <div>
            <p className="section-kicker">Contact us</p>
            <h1>You grow, we succeed. Let’s talk.</h1>
            <p>
              Reach out for support, partnerships, job posting help, or platform feedback.
            </p>

            <div className="contact-summary">
              <div>
                <span>Call for inquiry</span>
                <strong>+263 71 699 7735</strong>
              </div>
              <div>
                <span>Send us email</span>
                <strong><a href="mailto:inforamaiv@gmail.com">inforamaiv@gmail.com</a></strong>
              </div>
              <div>
                <span>Opening hours</span>
                <strong>Mon - Fri: 10AM - 5PM</strong>
              </div>
              <div>
                <span>Office</span>
                <strong>19 North Road, Harare, Zimbabwe</strong>
              </div>
            </div>
          </div>

          <div className="contact-card">
            <h2>Contact info</h2>
            <p>Ask us anything and we’ll get back to you as soon as possible.</p>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-row">
                <input
                  className="search-input"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
                <input
                  className="search-input"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
              <input
                className="search-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <input
                className="search-input"
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              <textarea
                className="search-input message-area"
                placeholder="Write your message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <button className="btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send message"}
              </button>
              {status ? <p className="detail-card-note success-text">{status}</p> : null}
              {error ? <p className="detail-card-note error-text">{error}</p> : null}
            </form>
          </div>
        </div>
      </section>

      <section className="map-section">
        <div className="container">
          <div className="map-card">
            <div className="map-card-copy">
              <h2>Visit our office</h2>
              <p>We’re based in Harare and available for support during weekday business hours.</p>
            </div>
            <div className="map-placeholder" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
