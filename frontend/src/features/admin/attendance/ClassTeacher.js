"use client";

import { Badge } from "@/components/admin/ui";
import { fillTemplate } from "@/lib/template";
import { useTranslations } from "@/store/languageStore";

/** Whether the class teacher may take attendance in the phone app. */
export function AppBadge({ on }) {
  const t = useTranslations("admin.attendance");
  return <Badge tone={on ? "success" : "default"}>{t(on ? "appOn" : "appOff")}</Badge>;
}

/**
 * A class's teacher and their app access, or that the class has none.
 * `labelled`: "Class teacher: Nasima Akter" instead of the bare name.
 */
export function ClassTeacher({ classTeacher, labelled = false }) {
  const t = useTranslations("admin.attendance");
  if (!classTeacher) return <span className="text-slate-500">{t("noClassTeacher")}</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span>{labelled ? fillTemplate(t("classTeacherIs"), { name: classTeacher.name }) : classTeacher.name}</span>
      <AppBadge on={classTeacher.appAccess} />
    </span>
  );
}
