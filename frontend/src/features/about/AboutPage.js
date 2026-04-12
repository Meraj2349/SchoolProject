"use client";

import { Map } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useTranslations } from "@/store/languageStore";
import "@/styles/AboutPage-clean.css";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="about-page">
      <Navbar />
      <LatestUpdatesNotice />
      <section className="about-section">
        <div className="container">
          <div className="section-intro">
            <h2 className="section-title">{t("title")}</h2>
            <p className="section-subtitle">{t("subtitle")}</p>
          </div>
          <div className="about-content">
            <div className="about-image-container">
              <img
                src="/images/School Gate Picture.jpg"
                alt="School"
                className="school-image"
              />
            </div>
            <div className="about-text">
              <p>{t("body1")}</p>
              <p>{t("body2")}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="location-section">
        <div className="container">
          <div className="section-header">
            <Map className="section-icon" />
            <h2>{t("visitTitle")}</h2>
            <p className="section-subtitle">{t("locationSubtitle")}</p>
          </div>
          <div className="location-content">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3642.0098647768087!2d90.01732967589534!3d24.174524126251374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375601dc523374e5%3A0xb6e0a55e11d5c5ce!2sStar%20Academic%20School!5e0!3m2!1sen!2sbd!4v1690095436935!5m2!1sen!2sbd"
                width="100%"
                height="450"
                style={{ border: 0, borderRadius: 8 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Star Academic School Location"
              />
            </div>
            <div className="contact-info">
              <h3>{t("getInTouch")}</h3>
              <div className="contact-details">
                <div className="contact-item">
                  <strong>{t("address")}:</strong>
                  <p>{t("addressValue")}</p>
                </div>
                <div className="contact-item">
                  <strong>{t("phone")}:</strong>
                  <p>01997588476</p>
                </div>
                <div className="contact-item">
                  <strong>{t("emailLabel")}:</strong>
                  <p>merajislam2349@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
