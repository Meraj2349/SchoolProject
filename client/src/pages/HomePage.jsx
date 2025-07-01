import "../assets/styles/Homepage.css";
import ClassStatistics from "../components/ClassStatistics";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import LeadershipSection from "../components/LeadershipSection";
import Navbar from "../components/Navbar";

export default function SchoolWebsite() {
  // JSX to render the component
  return (
    <div className="school-website">
      <Navbar />

      <HeroSection />

      <LeadershipSection />

      <ClassStatistics/>

      {/* Rendering the footer */}
      <Footer />
    </div>
  );
}
