"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectsService } from "@/services/subjects.service";
import { classesService } from "@/services/classes.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import "@/styles/SubjectsPage.css";

const EMPTY = { SubjectName: "", ClassID: "" };

export default function AdminPage() {
  const qc = useQueryClient();
  const t = useTranslations("admin.subjects");
  const tCommon = useTranslations("common");

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: subjectsService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });
  const { data: classes = [] } = useQuery({
    queryKey: queryKeys.classes.all,
    queryFn: classesService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });

  const create = useMutation({
    mutationFn: subjectsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.subjects.all });
      flash(t("subjectAdded"));
      reset();
    },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => subjectsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.subjects.all });
      flash(t("subjectUpdated"));
      reset();
    },
  });
  const remove = useMutation({
    mutationFn: subjectsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.subjects.all });
      flash(t("deleted"));
    },
  });

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
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  return (
    <div className="subjects-page">
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
        <h2>{editId ? t("editSubject") : t("addSubject")}</h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("subjectName")}
            </label>
            <input
              type="text"
              name="SubjectName"
              value={form.SubjectName}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>{t("className")}</label>
            <select
              name="ClassID"
              value={form.ClassID}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
            >
              <option value="">{t("selectClass")}</option>
              {classes.map((c) => (
                <option key={c.ClassID || c.id} value={c.ClassID || c.id}>
                  {c.className || c.ClassName} – {c.section || c.Section}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="submit" className="btn-primary">
            {editId ? t("updateSubject") : t("addSubject")}
          </button>
          {editId && (
            <button type="button" onClick={reset} className="btn-secondary">
              {t("cancel")}
            </button>
          )}
        </div>
      </form>
      <h2>{t("allSubjects")}</h2>
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
              <th className="table-header">{t("name")}</th>
              <th className="table-header">{t("className")}</th>
              <th className="table-header">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.SubjectID}>
                <td className="table-cell">{s.SubjectName}</td>
                <td className="table-cell">{s.ClassName || s.ClassID}</td>
                <td className="table-cell">
                  <button
                    onClick={() => {
                      setEditId(s.SubjectID);
                      setForm({
                        SubjectName: s.SubjectName,
                        ClassID: s.ClassID || "",
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
                    {tCommon("edit")}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t("deleteConfirm"))) remove.mutate(s.SubjectID);
                    }}
                    style={{
                      color: "#dc2626",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {tCommon("delete")}
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
