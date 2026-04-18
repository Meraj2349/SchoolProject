"use client";

import Link from "next/link";
import Image from "next/image";

const FEATURES = [
  {
    title: "Huge Question Bank",
    desc: "Curated questions across Biology, Chemistry, Math, Physics, and more.",
    icon: "◆",
    gradient: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
    shadow: "rgba(16,185,129,0.35)",
  },
  {
    title: "Instant Grading",
    desc: "Server-side scoring with detailed answer review after every quiz.",
    icon: "◇",
    gradient: "linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)",
    shadow: "rgba(59,130,246,0.35)",
  },
  {
    title: "Track Progress",
    desc: "Subject-wise averages, session history, and leaderboards.",
    icon: "◈",
    gradient: "linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)",
    shadow: "rgba(139,92,246,0.35)",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* ── HERO — echoes HeroSection palette (emerald overlay + diagonal texture) ── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "70vh" }}>
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/School Gate Picture.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Same gradient stack as HeroSection */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(170deg, rgba(2,44,34,0.82) 0%, rgba(4,64,51,0.68) 35%, rgba(0,0,0,0.85) 100%)",
            }}
          />
          {/* Emerald radial glow — top-left */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-10%",
              left: "-8%",
              width: "55vw",
              height: "55vw",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
            }}
          />
          {/* Purple radial glow — bottom-right */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: "-12%",
              right: "-8%",
              width: "50vw",
              height: "50vw",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(75,46,131,0.22) 0%, transparent 70%)",
            }}
          />
          {/* Diagonal texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(255,255,255,0.025) 50px, rgba(255,255,255,0.025) 100px)",
            }}
          />
        </div>

        <div
          className="relative z-10 max-w-[1200px] mx-auto px-5 flex flex-col justify-center text-white"
          style={{ minHeight: "70vh", paddingTop: "5rem", paddingBottom: "5rem" }}
        >
          {/* Badge — HeroSection established-year pill style */}
          <div
            className="inline-flex items-center gap-2 mb-6 self-start"
            style={{
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
              }}
            />
            A Quaker Education — Student Portal
          </div>

          {/* Headline */}
          <h1
            className="font-extrabold leading-tight tracking-tight mb-4"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
              textShadow: "0 4px 32px rgba(0,0,0,0.5)",
              maxWidth: 780,
            }}
          >
            Practice smarter.
            <br />
            <span
              style={{
                background: "linear-gradient(180deg,#6ee7b7 0%,#10b981 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Learn faster.
            </span>
          </h1>

          {/* Accent underline — same as HeroSection */}
          <div
            style={{
              width: 64,
              height: 3,
              background: "linear-gradient(90deg, #10b981, #059669)",
              borderRadius: 2,
              marginBottom: 20,
            }}
          />

          <p
            className="text-lg max-w-xl mb-10"
            style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.75 }}
          >
            Thousands of questions from trusted curriculum sources. Pick a
            subject, take a quiz, and watch your progress climb. Free for every
            student — no account required.
          </p>

          {/* CTAs — same pill/ghost treatment as HeroSection */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/quaker/start"
              className="inline-flex items-center gap-2.5 font-bold text-white transition-all duration-300 no-underline"
              style={{
                padding: "14px 32px",
                borderRadius: 50,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow:
                  "0 8px 28px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
                fontSize: "1rem",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 16px 40px rgba(16,185,129,0.55), inset 0 1px 0 rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 8px 28px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
              }}
            >
              Start Quiz →
            </Link>
            <Link
              href="/quaker/progress"
              className="inline-flex items-center gap-2 font-semibold text-white transition-all duration-300 no-underline"
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
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Check My Progress
            </Link>
          </div>
        </div>

        {/* Bottom wave — same as HeroSection */}
        <div
          className="absolute bottom-0 left-0 w-full z-10"
          style={{ lineHeight: 0, pointerEvents: "none" }}
        >
          <svg
            viewBox="0 0 1440 60"
            preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: 60 }}
          >
            <path
              d="M0,40 C360,0 1080,60 1440,20 L1440,60 L0,60 Z"
              fill="rgba(248,249,250,1)"
            />
          </svg>
        </div>
      </section>

      {/* ── FEATURES — LeadershipSection card style on light background ── */}
      <section className="relative bg-gradient-to-b from-[#fdf8f0] to-[#f5ede0] py-20 overflow-hidden">
        {/* Gold strip top — identical to LeadershipSection */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, #c9a84c 30%, #e2c07a 50%, #c9a84c 70%, transparent 100%)",
          }}
        />

        <div className="max-w-[1200px] mx-auto px-5">
          {/* Section header — star-rule pattern from ClassStatistics / LeadershipSection */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-[14px] mb-4">
              <span className="block w-14 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.6)]" />
              <span className="text-[0.75rem] text-[#c9a84c]">★</span>
              <span className="block w-14 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.6)]" />
            </div>
            <h2 className="text-[clamp(1.65rem,4vw,2.4rem)] font-extrabold text-[#0d1f3c] mb-3 tracking-tight leading-tight">
              What&apos;s inside
            </h2>
            <p className="text-[0.95rem] text-[#5a6072] max-w-[480px] mx-auto leading-relaxed">
              Everything a student needs to self-study and ace their exams.
            </p>
            <div className="inline-flex items-center gap-[10px] mt-4">
              <span className="block w-10 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.5)]" />
              <span className="text-[0.5rem] text-[#c9a84c]">◆</span>
              <span className="block w-10 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.5)]" />
            </div>
          </div>

          {/* Feature cards — QuickLinks card radius/shadow style */}
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-[rgba(201,168,76,0.25)] shadow-[0_2px_6px_rgba(13,31,60,0.07),0_8px_24px_rgba(13,31,60,0.06)] overflow-hidden transition-all duration-[280ms] hover:-translate-y-[5px] hover:shadow-[0_4px_12px_rgba(13,31,60,0.1),0_20px_48px_rgba(13,31,60,0.1)]"
              >
                {/* Gold top accent */}
                <div
                  className="h-[3px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, transparent 0%, #c9a84c 30%, #e2c07a 50%, #c9a84c 70%, transparent 100%)",
                  }}
                />
                <div className="p-6">
                  {/* Icon circle — QuickLinks icon circle style */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white mb-4 shadow-md"
                    style={{
                      background: f.gradient,
                      boxShadow: `0 4px 14px ${f.shadow}`,
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#0d1f3c] mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-[#5a6072] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gold strip bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, #c9a84c 30%, #e2c07a 50%, #c9a84c 70%, transparent 100%)",
          }}
        />
      </section>

      {/* ── CTA BAND — navy background + gold accent, echoes ClassStatistics dark strip ── */}
      <section className="relative w-full bg-[#0d1f3c] py-20 overflow-hidden text-center">
        {/* Diagonal texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 1px,transparent 1px,transparent 10px)",
          }}
        />
        {/* Top gold strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a84c] via-[#e2c07a] via-[#c9a84c] to-transparent" />

        <div className="relative z-[1] max-w-[1200px] mx-auto px-5">
          {/* Star rule */}
          <div className="inline-flex items-center gap-[14px] mb-5">
            <span className="block w-14 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.6)]" />
            <span className="text-[0.75rem] text-[#c9a84c]">★</span>
            <span className="block w-14 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.6)]" />
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-[#e2c07a] mb-3 tracking-tight leading-tight">
            Ready to start?
          </h2>
          <p
            className="text-lg mb-8 max-w-xl mx-auto leading-relaxed"
            style={{ color: "rgba(226,192,122,0.75)" }}
          >
            No registration needed — just enter your student details and begin.
          </p>
          <Link
            href="/quaker/start"
            className="inline-flex items-center gap-2.5 font-bold text-white transition-all duration-300 no-underline"
            style={{
              padding: "14px 36px",
              borderRadius: 50,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow:
                "0 8px 28px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
              fontSize: "1rem",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 16px 40px rgba(16,185,129,0.55), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 8px 28px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
          >
            Start Now →
          </Link>
        </div>

        {/* Bottom gold strip */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a84c] via-[#e2c07a] via-[#c9a84c] to-transparent" />
      </section>
    </div>
  );
}
