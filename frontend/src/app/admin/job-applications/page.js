import JobApplicationsPage from "@/features/admin/jobApplications/JobApplicationsPage";

// "?circular=<id>" (from the Job circulars page) opens the list on that circular.
export default async function Page({ searchParams }) {
  const { circular } = await searchParams;
  return <JobApplicationsPage initialCircularId={typeof circular === "string" ? circular : ""} />;
}
