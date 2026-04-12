"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { applicationService } from "@/services/application.service";
import { useTranslations } from "@/store/languageStore";
import "@/styles/OnlineApplyPage.css";

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const validate = () => {
    const newErrors = {};
    REQUIRED.forEach((field) => {
      if (!form[field] || !form[field].trim()) {
        newErrors[field] = true;
      }
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
      const msg =
        err?.response?.data?.message || err.message || t("submitFailed");
      setSubmitError(msg);
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
    <div className="apply-page">
      <Navbar />
      <LatestUpdatesNotice />

      <div className="apply-header">
        <h1>{t("pageTitle")}</h1>
        <p>{t("pageSubtitle")}</p>
      </div>

      {success ? (
        <div className="apply-success">
          <div className="success-icon">✅</div>
          <h2>{t("successTitle")}</h2>
          <p>{t("successMessage")}</p>
          <button className="btn-another" onClick={handleReset}>
            {t("submitAnother")}
          </button>
        </div>
      ) : (
        <div className="apply-form-wrapper">
          <form className="apply-form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid-2">
              {/* Applicant name */}
              <div className="form-group form-full">
                <label className="form-label" htmlFor="applicant_name">
                  {t("applicantName")} <span className="required-star">*</span>
                </label>
                <input
                  id="applicant_name"
                  name="applicant_name"
                  type="text"
                  className={`form-input${errors.applicant_name ? " input-error" : ""}`}
                  value={form.applicant_name}
                  onChange={handleChange}
                />
              </div>

              {/* Date of birth */}
              <div className="form-group">
                <label className="form-label" htmlFor="date_of_birth">
                  {t("dateOfBirth")} <span className="required-star">*</span>
                </label>
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  className={`form-input${errors.date_of_birth ? " input-error" : ""}`}
                  value={form.date_of_birth}
                  onChange={handleChange}
                />
              </div>

              {/* Gender */}
              <div className="form-group">
                <label className="form-label" htmlFor="gender">
                  {t("gender")} <span className="required-star">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  className={`form-select${errors.gender ? " input-error" : ""}`}
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
              <div className="form-group">
                <label className="form-label" htmlFor="applying_for_class">
                  {t("applyingForClass")}{" "}
                  <span className="required-star">*</span>
                </label>
                <input
                  id="applying_for_class"
                  name="applying_for_class"
                  type="text"
                  className={`form-input${errors.applying_for_class ? " input-error" : ""}`}
                  value={form.applying_for_class}
                  onChange={handleChange}
                />
              </div>

              {/* Previous school */}
              <div className="form-group">
                <label className="form-label" htmlFor="previous_school">
                  {t("previousSchool")}
                </label>
                <input
                  id="previous_school"
                  name="previous_school"
                  type="text"
                  className="form-input"
                  value={form.previous_school}
                  onChange={handleChange}
                />
              </div>

              {/* Previous class */}
              <div className="form-group">
                <label className="form-label" htmlFor="previous_class">
                  {t("previousClass")}
                </label>
                <input
                  id="previous_class"
                  name="previous_class"
                  type="text"
                  className="form-input"
                  value={form.previous_class}
                  onChange={handleChange}
                />
              </div>

              <hr className="form-section-divider" />

              {/* Parent name */}
              <div className="form-group">
                <label className="form-label" htmlFor="parent_name">
                  {t("parentName")} <span className="required-star">*</span>
                </label>
                <input
                  id="parent_name"
                  name="parent_name"
                  type="text"
                  className={`form-input${errors.parent_name ? " input-error" : ""}`}
                  value={form.parent_name}
                  onChange={handleChange}
                />
              </div>

              {/* Parent contact */}
              <div className="form-group">
                <label className="form-label" htmlFor="parent_contact">
                  {t("parentContact")} <span className="required-star">*</span>
                </label>
                <input
                  id="parent_contact"
                  name="parent_contact"
                  type="tel"
                  className={`form-input${errors.parent_contact ? " input-error" : ""}`}
                  value={form.parent_contact}
                  onChange={handleChange}
                />
              </div>

              {/* Parent email */}
              <div className="form-group form-full">
                <label className="form-label" htmlFor="parent_email">
                  {t("parentEmail")}
                </label>
                <input
                  id="parent_email"
                  name="parent_email"
                  type="email"
                  className="form-input"
                  value={form.parent_email}
                  onChange={handleChange}
                />
              </div>

              {/* Address */}
              <div className="form-group form-full">
                <label className="form-label" htmlFor="address">
                  {t("address")}
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="form-textarea"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              {/* Additional info */}
              <div className="form-group form-full">
                <label className="form-label" htmlFor="additional_info">
                  {t("additionalInfo")}
                </label>
                <textarea
                  id="additional_info"
                  name="additional_info"
                  className="form-textarea"
                  value={form.additional_info}
                  onChange={handleChange}
                />
              </div>
            </div>

            {submitError && <div className="apply-error">{submitError}</div>}

            <div className="apply-form-footer">
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
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
