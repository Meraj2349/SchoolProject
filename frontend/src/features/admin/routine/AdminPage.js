"use client";

import { useState, useRef } from "react";
import {
  useRoutines,
  useCreateRoutine,
  useUpdateRoutine,
  useDeleteRoutine,
} from "@/hooks/useRoutines";
import { useClasses } from "@/hooks/useClasses";
import { useTranslations } from "@/store/languageStore";
import "@/styles/AdminRoutine.css";

const EMPTY = {
  RoutineTitle: "",
  ClassID: "",
  RoutineDate: "",
  Description: "",
};

export default function AdminPage() {
  const { data: routines = [], isLoading } = useRoutines();
  const { data: classes = [] } = useClasses();
  const create = useCreateRoutine();
  const update = useUpdateRoutine();
  const remove = useDeleteRoutine();
  const t = useTranslations("admin.routine");

  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState({ error: null, success: null });
  const fileRef = useRef();

  const flash = (m, e = false) => {
    setStatus(e ? { error: m, success: null } : { error: null, success: m });
    setTimeout(() => setStatus({ error: null, success: null }), 4000);
  };
  const reset = () => {
    setForm(EMPTY);
    setEditId(null);
    if (fileRef.current) fileRef.current.value = "";
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    try {
      if (editId) await update.mutateAsync({ id: editId, data: form, file });
      else await create.mutateAsync({ data: form, file });
      flash(editId ? t("routineUpdated") : t("routineAdded"));
      reset();
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  const fmtDate = (d) => {
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  const TABLE_HEADERS = [
    t("titleCol"),
    t("classCol"),
    t("dateCol"),
    t("fileCol"),
    t("actionsCol"),
  ];

  return (
    <div className="admin-routine-page">
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
        <h2>{editId ? t("editRoutine") : t("addRoutine")}</h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("routineTitle")}
            </label>
            <input
              type="text"
              name="RoutineTitle"
              value={form.RoutineTitle}
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
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>{t("date")}</label>
            <input
              type="date"
              name="RoutineDate"
              value={form.RoutineDate}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>{t("file")}</label>
            <input
              type="file"
              ref={fileRef}
              accept=".pdf,image/*"
              style={{ marginTop: 4, display: "block" }}
            />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("description")}
            </label>
            <textarea
              name="Description"
              value={form.Description}
              onChange={handleChange}
              rows={3}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={create.isPending || update.isPending}
          >
            {editId ? t("updateRoutine") : t("addRoutine")}
          </button>
          {editId && (
            <button type="button" onClick={reset} className="btn-secondary">
              {t("cancel")}
            </button>
          )}
        </div>
      </form>
      <h2>
        {t("allRoutines")} ({routines.length})
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
            {routines.map((r) => (
              <tr key={r.RoutineID}>
                <td className="table-cell">{r.RoutineTitle}</td>
                <td className="table-cell">
                  {r.ClassName} – {r.Section}
                </td>
                <td className="table-cell">{fmtDate(r.RoutineDate)}</td>
                <td className="table-cell">
                  {r.FileURL ? (
                    <a
                      href={r.FileURL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("view")}
                    </a>
                  ) : (
                    "–"
                  )}
                </td>
                <td className="table-cell">
                  <button
                    onClick={() => {
                      setEditId(r.RoutineID);
                      setForm({
                        RoutineTitle: r.RoutineTitle || "",
                        ClassID: r.ClassID || "",
                        RoutineDate: r.RoutineDate?.split("T")[0] || "",
                        Description: r.Description || "",
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
                    {t("editRoutine")}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t("deleteConfirm")))
                        remove.mutate(r.RoutineID);
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
