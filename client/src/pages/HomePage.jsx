// Homepage.jsx (Updated)
import "../assets/styles/Homepage.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import LeadershipSection from "../components/LeadershipSection";
import logo from "../assets/images/logo.png";
import heroImage from "../assets/images/School Gate Picture.jpg";
import principalImage from "../assets/images/WhatsApp Image 2024-12-07 at 20.48.41_3423f492.jpg";
import chairmanImage from "../assets/images/photo.jpg";
import qrCodeImage from "../assets/images/photo.jpg";

export default function SchoolWebsite() {
  // Hero slides configuration
  const heroSlides = [
    {
      title: "Green by Design",
      subtitle: "Conservation begins on campus.",
      btnText: "LEARN MORE",
      btnLink: "/green-design",
      backgroundImage: null,
    },
    {
      title: "Excellence in Education",
      subtitle: "Preparing students for the future.",
      btnText: "DISCOVER",
      btnLink: "/education",
      backgroundImage: null,
    },
    {
      title: "Innovative Learning",
      subtitle: "Hands-on experiences for all ages.",
      btnText: "EXPLORE",
      btnLink: "/learning",
      backgroundImage: null,
    },
  ];

  // Leadership profiles configuration - Messages will be fetched from backend API
  const leadershipProfiles = [
    {
      image: principalImage,
      name: "Md.Rashedul Islam",
      title: "Chairman",
      // message will be fetched from backend (first message)
    },
  ];

  // Quick links configuration
  const quickLinksData = [
    { name: "Students", icon: "👥", color: "#2ecc71", path: "/students" },
    { name: "Teachers", icon: "🎓", color: "#e74c3c", path: "/teachers" },
    { name: "Attendance", icon: "✓", color: "#f39c12", path: "/attendance" },
    { name: "Result", icon: "📊", color: "#3498db", path: "/result" },
    { name: "Routine", icon: "📅", color: "#3498db", path: "/routine" },
    { name: "Download", icon: "⭐", color: "#f39c12", path: "/download" },
  ];

  return (
    <div className="school-website">
      <Navbar />

      <HeroSection
        slides={heroSlides}
        autoSlide={true}
        autoSlideInterval={5000}
        showScrollIndicator={true}
        showNavigation={true}
        heroImage={heroImage}
        overlayOpacity={0.4}
      />

      <LeadershipSection
        profiles={leadershipProfiles}
        qrCode={qrCodeImage}
        magazineTitle="Annual Magazine"
        magazineSubtitle="Uccharon-2024"
        quickLinks={quickLinksData}
        sectionTitle="Leadership & Quick Access"
      />

      <div className="footer">
        <Footer />
      </div>
    </div>
  );
}
