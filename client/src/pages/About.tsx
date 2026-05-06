// Navbar rendered globally via AuthenticatedLayout
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="page-shell">
      <section className="page-hero page-hero-about">
        <div className="container page-hero-grid">
          <div>
            <p className="section-kicker">About us</p>
            <h1>Build hiring journeys that feel clear and human.</h1>
            <p>
              CareerSync AI helps employers publish better roles and helps candidates apply with confidence.
            </p>
          </div>
          <div className="hero-panel hero-panel-image" />
        </div>
      </section>

      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-kicker">How it works</p>
              <h2>Simple steps for candidates and employers</h2>
            </div>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span>01</span>
              <h3>Create account</h3>
              <p>Set up your profile in minutes and keep your details ready for future applications.</p>
            </article>
            <article className="step-card">
              <span>02</span>
              <h3>Upload resume</h3>
              <p>Add your CV, portfolio, or supporting document so employers can review your background.</p>
            </article>
            <article className="step-card">
              <span>03</span>
              <h3>Find jobs</h3>
              <p>Search active roles across categories, locations, and employers in one place.</p>
            </article>
            <article className="step-card">
              <span>04</span>
              <h3>Apply job</h3>
              <p>Submit your application and keep track of opportunities directly from the platform.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="trust-section about-trust">
        <div className="container trust-grid trust-grid-reverse">
          <div className="trust-copy">
            <p className="section-kicker">We’re only working with the best</p>
            <h2>People-first hiring for serious employers</h2>
            <p>
              We prioritize job quality, strong resumes, and reliable hiring workflows so both sides save time.
            </p>
            <div className="trust-points">
              <span>Quality jobs</span>
              <span>Resume builders</span>
              <span>Top companies</span>
              <span>Top talents</span>
            </div>
          </div>
          <div className="trust-gallery trust-gallery-wide">
            <div className="trust-block trust-block-wide" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
