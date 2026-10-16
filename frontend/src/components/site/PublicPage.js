import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";

/** The shell every public page shares: header, notice ticker, main content and footer. */
export default function PublicPage({ children, className = "" }) {
  return (
    <div className="flex min-h-screen flex-col bg-white font-school-body">
      <Navbar />
      <LatestUpdatesNotice />
      <main id="main" className={`flex-1 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
