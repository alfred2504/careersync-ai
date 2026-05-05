import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">CareerSync AI</div>
          <p className="footer-copy">
            Find, track, and apply for jobs with a simple platform built for both job seekers and employers.
          </p>
        </div>

        <div>
          <h3>Company</h3>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Our Team</Link></li>
            <li><Link to="/register">Partners</Link></li>
            <li><Link to="/login">For Candidates</Link></li>
            <li><Link to="/register">For Employers</Link></li>
          </ul>
        </div>

        <div>
          <h3>Job Categories</h3>
          <ul>
            <li><Link to="/jobs">Telecommunications</Link></li>
            <li><Link to="/jobs">Hotels & Tourism</Link></li>
            <li><Link to="/jobs">Construction</Link></li>
            <li><Link to="/jobs">Education</Link></li>
            <li><Link to="/jobs">Financial Services</Link></li>
          </ul>
        </div>

        <div>
          <h3>Newsletter</h3>
          <p className="footer-copy">Stay updated with new job postings and platform updates.</p>
          <input className="footer-input" type="email" placeholder="Email Address" />
          <button className="btn footer-btn" type="button">Subscribe now</button>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© Copyright AmakTech 2026</p>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}