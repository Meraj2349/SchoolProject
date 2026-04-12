"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examsService } from "@/services/exams.service";
import { classesService } from "@/services/classes.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import "@/styles/ExamsPage.css";

const EMPTY = {
  ExamType: "",
  ExamName: "",
  ClassName: "",
  SectionName: "",
  ExamDate: "",
};

export default function AdminPage() {
  const qc = useQueryClient();
  const t = useTranslations("admin.exams");

  const { data: exams = [], isLoading } = useQuery({
    queryKey: queryKeys.exams.all,
    queryFn: examsService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });
  const { data: classes = [] } = useQuery({
    queryKey: queryKeys.classes.all,
    queryFn: classesService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });

  const create = useMutation({
    mutationFn: examsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exams.all });
      flash(t("examAdded"));
      reset();
    },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => examsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exams.all });
      flash(t("examUpdated"));
      reset();
    },
  });
  const remove = useMutation({
    mutationFn: examsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exams.all });
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

  const TABLE_HEADERS = [
    t("name"),
    t("examType"),
    t("class"),
    t("date"),
    t("actions"),
  ];
  const EXAM_TYPES = [
    t("halfYearly"),
    t("annual"),
    t("unitTest"),
    t("monthly"),
  ];
  const EXAM_TYPE_VALUES = ["Half Yearly", "Annual", "Unit Test", "Monthly"];

  return (
    <div className="exams-page">
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
        <h2>{editId ? t("editExam") : t("addExam")}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("examType")}
            </label>
            <select
              name="ExamType"
              value={form.ExamType}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
            >
              <option value="">{t("selectType")}</option>
              {EXAM_TYPE_VALUES.map((tp, i) => (
                <option key={tp} value={tp}>
                  {EXAM_TYPES[i]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("examName")}
            </label>
            <input
              type="text"
              name="ExamName"
              value={form.ExamName}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("class")}
            </label>
            <select
              name="ClassName"
              value={form.ClassName}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
            >
              <option value="">{t("selectClass")}</option>
              {[...new Set(classes.map((c) => c.className || c.ClassName))].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("section")}
            </label>
            <input
              type="text"
              name="SectionName"
              value={form.SectionName}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
              placeholder={t("sectionPlaceholder")}
            />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("examDate")}
            </label>
            <input
              type="date"
              name="ExamDate"
              value={form.ExamDate}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="submit" className="btn-primary">
            {editId ? t("updateExam") : t("addExam")}
          </button>
          {editId && (
            <button type="button" onClick={reset} className="btn-secondary">
              {t("cancel")}
            </button>
          )}
        </div>
      </form>
      <h2>
        {t("allExams")} ({exams.length})
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
            {exams.map((ex) => (
              <tr key={ex.ExamID}>
                <td className="table-cell">{ex.ExamName}</td>
                <td className="table-cell">{ex.ExamType}</td>
                <td className="table-cell">
                  {ex.ClassName} {ex.SectionName && `– ${ex.SectionName}`}
                </td>
                <td className="table-cell">
                  {ex.ExamDate
                    ? new Date(ex.ExamDate).toLocaleDateString()
                    : "–"}
                </td>
                <td className="table-cell">
                  <button
                    onClick={() => {
                      setEditId(ex.ExamID);
                      setForm({
                        ExamType: ex.ExamType || "",
                        ExamName: ex.ExamName || "",
                        ClassName: ex.ClassName || "",
                        SectionName: ex.SectionName || "",
                        ExamDate: ex.ExamDate?.split("T")[0] || "",
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
                    {t("editExam")}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t("deleteConfirm")))
                        remove.mutate(ex.ExamID);
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
