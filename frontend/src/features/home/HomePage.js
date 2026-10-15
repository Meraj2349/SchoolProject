import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import AdmissionBand from "./AdmissionBand";
import AnnouncementsSection from "./AnnouncementsSection";
import AtAGlance from "./AtAGlance";
import ClassStatistics from "./ClassStatistics";
import EventsNews from "./EventsNews";
import GalleryStrip from "./GalleryStrip";
import HeroSection from "./HeroSection";
import HonoursBoard from "./HonoursBoard";
import WelcomeSection from "./WelcomeSection";

/** The public home page, laid out like a classic school website. */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main id="main" className="flex-1">
        <HeroSection />
        <LatestUpdatesNotice />
        <AtAGlance />
        <HonoursBoard />
        <WelcomeSection />
        <EventsNews />
        <AnnouncementsSection />
        <GalleryStrip />
        <ClassStatistics />
        <AdmissionBand />
      </main>
      <Footer />
    </div>
  );
}
