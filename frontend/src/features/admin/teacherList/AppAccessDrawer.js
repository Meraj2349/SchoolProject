"use client";

import { useState } from "react";
import { Button, Drawer, Field, Input, notify, errorMessage } from "@/components/admin/ui";
import { useSetTeacherAppAccess } from "@/hooks/useTeachers";
import { formatDate } from "@/lib/homePage";
import { formatSchoolTime } from "@/lib/attendance";
import { fillTemplate } from "@/lib/template";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

/**
 * Sets a teacher's sign-in to the attendance app: a mobile number, a
 * password (empty keeps the current one) and an on/off switch.
 * `access` is the teacher's current access, or null when it was never set.
 */
export default function AppAccessDrawer({ teacher, access, onClose }) {
  const t = useTranslations("admin.teachers");
  const language = useLanguageStore((s) => s.language);
  const save = useSetTeacherAppAccess();
  const [form, setForm] = useState({ phone: access?.phone ?? "", password: "", enabled: Boolean(access?.enabled) });
  const [error, setError] = useState("");
  const name = `${teacher.FirstName} ${teacher.LastName ?? ""}`.trim();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const data = { phone: form.phone.trim(), enabled: form.enabled };
    if (form.password) data.password = form.password;
    try {
      await save.mutateAsync({ id: teacher.TeacherID, data });
      notify.success(t("appSaved"));
      onClose();
    } catch (caught) {
      setError(errorMessage(caught, t("operationFailed")));
    }
  };

  const lastSignIn = access?.lastLoginAt
    ? fillTemplate(t("appLastSignIn"), {
        time: `${formatDate(access.lastLoginAt, language)} ${formatSchoolTime(access.lastLoginAt, language)}`,
      })
    : t("appNeverSignedIn");

  return (
    <Drawer
      open
      title={fillTemplate(t("appAccessTitle"), { name })}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>{t("cancel")}</Button>
          <Button variant="primary" type="submit" form="app-access-form" disabled={save.isPending}>
            {t("appSave")}
          </Button>
        </div>
      }
    >
      <form id="app-access-form" onSubmit={submit}>
        <p className="mt-0 mb-4 text-sm text-slate-600">{t("appAccessHint")}</p>
        {error && (
          <p role="alert" className="error-message mb-3">
            {error}
          </p>
        )}
        <Field label={t("appPhone")}>
          {(a11y) => (
            <Input
              {...a11y}
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="01XXXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          )}
        </Field>
        <Field label={access?.hasPassword ? t("appPasswordNew") : t("appPassword")} help={t("appPasswordHelp")}>
          {(a11y) => (
            <Input
              {...a11y}
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          )}
        </Field>
        <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
            className="h-4 w-4 accent-indigo-600"
          />
          {t("appEnabled")}
        </label>
        <p className="m-0 text-sm text-slate-500">{lastSignIn}</p>
        <p className="mt-3 mb-0 text-xs text-slate-500">{t("appSignOutNote")}</p>
      </form>
    </Drawer>
  );
}
