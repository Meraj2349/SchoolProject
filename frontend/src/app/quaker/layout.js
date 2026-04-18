"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";

export default function QuakerLayout({ children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <LatestUpdatesNotice />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
