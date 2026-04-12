"use client";

import { useTranslations } from "@/store/languageStore";

const QUICK_LINKS = ["DSHE", "BANBEIS", "BD National Portal", "Ministry of Education", "Sylhet Board"];

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="mt-auto w-full bg-gray-50 text-gray-700 border-t-4 border-purple-800">
      {/* Main footer grid */}
      <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-3 gap-7">

        {/* School info */}
        <div className="flex flex-col items-start gap-4">
          <img
            src="/images/logo1.png"
            alt="School Logo"
            className="w-20 h-20 object-contain rounded-lg shadow-sm"
          />
          <h3 className="text-purple-800 text-2xl font-bold leading-tight m-0">
            {t("schoolName")}
          </h3>
          <p className="flex items-center gap-2 text-sm text-gray-500 my-1">
            <span>📞</span> {t("footer.contact")}: 01997588476
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-500 my-1">
            <span>✉️</span> {t("footer.email")}: merajislam2349@gmail.com
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-500 my-1">
            <span>📍</span> {t("location")}
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-purple-800 text-xl font-semibold m-0 pb-2 border-b-2 border-purple-800">
            {t("footer.quickLinks")}
          </h4>
          <ul className="list-none p-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_LINKS.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="flex items-center text-gray-600 no-underline text-sm px-3 py-2 rounded-md w-full transition-all duration-300 hover:text-purple-800 hover:bg-purple-50 hover:translate-x-1"
                >
                  <span className="text-purple-800 text-xs mr-2">▶</span>
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Maintained by */}
        <div className="flex flex-col items-center text-center gap-4">
          <h4 className="text-purple-800 text-xl font-semibold m-0">{t("footer.maintainedBy")}</h4>
          <img
            src="/images/sustLogo.png"
            alt="SUST Logo"
            className="w-28 h-auto object-contain rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-purple-800 text-white px-5 py-5 flex flex-wrap justify-between items-center gap-4">
        <p className="m-0 text-sm font-medium">{t("footer.developedBy")}</p>
        <p className="m-0 text-sm font-semibold text-yellow-300">{t("footer.helpline")}</p>
      </div>
    </footer>
  );
}
