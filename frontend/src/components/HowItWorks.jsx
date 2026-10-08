import { useLanguage } from "../context/LanguageContext";

function HowItWorks() {
  const { language } = useLanguage();

  const isTamil = language === "ta";

  const steps = [
    {
      number: "01",
      icon: "🔍",
      titleEnglish: "Find a Service",
      titleTamil: "ஒரு சேவையைத் தேர்வு செய்யுங்கள்",
      descriptionEnglish:
        "Choose the service you need from our wide range of skilled professionals.",
      descriptionTamil:
        "உங்களுக்குத் தேவையான சேவையை திறமையான நிபுணர்களின் பட்டியலில் இருந்து தேர்வு செய்யுங்கள்.",
    },
    {
      number: "02",
      icon: "👨‍🔧",
      titleEnglish: "Choose a Worker",
      titleTamil: "தொழிலாளரைத் தேர்வு செய்யுங்கள்",
      descriptionEnglish:
        "View available workers, their skills, ratings and experience before choosing.",
      descriptionTamil:
        "தொழிலாளர்களின் திறன்கள், மதிப்பீடுகள் மற்றும் அனுபவத்தைப் பார்த்து தேர்வு செய்யுங்கள்.",
    },
    {
      number: "03",
      icon: "📅",
      titleEnglish: "Book the Service",
      titleTamil: "சேவையை முன்பதிவு செய்யுங்கள்",
      descriptionEnglish:
        "Select a convenient date and time and book the service easily.",
      descriptionTamil:
        "உங்களுக்கு வசதியான தேதி மற்றும் நேரத்தைத் தேர்வு செய்து சேவையை எளிதாக முன்பதிவு செய்யுங்கள்.",
    },
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="section-container">

        <div className="section-heading">

          <span className="section-label">
            {isTamil ? "எப்படி செயல்படுகிறது" : "How It Works"}
          </span>

          <h2>
            {isTamil
              ? "சேவையைப் பெறுவது மிகவும் எளிதானது"
              : "Getting a Service Is Simple"}
          </h2>

          <p>
            {isTamil
              ? "SkillConnect மூலம் சரியான நிபுணரை சில எளிய படிகளில் கண்டறியுங்கள்."
              : "Find the right professional through SkillConnect in just a few simple steps."}
          </p>

        </div>

        <div className="steps-container">

          {steps.map((step, index) => (
            <div className="step-wrapper" key={step.number}>

              <div className="step-card">

                <div className="step-top">

                  <span className="step-number">
                    {step.number}
                  </span>

                  <div className="step-icon">
                    {step.icon}
                  </div>

                </div>

                <h3>
                  {isTamil
                    ? step.titleTamil
                    : step.titleEnglish}
                </h3>

                <p>
                  {isTamil
                    ? step.descriptionTamil
                    : step.descriptionEnglish}
                </p>

              </div>

              {index < steps.length - 1 && (
                <div className="step-arrow">
                  →
                </div>
              )}

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default HowItWorks;