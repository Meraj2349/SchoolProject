"use client";

import { useState } from "react";
import {
  useTeachers,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
} from "@/hooks/useTeachers";
import { useTranslations } from "@/store/languageStore";
import "@/styles/TeacherPage.css";

const EMPTY = {
  FirstName: "",
  LastName: "",
  Email: "",
  Subject: "",
  ContactNumber: "",
  JoiningDate: "",
};

export default function AdminPage() {
  const { data: teachers = [], isLoading } = useTeachers();
  const create = useCreateTeacher();
  const update = useUpdateTeacher();
  const remove = useDeleteTeacher();
  const t = useTranslations("admin.teachers");

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
      flash(editId ? t("teacherUpdated") : t("teacherAdded"));
      reset();
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  const TEXT_FIELDS = [
    ["FirstName", t("firstName"), true],
    ["LastName", t("lastName"), true],
    ["Email", t("email"), true],
    ["Subject", t("subject"), true],
    ["ContactNumber", t("contactNumber"), false],
  ];

  const TABLE_HEADERS = [
    t("name"),
    t("subject"),
    t("email"),
    t("contact"),
    t("actions"),
  ];

  return (
    <div className="teacher-page">
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
        <h2>{editId ? t("editTeacher") : t("addTeacher")}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          {TEXT_FIELDS.map(([name, label, req]) => (
            <div key={name}>
              <label style={{ fontSize: 14, fontWeight: 500 }}>{label}</label>
              <input
                type="text"
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="form-input"
                style={{ marginTop: 4, width: "100%" }}
                required={req}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("joiningDate")}
            </label>
            <input
              type="date"
              name="JoiningDate"
              value={form.JoiningDate}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="submit" className="btn-primary">
            {editId ? t("updateTeacher") : t("addTeacher")}
          </button>
          {editId && (
            <button type="button" onClick={reset} className="btn-secondary">
              {t("cancel")}
            </button>
          )}
        </div>
      </form>
      <h2>
        {t("allTeachers")} ({teachers.length})
      </h2>
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
            {teachers.map((teacher) => (
              <tr key={teacher.TeacherID}>
                <td className="table-cell">
                  {teacher.FirstName} {teacher.LastName}
                </td>
                <td className="table-cell">{teacher.Subject}</td>
                <td className="table-cell">{teacher.Email}</td>
                <td className="table-cell">{teacher.ContactNumber}</td>
                <td className="table-cell">
                  <button
                    onClick={() => {
                      setEditId(teacher.TeacherID);
                      setForm({
                        ...teacher,
                        JoiningDate: teacher.JoiningDate?.split("T")[0] || "",
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
                    {t("editTeacher")}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t("deleteConfirm")))
                        remove.mutate(teacher.TeacherID);
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
