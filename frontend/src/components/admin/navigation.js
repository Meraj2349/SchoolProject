import {
  FiAward,
  FiBarChart2,
  FiBell,
  FiBook,
  FiBookOpen,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiGitBranch,
  FiGrid,
  FiHelpCircle,
  FiImage,
  FiLayout,
  FiMessageSquare,
  FiPieChart,
  FiRss,
  FiSettings,
  FiShield,
  FiSliders,
  FiStar,
  FiTable,
  FiUser,
  FiUserCheck,
  FiUsers,
  FiVolume2,
} from "react-icons/fi";

export const ADMIN_HOME = "/admin/dashboard";

/**
 * The admin menu — the only place that lists admin pages. Used by the sidebar
 * and the breadcrumbs. `key` is an i18n key; `superAdminOnly` hides the page
 * from branch admins. A group without `key` renders its items at the top level.
 */
export const NAV_GROUPS = [
  {
    items: [{ path: ADMIN_HOME, key: "sidebar.adminDashboard", icon: FiLayout }],
  },
  {
    key: "sidebar.groups.academics",
    icon: FiBookOpen,
    items: [
      { path: "/admin/studentList", key: "sidebar.studentList", icon: FiUsers },
      { path: "/admin/teacherList", key: "sidebar.teacherList", icon: FiUserCheck },
      { path: "/admin/classes-sections", key: "sidebar.classesSections", icon: FiGrid },
      { path: "/admin/class", key: "sidebar.classTeacher", icon: FiUser },
      { path: "/admin/subject", key: "sidebar.subject", icon: FiBook },
      { path: "/admin/routine", key: "sidebar.routine", icon: FiClock },
    ],
  },
  {
    key: "sidebar.groups.examsResults",
    icon: FiAward,
    items: [
      { path: "/admin/exams", key: "sidebar.exams", icon: FiClipboard },
      { path: "/admin/results", key: "sidebar.results", icon: FiAward },
    ],
  },
  {
    key: "sidebar.groups.attendance",
    icon: FiCheckSquare,
    items: [
      { path: "/admin/attendance", key: "sidebar.attendance", icon: FiCheckSquare },
      { path: "/admin/attendance/grid", key: "sidebar.attendanceGrid", icon: FiTable },
    ],
  },
  {
    key: "sidebar.groups.fees",
    icon: FiDollarSign,
    items: [
      { path: "/admin/fees", key: "sidebar.feesOverview", icon: FiPieChart },
      { path: "/admin/fees/invoices", key: "sidebar.feeInvoices", icon: FiFileText },
      { path: "/admin/fees/setup", key: "sidebar.feeSetup", icon: FiSliders },
    ],
  },
  {
    key: "sidebar.groups.admissions",
    icon: FiFileText,
    items: [{ path: "/admin/applications", key: "sidebar.applications", icon: FiFileText }],
  },
  {
    key: "sidebar.groups.website",
    icon: FiRss,
    items: [
      { path: "/admin/notices", key: "sidebar.notice", icon: FiBell },
      { path: "/admin/notice-announcements", key: "sidebar.noticeAnnouncements", icon: FiVolume2 },
      { path: "/admin/news", key: "sidebar.news", icon: FiRss },
      { path: "/admin/events", key: "sidebar.events", icon: FiCalendar },
      { path: "/admin/gallery", key: "sidebar.imageGallery", icon: FiImage },
      { path: "/admin/messages", key: "sidebar.chairMessage", icon: FiMessageSquare },
      { path: "/admin/chairman", key: "sidebar.chairmanProfile", icon: FiUser, superAdminOnly: true },
    ],
  },
  {
    key: "sidebar.groups.quiz",
    icon: FiStar,
    items: [
      { path: "/admin/quiz/questions", key: "sidebar.quizQuestions", icon: FiHelpCircle },
      { path: "/admin/quiz/results", key: "sidebar.quizResults", icon: FiBarChart2 },
      { path: "/admin/quiz/leaderboard", key: "sidebar.quizLeaderboard", icon: FiAward },
    ],
  },
  {
    key: "sidebar.groups.administration",
    icon: FiSettings,
    items: [
      { path: "/admin/branches", key: "sidebar.branches", icon: FiGitBranch, superAdminOnly: true },
      { path: "/admin/admins", key: "sidebar.admins", icon: FiShield, superAdminOnly: true },
      { path: "/admin/updateEmailPassword", key: "sidebar.settings", icon: FiSettings },
    ],
  },
];

const canSee = (item, role) => !item.superAdminOnly || role === "super_admin";

/** The menu for a role: hidden items removed, empty groups dropped. */
export function visibleNavigation(role) {
  return NAV_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => canSee(item, role)) })).filter(
    (group) => group.items.length > 0,
  );
}

const isWithin = (pathname, path) => pathname === path || pathname.startsWith(`${path}/`);

/**
 * The menu item for a page: an exact match, otherwise the longest item path the
 * page sits under (so /admin/studentList/42 belongs to Students).
 */
export function findNavItem(pathname) {
  let best = null;
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (isWithin(pathname, item.path) && (!best || item.path.length > best.item.path.length)) {
        best = { group, item };
      }
    }
  }
  return best;
}

export function breadcrumbsFor(pathname) {
  const home = { key: "admin.shell.home", path: ADMIN_HOME };
  const match = findNavItem(pathname);
  if (!match || match.item.path === ADMIN_HOME) return [home];
  return [
    home,
    ...(match.group.key ? [{ key: match.group.key }] : []),
    { key: match.item.key, path: match.item.path },
  ];
}
