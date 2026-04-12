"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentsService } from "@/services/students.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";

const EMPTY = {
  FirstName: "", LastName: "", RollNumber: "", ClassName: "", Section: "",
  Gender: "Male", DateOfBirth: "", ParentContact: "", Address: "", Email: "", AdmissionDate: "",
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.students.all }); flash(t("studentAdded")); resetForm(); },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => studentsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.students.all }); flash(t("studentUpdated")); resetForm(); },
  });
  const remove = useMutation({
    mutationFn: studentsService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.students.all }); flash(t("deleted")); },
  });

  const flash = (msg, isErr = false) => {
    setStatus(isErr ? { error: msg, success: null } : { error: null, success: msg });
    setTimeout(() => setStatus({ error: null, success: null }), 4000);
  };
  const resetForm = () => { setForm(EMPTY); setEditId(null); };
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
    ["FirstName", t("firstName")], ["LastName", t("lastName")],
    ["RollNumber", t("rollNumber")], ["ClassName", t("class")],
    ["Section", t("section")], ["ParentContact", t("parentContact")],
    ["Email", t("email")], ["Address", t("address")],
  ];

  const TABLE_HEADERS = [t("name"), t("class"), t("section"), t("rollNumber"), t("contact"), t("actions")];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {editId ? t("editStudent") : t("addStudent")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEXT_FIELDS.map(([name, label]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
              <input type="text" name={name} value={form[name]} onChange={handleChange} className="form-input" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("gender")}</label>
            <select name="Gender" value={form.Gender} onChange={handleChange} className="form-input">
              <option value="Male">{t("male")}</option>
              <option value="Female">{t("female")}</option>
              <option value="Other">{t("other")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("dateOfBirth")}</label>
            <input type="date" name="DateOfBirth" value={form.DateOfBirth} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("admissionDate")}</label>
            <input type="date" name="AdmissionDate" value={form.AdmissionDate} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn-primary">{editId ? t("updateStudent") : t("addStudent")}</button>
          {editId && <button type="button" onClick={resetForm} className="btn-secondary">{t("cancel")}</button>}
        </div>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">
            {t("allStudents")} ({students.length})
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
                {students.map((s) => (
                  <tr key={s.StudentID} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{s.FirstName} {s.LastName}</td>
                    <td className="table-cell">{s.ClassName}</td>
                    <td className="table-cell">{s.Section}</td>
                    <td className="table-cell">{s.RollNumber}</td>
                    <td className="table-cell">{s.ParentContact || "–"}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => {
                          setEditId(s.StudentID);
                          setForm({ ...s, DateOfBirth: s.DateOfBirth?.split("T")[0] || "", AdmissionDate: s.AdmissionDate?.split("T")[0] || "" });
                        }}
                        className="text-blue-600 bg-transparent border-none cursor-pointer text-sm font-medium hover:text-blue-800 mr-3 transition-colors"
                      >
                        {t("editStudent")}
                      </button>
                      <button
                        onClick={() => { if (window.confirm(t("deleteConfirm"))) remove.mutate(s.StudentID); }}
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
