"use client";

import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentsService } from "@/services/students.service";
import { classesService } from "@/services/classes.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import { FiEdit2, FiTrash2, FiUserPlus, FiUsers, FiSearch, FiX } from "react-icons/fi";

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

const FILTER_EMPTY = { search: "", className: "", section: "", gender: "" };

export default function AdminPage() {
  const qc = useQueryClient();
  const formRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState({ error: null, success: null });
  const [filters, setFilters] = useState(FILTER_EMPTY);
  const t = useTranslations("admin.students");

  const { data: students = [], isLoading } = useQuery({
    queryKey: queryKeys.students.all,
    queryFn: studentsService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });

  // Distinct classes for form dropdowns
  const { data: distinctClasses = [] } = useQuery({
    queryKey: queryKeys.classes.distinct,
    queryFn: classesService.getDistinct,
    select: (d) => d?.data ?? d ?? [],
  });

  const classNames = useMemo(
    () => [...new Set(distinctClasses.map((c) => c.ClassName))].sort(),
    [distinctClasses],
  );
  const formSections = useMemo(
    () =>
      distinctClasses
        .filter((c) => c.ClassName === form.ClassName)
        .map((c) => c.Section)
        .sort(),
    [distinctClasses, form.ClassName],
  );

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

  // When class changes in the form, reset section and auto-fill if only one exists
  const handleClassChange = (e) => {
    const cls = e.target.value;
    const sections = distinctClasses
      .filter((c) => c.ClassName === cls)
      .map((c) => c.Section)
      .sort();
    setForm((p) => ({
      ...p,
      ClassName: cls,
      Section: sections.length === 1 ? sections[0] : "",
    }));
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };
  const clearFilters = () => setFilters(FILTER_EMPTY);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) await update.mutateAsync({ id: editId, data: form });
      else await create.mutateAsync(form);
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  // Derive unique class/section options from loaded data
  const classOptions = useMemo(
    () => [...new Set(students.map((s) => s.ClassName).filter(Boolean))].sort(),
    [students],
  );
  const sectionOptions = useMemo(
    () => [...new Set(students.map((s) => s.Section).filter(Boolean))].sort(),
    [students],
  );

  // Client-side filtering
  const filtered = useMemo(() => {
    const search = filters.search.toLowerCase().trim();
    return students.filter((s) => {
      if (
        filters.className &&
        (s.ClassName || "").toLowerCase() !== filters.className.toLowerCase()
      )
        return false;
      if (
        filters.section &&
        (s.Section || "").toLowerCase() !== filters.section.toLowerCase()
      )
        return false;
      if (filters.gender && (s.Gender || "") !== filters.gender) return false;
      if (search) {
        const fullName = `${s.FirstName} ${s.LastName}`.toLowerCase();
        const roll = (s.RollNumber || "").toLowerCase();
        if (!fullName.includes(search) && !roll.includes(search)) return false;
      }
      return true;
    });
  }, [students, filters]);

  const isFiltered =
    filters.search || filters.className || filters.section || filters.gender;

  const TEXT_FIELDS = [
    ["FirstName", t("firstName")],
    ["LastName", t("lastName")],
    ["RollNumber", t("rollNumber")],
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
      <div ref={formRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
            {/* First Name, Last Name, Roll Number */}
            {TEXT_FIELDS.slice(0, 3).map(([name, label]) => (
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

            {/* Class dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("class")}
              </label>
              <select
                name="ClassName"
                value={form.ClassName}
                onChange={handleClassChange}
                className="form-input"
              >
                <option value="">Select class</option>
                {classNames.map((cn) => (
                  <option key={cn} value={cn}>{cn}</option>
                ))}
              </select>
            </div>

            {/* Section dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("section")}
              </label>
              <select
                name="Section"
                value={form.Section}
                onChange={handleChange}
                className="form-input"
                disabled={!form.ClassName}
              >
                <option value="">Select section</option>
                {formSections.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {/* Gender */}
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

            {/* Remaining text fields: contact, email, address */}
            {TEXT_FIELDS.slice(3).map(([name, label]) => (
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
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <FiUsers className="text-slate-600 text-sm" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {t("allStudents")}
              </h2>
              <p className="text-xs text-slate-400">
                {isFiltered
                  ? `${filtered.length} of ${students.length} records`
                  : `${students.length} total records`}
              </p>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search by name / roll */}
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Name or roll number..."
                  className="form-input pl-8"
                />
              </div>
            </div>

            {/* Class filter */}
            <div className="min-w-36">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Class
              </label>
              <select
                name="className"
                value={filters.className}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">All Classes</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Section filter */}
            <div className="min-w-28">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Section
              </label>
              <select
                name="section"
                value={filters.section}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">All Sections</option>
                {sectionOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Gender filter */}
            <div className="min-w-28">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Gender
              </label>
              <select
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Clear button */}
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="btn-secondary flex items-center gap-1.5"
                title="Clear filters"
              >
                <FiX className="text-xs" />
                Clear
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            {t("loading")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FiUsers className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">
              {isFiltered ? "No students match the current filters" : "No students found"}
            </p>
            {isFiltered && (
              <button onClick={clearFilters} className="mt-3 text-xs text-indigo-600 hover:underline">
                Clear filters
              </button>
            )}
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
                {filtered.map((s, i) => (
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
                              AdmissionDate: s.AdmissionDate?.split("T")[0] || "",
                            });
                            setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
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
