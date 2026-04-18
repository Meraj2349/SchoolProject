"use client";

import Link from "next/link";
import { useTranslations } from "@/store/languageStore";

export default function HeroSection() {
  const t = useTranslations();

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* Background image with Ken Burns zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/School Gate Picture.jpg')`,
          animation: "heroZoom 20s ease-in-out infinite alternate",
        }}
      />

      {/* Multi-layer gradient overlay — richer depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(170deg, rgba(2,44,34,0.78) 0%, rgba(4,64,51,0.65) 35%, rgba(0,0,0,0.82) 100%)",
        }}
      />

      {/* Radial glow — top-left warm accent */}
      <div
        className="absolute"
        style={{
          top: "-10%",
          left: "-8%",
          width: "55vw",
          height: "55vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Radial glow — bottom-right cool accent */}
      <div
        className="absolute"
        style={{
          bottom: "-12%",
          right: "-8%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(75,46,131,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Fine diagonal grid texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(255,255,255,0.025) 50px, rgba(255,255,255,0.025) 100px)",
          pointerEvents: "none",
        }}
      />

      {/* Floating decorative rings */}
      <div
        className="absolute"
        style={{
          top: "18%",
          right: "8%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.08)",
          animation: "floatRing 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "22%",
          right: "10%",
          width: 130,
          height: 130,
          borderRadius: "50%",
          border: "1px solid rgba(16,185,129,0.15)",
          animation: "floatRing 8s ease-in-out infinite 1.5s",
          pointerEvents: "none",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: "20%",
          left: "5%",
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.06)",
          animation: "floatRing 10s ease-in-out infinite 3s",
          pointerEvents: "none",
        }}
      />

      {/* Scroll-down mouse indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        aria-hidden="true"
        style={{ animation: "fadeIn 0.5s ease-out 1.2s both" }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Scroll
        </span>
        <div
          className="w-6 h-10 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: "1.5px solid rgba(255,255,255,0.35)" }}
        >
          <div
            className="w-1.5 h-3 rounded-full"
            style={{
              background: "linear-gradient(to bottom, #10b981, rgba(16,185,129,0.3))",
              animation: "scrollDot 2.2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center text-white px-4 sm:px-8"
        style={{ minHeight: "100vh", paddingTop: "5rem", paddingBottom: "7rem" }}
      >

        {/* Top decorative line */}
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            animationDelay: "50ms",
          }}
        >
          <span
            style={{
              display: "block",
              width: 40,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.7))",
            }}
          />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "5px 16px",
              borderRadius: 24,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px rgba(16,185,129,0.8)",
                display: "inline-block",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            {t("establishedYear")}
          </span>
          <span
            style={{
              display: "block",
              width: 40,
              height: 1,
              background: "linear-gradient(90deg, rgba(16,185,129,0.7), transparent)",
            }}
          />
        </div>

        {/* School name — bold headline */}
        <h1
          className="font-extrabold animate-fade-in-up"
          style={{
            fontSize: "clamp(2.2rem, 6.5vw, 5rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            textShadow: "0 4px 32px rgba(0,0,0,0.5)",
            animationDelay: "180ms",
            maxWidth: "900px",
            marginBottom: 0,
            background: "linear-gradient(180deg, #ffffff 50%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {t("schoolName")}
        </h1>

        {/* Accent underline */}
        <div
          className="animate-fade-in"
          style={{
            width: 80,
            height: 3,
            background: "linear-gradient(90deg, #10b981, #059669)",
            borderRadius: 2,
            margin: "18px auto 22px",
            animationDelay: "300ms",
          }}
        />

        {/* Location tag */}
        <div
          className="animate-fade-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "rgba(255,255,255,0.7)",
            fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
            letterSpacing: "0.06em",
            fontWeight: 500,
            marginBottom: 18,
            animationDelay: "320ms",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {t("location")}
        </div>

        {/* Tagline */}
        <p
          className="animate-fade-in-up"
          style={{
            fontSize: "clamp(0.95rem, 2.2vw, 1.25rem)",
            maxWidth: "520px",
            lineHeight: 1.75,
            animationDelay: "380ms",
            color: "rgba(255,255,255,0.72)",
            fontWeight: 400,
            marginBottom: 40,
          }}
        >
          Nurturing Excellence, Building Futures
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "500ms" }}
        >
          <Link
            href="/apply"
            className="group inline-flex items-center gap-2.5 font-bold text-white transition-all duration-300"
            style={{
              padding: "14px 32px",
              borderRadius: 50,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow: "0 8px 28px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
              fontSize: "1rem",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(16,185,129,0.55), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
          >
            {t("nav.onlineApply")}
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 font-semibold text-white transition-all duration-300"
            style={{
              padding: "13px 30px",
              borderRadius: 50,
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              fontSize: "1rem",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
            }}
          >
            {t("nav.about")}
          </Link>
        </div>

        {/* Divider with OR text — separates CTAs from stats */}
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            margin: "40px 0 32px",
            width: "min(340px, 80vw)",
            animationDelay: "650ms",
          }}
        >
          <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Our Numbers</span>
          <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
        </div>

        {/* Stat pills */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 animate-fade-in"
          style={{ animationDelay: "720ms" }}
        >
          {[
            { label: "Students", value: "500+", icon: "🎓" },
            { label: "Teachers", value: "30+", icon: "👩‍🏫" },
            { label: "Classes", value: "12", icon: "📚" },
            { label: "Years", value: "10+", icon: "🏫" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: "12px 20px",
                minWidth: 110,
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(16,185,129,0.15)";
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.35)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{stat.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "#6ee7b7",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div
        className="absolute bottom-0 left-0 w-full z-10"
        style={{ lineHeight: 0, pointerEvents: "none" }}
      >
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 60 }}>
          <path
            d="M0,40 C360,0 1080,60 1440,20 L1440,60 L0,60 Z"
            fill="rgba(248,249,250,1)"
          />
        </svg>
      </div>

      {/* Keyframes injected via a style tag */}
      <style>{`
        @keyframes heroZoom {
          from { transform: scale(1); }
          to   { transform: scale(1.07); }
        }
        @keyframes floatRing {
          0%   { transform: translateY(0px) rotate(0deg); }
          50%  { transform: translateY(-18px) rotate(4deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes scrollDot {
          0%   { transform: translateY(0); opacity: 1; }
          60%  { transform: translateY(16px); opacity: 0.1; }
          61%  { transform: translateY(0); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </section>
  );
}
