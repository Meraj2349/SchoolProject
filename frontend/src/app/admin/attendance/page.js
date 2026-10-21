import AdminPage from "@/features/admin/attendance/AdminPage";

const first = (value) => (Array.isArray(value) ? value[0] : value) ?? null;

// ?classId=&date= opens one class and day (links from the attendance by branch page).
// In this Next.js version `searchParams` is a Promise.
export default async function Page({ searchParams }) {
  const { classId, date } = await searchParams;
  return <AdminPage initialClassId={first(classId)} initialDate={first(date)} />;
}
