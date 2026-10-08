import { useLanguage } from "../context/LanguageContext";

function ServicesSection() {
  const { language } = useLanguage();

  const isTamil = language === "ta";

  const services = [
    {
      icon: "⚡",
      english: "Electrician",
      tamil: "மின்சார நிபுணர்",
      descriptionEnglish: "Electrical installation and repair",
      descriptionTamil: "மின்சார நிறுவல் மற்றும் பழுது நீக்கம்",
    },
    {
      icon: "🔧",
      english: "Plumber",
      tamil: "பிளம்பர்",
      descriptionEnglish: "Plumbing installation and repair",
      descriptionTamil: "குழாய் நிறுவல் மற்றும் பழுது நீக்கம்",
    },
    {
      icon: "🪚",
      english: "Carpenter",
      tamil: "தச்சர்",
      descriptionEnglish: "Furniture and woodwork services",
      descriptionTamil: "தளபாடங்கள் மற்றும் மரவேலை சேவைகள்",
    },
    {
      icon: "❄️",
      english: "AC Technician",
      tamil: "AC தொழில்நுட்ப நிபுணர்",
      descriptionEnglish: "AC installation and servicing",
      descriptionTamil: "AC நிறுவல் மற்றும் பராமரிப்பு",
    },
    {
      icon: "🎨",
      english: "Painter",
      tamil: "பெயிண்டர்",
      descriptionEnglish: "Home and commercial painting",
      descriptionTamil: "வீடு மற்றும் வணிக கட்டிட பெயிண்டிங்",
    },
    {
      icon: "🔨",
      english: "Mechanic",
      tamil: "மெக்கானிக்",
      descriptionEnglish: "Vehicle repair and maintenance",
      descriptionTamil: "வாகன பழுது மற்றும் பராமரிப்பு",
    },
  ];

  return (
    <section className="services-section" id="services">

      <div className="section-container">

        <div className="section-heading">

          <span className="section-label">
            {isTamil ? "எங்கள் சேவைகள்" : "Our Services"}
          </span>

          <h2>
            {isTamil
              ? "உங்களுக்கு தேவையான சேவையை கண்டறியுங்கள்"
              : "Find the Service You Need"}
          </h2>

          <p>
            {isTamil
              ? "உங்கள் அன்றாட தேவைகளுக்கான திறமையான நிபுணர்களை எளிதாக கண்டறியுங்கள்."
              : "Easily find skilled professionals for your everyday service needs."}
          </p>

        </div>

        <div className="services-grid">

          {services.map((service) => (

            <div className="service-card" key={service.english}>

              <div className="service-icon">
                {service.icon}
              </div>

              <h3>
                {isTamil ? service.tamil : service.english}
              </h3>

              <p>
                {isTamil
                  ? service.descriptionTamil
                  : service.descriptionEnglish}
              </p>

              <button className="service-link">
                {isTamil ? "மேலும் அறிக →" : "Learn More →"}
              </button>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default ServicesSection;