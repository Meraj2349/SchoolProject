import PublicPage from "@/components/site/PublicPage";

export const metadata = {
  title: { default: "A Quaker Education – Star Shikkha Poribar", template: "%s – A Quaker Education" },
  description: "Free practice quizzes for Star Shikkha Poribar students, in English and Bangla.",
};

export default function QuakerLayout({ children }) {
  return <PublicPage className="bg-school-cream">{children}</PublicPage>;
}
