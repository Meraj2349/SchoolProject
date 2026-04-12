"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentsService } from "@/services/students.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import { FiEdit2, FiTrash2, FiUserPlus, FiUsers } from "react-icons/fi";

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
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage student records and information
        </p>
      </div>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FiUserPlus className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            {editId ? t("editStudent") : t("addStudent")}
          </h2>
        </div>
        <form onSubmit={handleSave} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEXT_FIELDS.map(([name, label]) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {label}
                </label>
                <input
                  type="text"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("gender")}
              </label>
              <select
                name="Gender"
                value={form.Gender}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Male">{t("male")}</option>
                <option value="Female">{t("female")}</option>
                <option value="Other">{t("other")}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("dateOfBirth")}
              </label>
              <input
                type="date"
                name="DateOfBirth"
                value={form.DateOfBirth}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("admissionDate")}
              </label>
              <input
                type="date"
                name="AdmissionDate"
                value={form.AdmissionDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
            <button type="submit" className="btn-primary">
              {editId ? t("updateStudent") : t("addStudent")}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
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
            <h2 className="text-base font-semibold text-slate-800">
              {t("allStudents")}
            </h2>
            <p className="text-xs text-slate-400">
              {students.length} total records
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            {t("loading")}
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FiUsers className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className="table-header">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr
                    key={s.StudentID}
                    className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                          {s.FirstName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {s.FirstName} {s.LastName}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                        {s.ClassName}
                      </span>
                    </td>
                    <td className="table-cell text-slate-600">{s.Section}</td>
                    <td className="table-cell">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {s.RollNumber}
                      </span>
                    </td>
                    <td className="table-cell text-slate-600">
                      {s.ParentContact || "–"}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditId(s.StudentID);
                            setForm({
                              ...s,
                              DateOfBirth: s.DateOfBirth?.split("T")[0] || "",
                              AdmissionDate:
                                s.AdmissionDate?.split("T")[0] || "",
                            });
                          }}
                          className="btn-icon edit"
                          title={t("editStudent")}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t("deleteConfirm")))
                              remove.mutate(s.StudentID);
                          }}
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
