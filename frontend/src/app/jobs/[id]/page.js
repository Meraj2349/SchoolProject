import JobCircularPage from "@/features/jobs/JobCircularPage";

export const metadata = { title: "Job Circular – Star Shikkha Poribar" };

// Next 16: params is a Promise.
export default async function Page({ params }) {
  const { id } = await params;
  return <JobCircularPage id={id} />;
}
