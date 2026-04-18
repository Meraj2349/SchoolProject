"use client";

import { useBranchStats } from "@/hooks/useBranchStats";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useTranslations } from "@/store/languageStore";
import {
  FiUsers,
  FiBookOpen,
  FiGrid,
  FiGitBranch,
  FiArrowRight,
  FiCalendar,
} from "react-icons/fi";

// ────────────────────────────────────────────────────────────────────────────
// Small summary card at the top (total across all branches)
// ────────────────────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon className="text-white text-xl" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Per-branch overview card
// ────────────────────────────────────────────────────────────────────────────
function BranchCard({ branch, onSwitch, t }) {
  const displayName = branch.name_en || branch.name_bn || `Branch ${branch.id}`;
  const isProposed = branch.is_proposed;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Card header */}
      <div className="relative h-24 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-end p-4">
        {branch.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branch.image_url}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-10 flex items-center justify-between w-full">
          <h3 className="text-white font-bold text-base leading-tight truncate pr-2">
            {displayName}
          </h3>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
              isProposed
                ? "bg-amber-400/90 text-amber-900"
                : "bg-emerald-400/90 text-emerald-900"
            }`}
          >
            {isProposed ? t("proposed") : t("active")}
          </span>
        </div>
      </div>

      {/* Bangla name + established */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        {branch.name_bn && branch.name_en ? (
          <p className="text-sm text-slate-500 truncate">{branch.name_bn}</p>
        ) : (
          <span />
        )}
        {branch.established_date && (
          <p className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
            <FiCalendar className="text-slate-300" />
            {t("established")}&nbsp;
            {new Date(branch.established_date).getFullYear()}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-px bg-slate-100 mx-4 my-3 rounded-lg overflow-hidden">
        <StatCell
          icon={FiUsers}
          value={branch.studentCount}
          label={t("students")}
          color="text-indigo-600"
        />
        <StatCell
          icon={FiBookOpen}
          value={branch.teacherCount}
          label={t("teachers")}
          color="text-purple-600"
        />
        <StatCell
          icon={FiGrid}
          value={branch.classCount}
          label={t("classes")}
          color="text-sky-600"
        />
      </div>

      {/* Switch button */}
      <div className="px-4 pb-4">
        <button
          onClick={() => onSwitch(branch.id, displayName)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer bg-transparent"
        >
          {t("switchTo")}
          <FiArrowRight className="text-sm" />
        </button>
      </div>
    </div>
  );
}

function StatCell({ icon: Icon, value, label, color }) {
  return (
    <div className="bg-white flex flex-col items-center py-2.5 px-1">
      <Icon className={`text-base mb-0.5 ${color}`} />
      <span className="text-lg font-bold text-slate-800 leading-none">
        {value}
      </span>
      <span className="text-xs text-slate-400 mt-0.5">{label}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Skeleton loader
// ────────────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-24 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded" />
          ))}
        </div>
        <div className="h-9 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const t = useTranslations("admin.dashboard");
  const role = useAuthStore((s) => s.role);
  const { setBranch } = useBranchStore();
  const { data: branchStats = [], isLoading, isError } = useBranchStats();

  // Totals across all branches
  const totals = branchStats.reduce(
    (acc, b) => ({
      students: acc.students + b.studentCount,
      teachers: acc.teachers + b.teacherCount,
      classes: acc.classes + b.classCount,
    }),
    { students: 0, teachers: 0, classes: 0 },
  );

  const handleSwitch = (branchId, branchName) => {
    setBranch(branchId, branchName);
  };

  // Branch admins don't see this page — they're redirected to notices
  if (role !== "super_admin") return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t("title")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("overview")}</p>
      </div>

      {/* Top summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={FiGitBranch}
          label={t("totalBranches")}
          value={isLoading ? "—" : branchStats.length}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <SummaryCard
          icon={FiUsers}
          label={t("totalStudents")}
          value={isLoading ? "—" : totals.students}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <SummaryCard
          icon={FiBookOpen}
          label={t("totalTeachers")}
          value={isLoading ? "—" : totals.teachers}
          color="bg-gradient-to-br from-sky-500 to-sky-600"
        />
        <SummaryCard
          icon={FiGrid}
          label={t("totalClasses")}
          value={isLoading ? "—" : totals.classes}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
      </div>

      {/* Per-branch grid */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-4">
          {t("allBranches")}
        </h2>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
            {t("errorLoading")}
          </div>
        )}

        {!isLoading && !isError && branchStats.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">
            {t("noData")}
          </div>
        )}

        {!isLoading && !isError && branchStats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {branchStats.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                onSwitch={handleSwitch}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
