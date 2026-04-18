"use client";

import { useTranslations } from "@/store/languageStore";
import useScrollReveal from "@/hooks/useScrollReveal";
import Image from "next/image";

const QUICK_LINKS = [
  "DSHE",
  "BANBEIS",
  "BD National Portal",
  "Ministry of Education",
  "Sylhet Board",
];

export default function Footer() {
  const t = useTranslations();
  const footerRef = useScrollReveal(0.05);

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden mt-auto w-full border-t-[3px] border-[#4b2e83] bg-gray-100 text-gray-700"
    >
      {/* Top accent gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, #4b2e83 0%, #7c3aed 40%, #10b981 70%, #059669 100%)",
        }}
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr_1.5fr] gap-8 max-w-[1200px] mx-auto px-5 py-10">
        {/* School info */}
        <div className="flex flex-col items-start gap-4 max-md:items-center max-md:text-center">
          <div className="relative inline-block">
            <Image
              src="/images/logo1.png"
              alt="School Logo"
              width={80}
              height={80}
              className="object-contain rounded-lg shadow-md transition-transform duration-300 hover:scale-110 hover:-rotate-2"
            />
          </div>

          <h3 className="text-[#4b2e83] text-2xl font-bold m-0 leading-snug">
            {t("schoolName")}
          </h3>

          <div className="flex flex-col gap-1.5">
            {[
              { icon: "📞", label: t("footer.contact"), value: "01997588476" },
              {
                icon: "✉️",
                label: t("footer.email"),
                value: "merajislam2349@gmail.com",
              },
              { icon: "📍", label: null, value: t("location") },
            ].map((item, i) => (
              <p
                key={i}
                className="m-0 text-gray-500 text-[0.9rem] flex items-start gap-1.5"
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {item.label && (
                  <strong className="text-gray-700 mr-0.5">
                    {item.label}:
                  </strong>
                )}
                {item.value}
              </p>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-[#4b2e83] text-xl font-semibold m-0 mb-4 border-b-2 border-[#4b2e83] pb-2 max-md:text-center">
            {t("footer.quickLinks")}
          </h4>
          <ul className="list-none p-0 m-0 grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-gray-500 no-underline text-[0.9rem] px-3 py-2 rounded-md transition-all duration-300 inline-block w-full box-border relative overflow-hidden hover:text-[#4b2e83] hover:bg-[rgba(75,46,131,0.1)] hover:translate-x-1 hover:shadow-md focus:outline-[#4b2e83] focus:outline-2 focus:outline-offset-2 before:content-['▶'] before:text-[0.7rem] before:mr-2 before:text-[#4b2e83]"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Maintained by */}
        <div className="flex flex-col items-center text-center gap-4 max-md:-order-1">
          <h4 className="text-[#4b2e83] text-xl font-semibold m-0">
            {t("footer.maintainedBy")}
          </h4>
          <Image
            src="/images/sustLogo.png"
            alt="SUST Logo"
            width={140}
            height={140}
            className="object-contain rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="flex justify-between items-center flex-wrap gap-4 px-5 py-5 text-white max-md:flex-col max-md:text-center"
        style={{
          background: "linear-gradient(135deg, #4b2e83 0%, #3b1f6e 100%)",
        }}
      >
        <p className="m-0 text-[0.9rem] font-medium text-white">
          {t("footer.developedBy")}
        </p>
        <p className="m-0 text-[0.9rem] font-bold text-yellow-400">
          {t("footer.helpline")}
        </p>
      </div>
    </footer>
  );
}
