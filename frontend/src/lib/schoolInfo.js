// The school's contact details and links, in one place for the header,
// footer and home page. Text that changes with the language lives in i18n.

/** Md. Rashedul Islam, Chairman of Star Shikkha Poribar; his photo is shown until an admin uploads one. */
export const CHAIRMAN = {
  photo: "/images/chairman.jpg",
  mobile: "01915-680214",
  mobileHref: "tel:+8801915680214",
};

/** Head office numbers printed on job circulars (applications go to the Chairman there). */
export const HEAD_OFFICE_MOBILES = ["01915-680214", "01717-174064", "01911-968277"].map((display) => ({
  display,
  href: `tel:+88${display.replace(/-/g, "")}`,
}));

export const SCHOOL_CONTACT = {
  phone: "01997588476",
  phoneHref: "tel:+8801997588476",
  email: "merajislam2349@gmail.com",
};

/** Government education sites shown in the footer. */
export const EDUCATION_LINKS = [
  { key: "dshe", href: "https://dshe.gov.bd" },
  { key: "banbeis", href: "https://banbeis.gov.bd" },
  { key: "boardResults", href: "https://www.educationboardresults.gov.bd" },
  { key: "ministry", href: "https://moedu.gov.bd" },
  { key: "nationalPortal", href: "https://bangladesh.gov.bd" },
];

/** Main navigation. Items with `children` open a small menu. */
export const PUBLIC_NAV = [
  { key: "home", path: "/" },
  { key: "about", path: "/about" },
  {
    key: "academics",
    children: [
      { key: "students", path: "/students" },
      { key: "teachers", path: "/teachers" },
      { key: "routine", path: "/routine" },
      { key: "results", path: "/result" },
      { key: "attendance", path: "/attendance" },
    ],
  },
  { key: "gallery", path: "/gallery" },
  { key: "events", path: "/events" },
  { key: "branches", path: "/branches" },
  { key: "jobs", path: "/jobs" },
  { key: "quakerEducation", path: "/quaker" },
];
