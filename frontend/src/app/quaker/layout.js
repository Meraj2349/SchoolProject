import QuakerNav from "@/features/quaker/QuakerNav";

export const metadata = {
  title: "A Quaker Education – Star Shikkha Poribar",
  description: "Practice quizzes for Star Shikkha Poribar students.",
};

export default function QuakerLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <QuakerNav />
      <main>{children}</main>
    </div>
  );
}
