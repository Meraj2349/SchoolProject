"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { applicationService } from "@/services/application.service";
import { useTranslations } from "@/store/languageStore";

const EMPTY = {
  applicant_name: "",
  date_of_birth: "",
  gender: "",
  applying_for_class: "",
  previous_school: "",
  previous_class: "",
  parent_name: "",
  parent_contact: "",
  parent_email: "",
  address: "",
  additional_info: "",
};

const REQUIRED = [
  "applicant_name",
  "date_of_birth",
  "gender",
  "applying_for_class",
  "parent_name",
  "parent_contact",
];

const inputCls = (hasError) =>
  `w-full px-3.5 py-2.5 border-[1.5px] rounded-[7px] text-[0.95rem] text-gray-900 bg-white transition-all duration-200 box-border focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] ${
    hasError ? "border-red-500" : "border-gray-300"
  }`;

export default function OnlineApplyPage() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const t = useTranslations("apply");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const validate = () => {
    const newErrors = {};
    REQUIRED.forEach((field) => {
      if (!form[field] || !form[field].trim()) newErrors[field] = true;
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError(t("requiredFields"));
      return;
    }
    setSubmitting(true);
    try {
      await applicationService.submit(form);
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || err.message || t("submitFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY);
    setErrors({});
    setSubmitError("");
    setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <LatestUpdatesNotice />

      {/* Header */}
      <div
        className="text-white text-center px-4 py-12"
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
        }}
      >
        <h1 className="text-3xl font-bold m-0 mb-2">{t("pageTitle")}</h1>
        <p className="text-[1.05rem] opacity-90 m-0">{t("pageSubtitle")}</p>
      </div>

      {success ? (
        <div className="max-w-[540px] mx-auto my-12 bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-[3.5rem] mb-4">✅</div>
          <h2 className="text-[1.6rem] font-bold text-green-800 m-0 mb-3">
            {t("successTitle")}
          </h2>
          <p className="text-gray-600 text-base m-0 mb-6 leading-relaxed">
            {t("successMessage")}
          </p>
          <button
            className="bg-blue-800 text-white border-none px-7 py-3 rounded-lg text-base font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
            onClick={handleReset}
          >
            {t("submitAnother")}
          </button>
        </div>
      ) : (
        <div className="max-w-[760px] mx-auto my-10 mb-12 px-4 w-full">
          <form
            className="bg-white rounded-xl shadow-lg px-8 py-10 max-sm:px-4 max-sm:py-6"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {/* Applicant name — full width */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="applicant_name"
                >
                  {t("applicantName")}{" "}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  id="applicant_name"
                  name="applicant_name"
                  type="text"
                  className={inputCls(errors.applicant_name)}
                  value={form.applicant_name}
                  onChange={handleChange}
                />
              </div>

              {/* Date of birth */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="date_of_birth"
                >
                  {t("dateOfBirth")}{" "}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  className={inputCls(errors.date_of_birth)}
                  value={form.date_of_birth}
                  onChange={handleChange}
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="gender"
                >
                  {t("gender")} <span className="text-red-500 ml-0.5">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  className={inputCls(errors.gender)}
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">—</option>
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                  <option value="other">{t("other")}</option>
                </select>
              </div>

              {/* Applying for class */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="applying_for_class"
                >
                  {t("applyingForClass")}{" "}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  id="applying_for_class"
                  name="applying_for_class"
                  type="text"
                  className={inputCls(errors.applying_for_class)}
                  value={form.applying_for_class}
                  onChange={handleChange}
                />
              </div>

              {/* Previous school */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="previous_school"
                >
                  {t("previousSchool")}
                </label>
                <input
                  id="previous_school"
                  name="previous_school"
                  type="text"
                  className={inputCls(false)}
                  value={form.previous_school}
                  onChange={handleChange}
                />
              </div>

              {/* Previous class */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="previous_class"
                >
                  {t("previousClass")}
                </label>
                <input
                  id="previous_class"
                  name="previous_class"
                  type="text"
                  className={inputCls(false)}
                  value={form.previous_class}
                  onChange={handleChange}
                />
              </div>

              {/* Divider */}
              <hr className="sm:col-span-2 border-none border-t-[1.5px] border-gray-200 my-1" />

              {/* Parent name */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="parent_name"
                >
                  {t("parentName")}{" "}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  id="parent_name"
                  name="parent_name"
                  type="text"
                  className={inputCls(errors.parent_name)}
                  value={form.parent_name}
                  onChange={handleChange}
                />
              </div>

              {/* Parent contact */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="parent_contact"
                >
                  {t("parentContact")}{" "}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  id="parent_contact"
                  name="parent_contact"
                  type="tel"
                  className={inputCls(errors.parent_contact)}
                  value={form.parent_contact}
                  onChange={handleChange}
                />
              </div>

              {/* Parent email — full width */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="parent_email"
                >
                  {t("parentEmail")}
                </label>
                <input
                  id="parent_email"
                  name="parent_email"
                  type="email"
                  className={inputCls(false)}
                  value={form.parent_email}
                  onChange={handleChange}
                />
              </div>

              {/* Address — full width */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="address"
                >
                  {t("address")}
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-300 rounded-[7px] text-[0.95rem] text-gray-900 bg-white resize-y min-h-[90px] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all duration-200"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              {/* Additional info — full width */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold text-gray-700"
                  htmlFor="additional_info"
                >
                  {t("additionalInfo")}
                </label>
                <textarea
                  id="additional_info"
                  name="additional_info"
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-300 rounded-[7px] text-[0.95rem] text-gray-900 bg-white resize-y min-h-[90px] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all duration-200"
                  value={form.additional_info}
                  onChange={handleChange}
                />
              </div>
            </div>

            {submitError && (
              <div className="mt-5 px-4 py-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
                {submitError}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-800 text-white border-none px-9 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-700 disabled:opacity-65 disabled:cursor-not-allowed"
              >
                {submitting ? t("submitting") : t("submitBtn")}
              </button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}
