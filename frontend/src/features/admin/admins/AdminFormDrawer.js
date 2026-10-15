"use client";

import { useState } from "react";
import { Button, Drawer, Field, Input, Select } from "@/components/admin/ui";
import { useTranslations } from "@/store/languageStore";
import { ROLES, validateAdminForm } from "./adminForm";

/**
 * Add / edit an admin in a side drawer. Validates before calling onSave; a
 * failed save shows the server's message (onSave rejects with it).
 * `ownAccount` locks the role so nobody demotes themselves.
 */
export default function AdminFormDrawer({ initialValues, isNew, ownAccount, branchOptions, onSave, onClose }) {
  const t = useTranslations("admin.admins");
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  const onChange = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));
  const errorFor = (field) => (errors[field] ? t(errors[field]) : undefined);

  const submit = async (event) => {
    event.preventDefault();
    const found = validateAdminForm(form, { isNew });
    setErrors(found);
    setSaveError(null);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      await onSave(form);
    } catch (message) {
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open
      title={isNew ? t("addAdmin") : t("editAdmin")}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button variant="primary" type="submit" form="admin-form" disabled={saving}>
            {t("save")}
          </Button>
        </>
      }
    >
      <form id="admin-form" onSubmit={submit} noValidate>
        {saveError && (
          <div role="alert" className="error-message">
            {saveError}
          </div>
        )}
        <Field label={t("name")} required error={errorFor("Username")}>
          {(a11y) => <Input {...a11y} value={form.Username} onChange={onChange("Username")} maxLength={50} />}
        </Field>
        <Field label={t("email")} required error={errorFor("Email")}>
          {(a11y) => (
            <Input {...a11y} type="email" value={form.Email} onChange={onChange("Email")} maxLength={100} autoComplete="off" />
          )}
        </Field>
        <Field
          label={t("password")}
          required={isNew}
          error={errorFor("Password")}
          help={isNew ? t("passwordHelp") : t("passwordKeepHelp")}
        >
          {(a11y) => (
            <Input {...a11y} type="password" value={form.Password} onChange={onChange("Password")} autoComplete="new-password" />
          )}
        </Field>
        <Field label={t("role")} required help={ownAccount ? t("ownRoleHelp") : t(`${form.role}Help`)}>
          {(a11y) => (
            <Select
              {...a11y}
              value={form.role}
              onChange={onChange("role")}
              disabled={ownAccount}
              options={ROLES.map((role) => ({ value: role, label: t(role) }))}
            />
          )}
        </Field>
        {form.role === "branch_admin" && (
          <Field label={t("branch")} required error={errorFor("branch_id")}>
            {(a11y) => (
              <Select
                {...a11y}
                value={form.branch_id}
                onChange={onChange("branch_id")}
                options={branchOptions}
                placeholder={t("selectBranch")}
              />
            )}
          </Field>
        )}
      </form>
    </Drawer>
  );
}
