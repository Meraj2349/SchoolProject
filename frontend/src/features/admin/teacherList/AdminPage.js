"use client";

import { useState } from "react";
import {
  useTeachers,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
} from "@/hooks/useTeachers";
import { useTranslations } from "@/store/languageStore";

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
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {editId ? t("editTeacher") : t("addTeacher")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEXT_FIELDS.map(([name, label, req]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
              <input type="text" name={name} value={form[name]} onChange={handleChange} className="form-input" required={req} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("joiningDate")}</label>
            <input type="date" name="JoiningDate" value={form.JoiningDate} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn-primary">{editId ? t("updateTeacher") : t("addTeacher")}</button>
          {editId && <button type="button" onClick={reset} className="btn-secondary">{t("cancel")}</button>}
        </div>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">
            {t("allTeachers")} ({teachers.length})
          </h2>
        </div>
        {isLoading ? (
          <p className="p-6 text-gray-500">{t("loading")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>{TABLE_HEADERS.map((h) => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.TeacherID} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{teacher.FirstName} {teacher.LastName}</td>
                    <td className="table-cell">{teacher.Subject}</td>
                    <td className="table-cell">{teacher.Email}</td>
                    <td className="table-cell">{teacher.ContactNumber}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => {
                          setEditId(teacher.TeacherID);
                          setForm({ ...teacher, JoiningDate: teacher.JoiningDate?.split("T")[0] || "" });
                        }}
                        className="text-blue-600 bg-transparent border-none cursor-pointer text-sm font-medium hover:text-blue-800 mr-3 transition-colors"
                      >
                        {t("editTeacher")}
                      </button>
                      <button
                        onClick={() => { if (window.confirm(t("deleteConfirm"))) remove.mutate(teacher.TeacherID); }}
                        className="text-red-600 bg-transparent border-none cursor-pointer text-sm font-medium hover:text-red-800 transition-colors"
                      >
                        {t("deleted")}
                      </button>
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
