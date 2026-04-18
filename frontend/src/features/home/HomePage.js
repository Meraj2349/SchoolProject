import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import HeroSection from "./HeroSection";
import LeadershipSection from "./LeadershipSection";
import AchievementsSection from "./AchievementsSection";
import ClassStatistics from "./ClassStatistics";

export default function HomePage() {
  return (
    <div className="font-sans text-gray-900 min-h-screen scroll-smooth">
      <Navbar />
      <LatestUpdatesNotice />
      <main>
        <HeroSection />
        <LeadershipSection />
        <AchievementsSection />
        <ClassStatistics />
      </main>
      <Footer />
    </div>
  );
}
