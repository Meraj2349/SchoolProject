import { redirect } from "next/navigation";

// The /quicker/* routes are superseded by /quaker/*.
// Redirect all traffic to the new portal.
export default function QuickerLayout() {
  redirect("/quaker");
}
