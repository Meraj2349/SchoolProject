import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import HeroSection from "./HeroSection";
import LeadershipSection from "./LeadershipSection";
import ClassStatistics from "./ClassStatistics";
import "@/styles/Homepage.css";

export default function HomePage() {
  return (
    <div className="school-website">
      <Navbar />
      <LatestUpdatesNotice />
      <HeroSection />
      <LeadershipSection />
      <ClassStatistics />
      <Footer />
    </div>
  );
}
