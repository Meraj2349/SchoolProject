import AdminGuard from "@/components/shared/AdminGuard";
import AdminLayoutInner from "@/components/shared/AdminLayoutInner";

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminGuard>
  );
}
