"use client";

import { useState } from "react";
import {
  useTeachers,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
} from "@/hooks/useTeachers";
import { useTranslations } from "@/store/languageStore";
import { FiEdit2, FiTrash2, FiUserPlus, FiUsers } from "react-icons/fi";

const EMPTY = { FirstName: "", LastName: "", Email: "", Subject: "", ContactNumber: "", JoiningDate: "" };

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
  const reset = () => { setForm(EMPTY); setEditId(null); };
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
    ["FirstName", t("firstName"), true], ["LastName", t("lastName"), true],
    ["Email", t("email"), true], ["Subject", t("subject"), true],
    ["ContactNumber", t("contactNumber"), false],
  ];

  const TABLE_HEADERS = [t("name"), t("subject"), t("email"), t("contact"), t("actions")];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">Manage teaching staff records</p>
      </div>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FiUserPlus className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            {editId ? t("editTeacher") : t("addTeacher")}
          </h2>
        </div>
        <form onSubmit={handleSave} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEXT_FIELDS.map(([name, label, req]) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
                <input type="text" name={name} value={form[name]} onChange={handleChange} className="form-input" required={req} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{t("joiningDate")}</label>
              <input type="date" name="JoiningDate" value={form.JoiningDate} onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
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
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FiUsers className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">{t("allTeachers")}</h2>
            <p className="text-xs text-slate-400">{teachers.length} total records</p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            {t("loading")}
          </div>
        ) : teachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FiUsers className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">No teachers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>{TABLE_HEADERS.map((h) => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody>
                {teachers.map((teacher, i) => (
                  <tr key={teacher.TeacherID} className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs shrink-0">
                          {teacher.FirstName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{teacher.FirstName} {teacher.LastName}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                        {teacher.Subject}
                      </span>
                    </td>
                    <td className="table-cell text-slate-500 text-xs">{teacher.Email}</td>
                    <td className="table-cell text-slate-600">{teacher.ContactNumber}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditId(teacher.TeacherID);
                            setForm({ ...teacher, JoiningDate: teacher.JoiningDate?.split("T")[0] || "" });
                          }}
                          className="btn-icon edit"
                          title={t("editTeacher")}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => { if (window.confirm(t("deleteConfirm"))) remove.mutate(teacher.TeacherID); }}
                          className="btn-icon delete"
                          title={t("deleted")}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
