"use client";

import { useState } from "react";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
} from "@/hooks/useClasses";
import { useTranslations } from "@/store/languageStore";
import "@/styles/ClassesPage.css";

const EMPTY = { className: "", section: "", teacherName: "", teacherEmail: "" };

export default function AdminPage() {
  const { data: classes = [], isLoading } = useClasses();
  const create = useCreateClass();
  const update = useUpdateClass();
  const remove = useDeleteClass();
  const t = useTranslations("admin.classes");

  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState({ error: null, success: null });

  const flash = (m, e = false) => {
    setStatus(e ? { error: m, success: null } : { error: null, success: m });
    setTimeout(() => setStatus({ error: null, success: null }), 4000);
  };
  const reset = () => {
    setForm(EMPTY);
    setEditId(null);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) await update.mutateAsync({ id: editId, data: form });
      else await create.mutateAsync(form);
      flash(editId ? t("classUpdated") : t("classAdded"));
      reset();
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  const FIELDS = [
    ["className", t("className")],
    ["section", t("section")],
    ["teacherName", t("teacherName")],
    ["teacherEmail", t("teacherEmail")],
  ];

  const TABLE_HEADERS = [t("className"), t("section"), t("teacherName"), t("teacherEmail"), t("actions")];

  return (
    <div className="classes-page">
      <h1>{t("title")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}
      <form
        onSubmit={handleSave}
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          marginBottom: 24,
        }}
      >
        <h2>{editId ? t("editClass") : t("addClass")}</h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {FIELDS.map(([n, l]) => (
            <div key={n}>
              <label style={{ fontSize: 14, fontWeight: 500 }}>{l}</label>
              <input
                type="text"
                name={n}
                value={form[n]}
                onChange={handleChange}
                className="form-input"
                style={{ marginTop: 4, width: "100%" }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="submit" className="btn-primary">
            {editId ? t("updateClass") : t("addClass")}
          </button>
          {editId && (
            <button type="button" onClick={reset} className="btn-secondary">
              {t("cancel")}
            </button>
          )}
        </div>
      </form>
      <h2>{t("allClasses")} ({classes.length})</h2>
      {isLoading ? (
        <p>{t("loading")}</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              {TABLE_HEADERS.map((h) => (
                <th key={h} className="table-header">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.ClassID || c.id}>
                <td className="table-cell">{c.className || c.ClassName}</td>
                <td className="table-cell">{c.section || c.Section}</td>
                <td className="table-cell">
                  {c.teacherName || c.TeacherName || "–"}
                </td>
                <td className="table-cell">
                  {c.teacherEmail || c.TeacherEmail || "–"}
                </td>
                <td className="table-cell">
                  <button
                    onClick={() => {
                      setEditId(c.ClassID || c.id);
                      setForm({
                        className: c.className || c.ClassName || "",
                        section: c.section || c.Section || "",
                        teacherName: c.teacherName || c.TeacherName || "",
                        teacherEmail: c.teacherEmail || c.TeacherEmail || "",
                      });
                    }}
                    style={{
                      color: "#2563eb",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      marginRight: 8,
                    }}
                  >
                    {t("editClass")}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t("deleteConfirm")))
                        remove.mutate(c.ClassID || c.id);
                    }}
                    style={{
                      color: "#dc2626",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {t("deleted")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
