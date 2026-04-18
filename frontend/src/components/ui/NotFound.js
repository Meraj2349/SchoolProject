"use client";

import Link from "next/link";
import { useTranslations } from "@/store/languageStore";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 text-center p-8">
      <div className="max-w-[600px]">
        <h1 className="text-9xl m-0 text-red-600">404</h1>
        <h2 className="text-3xl mt-0">{t("title")}</h2>
        <p className="text-lg mb-8">{t("subtitle")}</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white no-underline rounded-md transition-colors duration-200 hover:bg-blue-700"
        >
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
