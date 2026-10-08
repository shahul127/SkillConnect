import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ServicesSection from "../components/ServicesSection";
import HowItWorks from "../components/HowItWorks";

function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <ServicesSection />

        <HowItWorks />
      </main>
    </>
  );
}

export default Home;