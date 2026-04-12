"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentsService } from "@/services/students.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import "@/styles/StudentPage.css";

const EMPTY = {
  FirstName: "",
  LastName: "",
  RollNumber: "",
  ClassName: "",
  Section: "",
  Gender: "Male",
  DateOfBirth: "",
  ParentContact: "",
  Address: "",
  Email: "",
  AdmissionDate: "",
};

export default function AdminPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState({ error: null, success: null });
  const t = useTranslations("admin.students");

  const { data: students = [], isLoading } = useQuery({
    queryKey: queryKeys.students.all,
    queryFn: studentsService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });

  const create = useMutation({
    mutationFn: studentsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.students.all });
      flash(t("studentAdded"));
      resetForm();
    },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => studentsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.students.all });
      flash(t("studentUpdated"));
      resetForm();
    },
  });
  const remove = useMutation({
    mutationFn: studentsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.students.all });
      flash(t("deleted"));
    },
  });

  const flash = (msg, isErr = false) => {
    setStatus(
      isErr ? { error: msg, success: null } : { error: null, success: msg },
    );
    setTimeout(() => setStatus({ error: null, success: null }), 4000);
  };
  const resetForm = () => {
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
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  const TEXT_FIELDS = [
    ["FirstName", t("firstName")],
    ["LastName", t("lastName")],
    ["RollNumber", t("rollNumber")],
    ["ClassName", t("class")],
    ["Section", t("section")],
    ["ParentContact", t("parentContact")],
    ["Email", t("email")],
    ["Address", t("address")],
  ];

  const TABLE_HEADERS = [
    t("name"),
    t("class"),
    t("section"),
    t("rollNumber"),
    t("contact"),
    t("actions"),
  ];

  return (
    <div className="student-page">
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
        <h2>{editId ? t("editStudent") : t("addStudent")}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          {TEXT_FIELDS.map(([name, label]) => (
            <div key={name}>
              <label style={{ fontSize: 14, fontWeight: 500 }}>{label}</label>
              <input
                type="text"
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="form-input"
                style={{ marginTop: 4, width: "100%" }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("gender")}
            </label>
            <select
              name="Gender"
              value={form.Gender}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
            >
              <option value="Male">{t("male")}</option>
              <option value="Female">{t("female")}</option>
              <option value="Other">{t("other")}</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("dateOfBirth")}
            </label>
            <input
              type="date"
              name="DateOfBirth"
              value={form.DateOfBirth}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("admissionDate")}
            </label>
            <input
              type="date"
              name="AdmissionDate"
              value={form.AdmissionDate}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="submit" className="btn-primary">
            {editId ? t("updateStudent") : t("addStudent")}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              {t("cancel")}
            </button>
          )}
        </div>
      </form>
      <div>
        <h2>
          {t("allStudents")} ({students.length})
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
              {students.map((s) => (
                <tr key={s.StudentID}>
                  <td className="table-cell">
                    {s.FirstName} {s.LastName}
                  </td>
                  <td className="table-cell">{s.ClassName}</td>
                  <td className="table-cell">{s.Section}</td>
                  <td className="table-cell">{s.RollNumber}</td>
                  <td className="table-cell">{s.ParentContact || "–"}</td>
                  <td className="table-cell">
                    <button
                      onClick={() => {
                        setEditId(s.StudentID);
                        setForm({
                          ...s,
                          DateOfBirth: s.DateOfBirth?.split("T")[0] || "",
                          AdmissionDate: s.AdmissionDate?.split("T")[0] || "",
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
                      {t("editStudent")}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t("deleteConfirm")))
                          remove.mutate(s.StudentID);
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
    </div>
  );
}
