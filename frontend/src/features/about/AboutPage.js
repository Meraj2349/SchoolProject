"use client";

import { Map } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useTranslations } from "@/store/languageStore";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <LatestUpdatesNotice />

      {/* About section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {t("title")}
            </h2>
            <p className="text-lg text-gray-500 max-w-[600px] mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 items-start mt-8">
            <div className="relative rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1">
              <Image
                src="/images/School Gate Picture.jpg"
                alt="School"
                width={800}
                height={600}
                className="w-full h-auto object-cover rounded-xl transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="py-4">
              <p className="text-lg leading-relaxed text-gray-500 mb-6 text-justify">
                {t("body1")}
              </p>
              <p className="text-lg leading-relaxed text-gray-500 text-justify">
                {t("body2")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12 flex flex-col items-center gap-4">
            <Map className="w-12 h-12 text-blue-600" />
            <h2 className="text-4xl font-bold text-gray-900 m-0">
              {t("visitTitle")}
            </h2>
            <p className="text-lg text-gray-500 max-w-[600px] mx-auto leading-relaxed">
              {t("locationSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 mt-8">
            <div className="rounded-xl overflow-hidden shadow-lg h-[400px] md:h-[400px] transition-transform duration-300 hover:-translate-y-1">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3642.0098647768087!2d90.01732967589534!3d24.174524126251374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375601dc523374e5%3A0xb6e0a55e11d5c5ce!2sStar%20Academic%20School!5e0!3m2!1sen!2sbd!4v1690095436935!5m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Star Academic School Location"
              />
            </div>
            <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-blue-600 text-2xl font-bold mb-6">
                {t("getInTouch")}
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: t("address"), value: t("addressValue") },
                  { label: t("phone"), value: "01997588476" },
                  { label: t("emailLabel"), value: "merajislam2349@gmail.com" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="py-3 border-b border-gray-200 last:border-0"
                  >
                    <strong className="text-gray-900 block mb-1 text-sm font-semibold">
                      {item.label}:
                    </strong>
                    <p className="text-gray-500 m-0 text-[0.95rem] leading-relaxed">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
