import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function Navbar() {
  const { language, changeLanguage } = useLanguage();

  const isTamil = language === "ta";

  return (
    <nav className="navbar">

      <div className="navbar-container">

        <Link to="/" className="navbar-logo">
          SkillConnect
        </Link>

        <div className="navbar-links">

          <Link to="/">
            {isTamil ? "முகப்பு" : "Home"}
          </Link>

          <a href="#services">
            {isTamil ? "சேவைகள்" : "Services"}
          </a>

          <a href="#how-it-works">
            {isTamil ? "எப்படி செயல்படுகிறது" : "How It Works"}
          </a>

          <a href="#about">
            {isTamil ? "எங்களைப் பற்றி" : "About"}
          </a>

        </div>

        <div className="navbar-actions">

          <div className="language-switch">

            <button
              className={language === "en" ? "active-language" : ""}
              onClick={() => changeLanguage("en")}
            >
              EN
            </button>

            <span>|</span>

            <button
              className={language === "ta" ? "active-language" : ""}
              onClick={() => changeLanguage("ta")}
            >
              தமிழ்
            </button>

          </div>

          <Link to="/login" className="login-button">
            {isTamil ? "உள்நுழை" : "Login"}
          </Link>

          <Link to="/register" className="register-button">
            {isTamil ? "தொடங்குங்கள்" : "Get Started"}
          </Link>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;