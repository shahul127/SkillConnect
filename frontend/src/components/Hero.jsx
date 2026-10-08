import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function Hero() {
  const { language } = useLanguage();

  const isTamil = language === "ta";

  return (
    <section className="hero">

      <div className="hero-container">

        <div className="hero-content">

          <div className="hero-badge">
            {isTamil
              ? "நம்பகமான சேவைகள் • திறமையான தொழிலாளர்கள்"
              : "Trusted Services • Skilled Professionals"}
          </div>

          <h1>
            {isTamil ? (
              <>
                உங்கள் தேவைக்கு
                <span> சரியான தொழிலாளரை </span>
                கண்டறியுங்கள்
              </>
            ) : (
              <>
                Find the Right
                <span> Skilled Worker </span>
                for Your Needs
              </>
            )}
          </h1>

          <p>
            {isTamil
              ? "உங்களுக்கு தேவையான சேவைகளை வழங்கும் நம்பகமான மற்றும் திறமையான தொழிலாளர்களுடன் எளிதாக இணையுங்கள்."
              : "Connect with trusted and skilled professionals for your everyday service needs. Find the right person for the job, right near you."}
          </p>

          <div className="hero-buttons">

            <Link to="/login" className="hero-primary-button">
              {isTamil ? "தொழிலாளரைக் கண்டறியுங்கள்" : "Find a Worker"}
            </Link>

            <Link to="/register" className="hero-secondary-button">
              {isTamil ? "தொழிலாளராக இணையுங்கள்" : "Become a Worker"}
            </Link>

          </div>

          <div className="hero-trust">

            <div>
              <strong>✓</strong>
              <span>
                {isTamil ? "சரிபார்க்கப்பட்ட தொழிலாளர்கள்" : "Verified Workers"}
              </span>
            </div>

            <div>
              <strong>✓</strong>
              <span>
                {isTamil ? "அருகிலுள்ள சேவைகள்" : "Nearby Services"}
              </span>
            </div>

            <div>
              <strong>✓</strong>
              <span>
                {isTamil ? "எளிதான முன்பதிவு" : "Easy Booking"}
              </span>
            </div>

          </div>

        </div>

        <div className="hero-visual">

          <div className="hero-card">

            <div className="hero-card-icon">
              🔧
            </div>

            <h3>
              {isTamil ? "திறமையான தொழிலாளர்கள்" : "Skilled Professionals"}
            </h3>

            <p>
              {isTamil
                ? "உங்களுக்கு அருகிலுள்ள நிபுணர்களைக் கண்டறியுங்கள்"
                : "Find professionals near you"}
            </p>

            <div className="hero-mini-card">

              <div className="mini-avatar">
                👨‍🔧
              </div>

              <div>
                <strong>
                  {isTamil ? "மின்சார நிபுணர்" : "Electrician"}
                </strong>

                <small>
                  ★ 4.8 • {isTamil ? "சரிபார்க்கப்பட்டது" : "Verified"}
                </small>
              </div>

            </div>

            <div className="hero-mini-card">

              <div className="mini-avatar">
                👨‍🔧
              </div>

              <div>
                <strong>
                  {isTamil ? "பிளம்பர்" : "Plumber"}
                </strong>

                <small>
                  ★ 4.9 • {isTamil ? "சரிபார்க்கப்பட்டது" : "Verified"}
                </small>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;