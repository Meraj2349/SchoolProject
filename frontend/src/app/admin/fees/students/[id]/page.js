import StudentLedgerPage from "@/features/admin/fees/StudentLedgerPage";

export const metadata = { title: "Fee ledger" };

// In this Next.js version `params` is a Promise.
export default async function Page({ params }) {
  const { id } = await params;
  return <StudentLedgerPage studentId={id} />;
}
