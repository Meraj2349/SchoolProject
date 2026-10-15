import { redirect } from "next/navigation";

// The quiz admin moved to /admin/quiz/*; keep old links working.
export default function Page() {
  redirect("/admin/quiz/results");
}
