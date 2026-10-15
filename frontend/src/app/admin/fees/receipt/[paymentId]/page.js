import ReceiptPage from "@/features/admin/fees/ReceiptPage";

export const metadata = { title: "Payment receipt" };

// In this Next.js version `params` is a Promise.
export default async function Page({ params }) {
  const { paymentId } = await params;
  return <ReceiptPage paymentId={paymentId} />;
}
