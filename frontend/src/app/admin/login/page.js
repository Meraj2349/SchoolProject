import LoginPage from "@/features/admin/auth/LoginPage";
export const metadata = { title: "Admin Login – Star Academic School" };
// This page is inside /admin layout but AdminGuard redirects to here —
// we handle the redirect loop by checking inside AdminGuard only when NOT on login/register.
export default function Page() { return <LoginPage />; }
