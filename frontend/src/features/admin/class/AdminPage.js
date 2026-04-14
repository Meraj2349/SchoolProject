"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
} from "@/hooks/useClasses";
import { classesService } from "@/services/classes.service";
import { teachersService } from "@/services/teachers.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import { toast } from "react-toastify";
import {
  FiEdit2,
  FiPlusCircle,
  FiGrid,
  FiSearch,
  FiChevronDown,
  FiX,
  FiUserMinus,
} from "react-icons/fi";

// ─────────────────────────────────────────────────────────────────────────────
// Reusable autocomplete combobox (plain React + Tailwind, no external lib)
// ─────────────────────────────────────────────────────────────────────────────
function Autocomplete({
  label,
  value,
  onChange,
  suggestions,
  onSelect,
  placeholder = "",
  renderSuggestion,
  disabled = false,
  required = false,
  isLoading = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setOpen(true);
  };

  const handleSelect = (item) => {
    onSelect(item);
    setOpen(false);
  };

  const showDropdown = open && (suggestions.length > 0 || isLoading);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className="form-input pl-8 pr-8"
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={() => { onChange(""); onSelect(null); setOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            <FiX className="text-xs" />
          </button>
        )}
      </div>
      {showDropdown && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {isLoading ? (
            <li className="px-4 py-3 text-xs text-slate-400 text-center">
              <span className="inline-block w-3 h-3 border border-slate-300 border-t-indigo-500 rounded-full animate-spin mr-1.5 align-middle" />
              Searching…
            </li>
          ) : (
            suggestions.map((item, idx) => (
              <li
                key={idx}
                onMouseDown={() => handleSelect(item)}
                className="px-4 py-2.5 cursor-pointer hover:bg-indigo-50 text-sm text-slate-700 border-b border-slate-50 last:border-0"
              >
                {renderSuggestion ? renderSuggestion(item) : String(item)}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filterable select (dropdown with filter-as-you-type)
// ─────────────────────────────────────────────────────────────────────────────
function FilterableSelect({
  label,
  value,
  onSelect,
  options,
  placeholder = "Select…",
  required = false,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setFilter("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!filter.trim()) return options;
    const q = filter.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, filter]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setFilter("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (opt) => {
    onSelect(opt);
    setOpen(false);
    setFilter("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(null);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`form-input w-full flex items-center justify-between text-left ${
          disabled ? "opacity-60 cursor-not-allowed bg-slate-50" : "cursor-pointer"
        } ${!selectedLabel ? "text-slate-400" : "text-slate-800"}`}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              onMouseDown={handleClear}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <FiX className="text-xs" />
            </span>
          )}
          <FiChevronDown
            className={`text-slate-400 text-xs transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg">
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
              className="form-input text-sm py-1.5"
              autoComplete="off"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-slate-400 text-center">
                No options found
              </li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  onMouseDown={() => handleSelect(opt)}
                  className={`px-4 py-2.5 cursor-pointer hover:bg-indigo-50 text-sm border-b border-slate-50 last:border-0 ${
                    opt.value === value
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-slate-700"
                  }`}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  className: "",
  section: "",
  teacherId: "",
  teacherInput: "", // display text in the teacher autocomplete input
};

export default function AdminPage() {
  const { data: classes = [], isLoading } = useClasses();
  const create = useCreateClass();
  const update = useUpdateClass();
  const remove = useDeleteClass();
  const t = useTranslations("admin.classes");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const formRef = useRef(null);

  // Teacher autocomplete query — fires when user has typed >= 1 char
  const teacherQuery = form.teacherInput.trim();
  const { data: teacherSuggestions = [], isFetching: teacherSearching } =
    useQuery({
      queryKey: queryKeys.teachers.search(teacherQuery, form.className),
      queryFn: () => teachersService.search(teacherQuery, form.className),
      enabled: teacherQuery.length >= 1 && !form.teacherId,
      staleTime: 10_000,
    });

  // Distinct classes (class name + section combos) for dropdowns
  const { data: distinctClasses = [] } = useQuery({
    queryKey: queryKeys.classes.distinct,
    queryFn: classesService.getDistinct,
    staleTime: 60_000,
  });

  // Unique class names for the class combobox
  const classNameOptions = useMemo(() => {
    const seen = new Set();
    return distinctClasses
      .filter((r) => {
        if (seen.has(r.ClassName)) return false;
        seen.add(r.ClassName);
        return true;
      })
      .map((r) => ({ value: r.ClassName, label: r.ClassName }));
  }, [distinctClasses]);

  // Sections that belong to the currently selected class
  const sectionOptions = useMemo(() => {
    if (!form.className) return [];
    return distinctClasses
      .filter((r) => r.ClassName === form.className)
      .map((r) => ({ value: r.Section, label: r.Section }));
  }, [distinctClasses, form.className]);

  const reset = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditId(null);
  }, []);

  const handleTeacherSelect = (teacher) => {
    if (!teacher) {
      setForm((p) => ({ ...p, teacherId: "", teacherInput: "" }));
      return;
    }
    setForm((p) => ({
      ...p,
      teacherId: String(teacher.TeacherID),
      teacherInput: `${teacher.FirstName} ${teacher.LastName}`,
    }));
  };

  const handleClassSelect = (opt) => {
    if (!opt) {
      setForm((p) => ({ ...p, className: "", section: "" }));
      return;
    }
    const sections = distinctClasses
      .filter((r) => r.ClassName === opt.value)
      .map((r) => r.Section);
    const autoSection = sections.length === 1 ? sections[0] : "";
    setForm((p) => ({ ...p, className: opt.value, section: autoSection }));
  };

  const handleSectionSelect = (opt) => {
    setForm((p) => ({ ...p, section: opt ? opt.value : "" }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.className.trim()) {
      toast.error("Class name is required");
      return;
    }
    if (!form.section.trim()) {
      toast.error("Section is required");
      return;
    }
    if (!form.teacherId) {
      toast.error("Please select a teacher from the suggestions");
      return;
    }

    const payload = {
      className: form.className.trim(),
      section: form.section.trim(),
      teacherId: form.teacherId,
    };

    try {
      if (editId) {
        await update.mutateAsync({ id: editId, data: payload });
        toast.success(t("classUpdated") || "Class updated successfully");
      } else {
        await create.mutateAsync(payload);
        toast.success(t("classAdded") || "Class added successfully");
      }
      reset();
    } catch (err) {
      toast.error(
        err?.response?.data?.error || err.message || t("operationFailed"),
      );
    }
  };

  const handleEdit = (c) => {
    setEditId(c.ClassID);
    setConfirmDeleteId(null);
    setForm({
      className: c.ClassName ?? "",
      section: c.Section ?? "",
      teacherId: c.TeacherID ? String(c.TeacherID) : "",
      teacherInput: c.TeacherFirstName
        ? `${c.TeacherFirstName} ${c.TeacherLastName ?? ""}`.trim()
        : "",
    });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleDelete = (c) => {
    // Only open the confirm prompt if a teacher is actually assigned
    if (!c.TeacherID) return;
    setConfirmDeleteId(c.ClassID);
  };

  const confirmDelete = (classId) => {
    remove.mutate(classId, {
      onSuccess: () => {
        toast.success("Teacher unassigned successfully");
        setConfirmDeleteId(null);
      },
      onError: (err) => {
        const msg = err?.response?.data?.error || err.message || "Failed to unassign teacher";
        toast.error(msg);
        setConfirmDeleteId(null);
      },
    });
  };

  const TABLE_HEADERS = [
    t("className"),
    t("section"),
    t("teacherName"),
    t("subject"),
    "Students",
    t("actions"),
  ];

  const isBusy = create.isPending || update.isPending;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage class sections and assigned class teachers
        </p>
      </div>

      {/* ── Form card ────────────────────────────────────────────────────── */}
      <div
        ref={formRef}
        className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-colors ${
          editId ? "border-2 border-amber-400" : "border border-slate-200"
        }`}
      >
        <div className={`px-6 py-4 border-b flex items-center gap-3 ${editId ? "bg-amber-50 border-amber-100" : "border-slate-100"}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editId ? "bg-amber-100" : "bg-indigo-50"}`}>
            <FiPlusCircle className={`text-sm ${editId ? "text-amber-600" : "text-indigo-600"}`} />
          </div>
          <h2 className="text-base font-semibold text-slate-800 flex-1">
            {editId ? t("editClass") || "Edit Class Teacher" : t("addClass") || "Add Class Teacher"}
          </h2>
          {editId && (
            <button type="button" onClick={reset} className="text-xs text-slate-500 hover:text-slate-700 underline">
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Teacher autocomplete */}
            <Autocomplete
              label={t("teacherName") || "Class Teacher (Head of Class)"}
              value={form.teacherInput}
              onChange={(val) =>
                setForm((p) => ({ ...p, teacherInput: val, teacherId: "" }))
              }
              suggestions={teacherSuggestions}
              onSelect={handleTeacherSelect}
              placeholder="Type teacher name…"
              required
              isLoading={teacherSearching}
              renderSuggestion={(teacher) => (
                <div className="flex flex-col">
                  <span className="font-medium">
                    {teacher.FirstName} {teacher.LastName}
                  </span>
                  <span className="text-xs text-slate-400">
                    {teacher.Subject}
                    {teacher.Email ? ` · ${teacher.Email}` : ""}
                  </span>
                </div>
              )}
            />

            {/* Class name combobox */}
            <FilterableSelect
              label={t("className") || "Class"}
              value={form.className}
              onSelect={handleClassSelect}
              options={classNameOptions}
              placeholder="Select class…"
              required
            />

            {/* Section — auto-populated from chosen class */}
            <FilterableSelect
              label={t("section") || "Section"}
              value={form.section}
              onSelect={handleSectionSelect}
              options={sectionOptions}
              placeholder={
                form.className ? "Select section…" : "Choose a class first"
              }
              disabled={!form.className}
              required
            />
          </div>

          {/* Confirmation strip — shows resolved teacher + class */}
          {(form.teacherId || form.className) && (
            <div className="mt-4 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700 flex flex-wrap gap-x-4 gap-y-1">
              {form.teacherId && (
                <span>
                  <span className="font-semibold">Teacher:</span>{" "}
                  {form.teacherInput}
                </span>
              )}
              {form.className && (
                <span>
                  <span className="font-semibold">Class:</span> {form.className}
                  {form.section ? ` — Section ${form.section}` : ""}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
            <button
              type="submit"
              disabled={isBusy}
              className="btn-primary disabled:opacity-60"
            >
              {isBusy ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : editId ? (
                t("updateClass")
              ) : (
                t("addClass")
              )}
            </button>
            {editId && (
              <button type="button" onClick={reset} className="btn-secondary">
                {t("cancel")}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Table card ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FiGrid className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {t("allClasses")}
            </h2>
            <p className="text-xs text-slate-400">
              {classes.length} total classes
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            {t("loading")}
          </div>
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FiGrid className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">No classes found. Add one above.</p>
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
                {classes.map((c, i) => (
                  <tr
                    key={c.ClassID}
                    className={`hover:bg-indigo-50/30 transition-colors ${
                      i % 2 === 0 ? "" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="table-cell">
                      <span className="font-semibold text-slate-800">
                        {c.ClassName}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                        {c.Section}
                      </span>
                    </td>
                    <td className="table-cell text-slate-700">
                      {c.TeacherFirstName
                        ? `${c.TeacherFirstName} ${c.TeacherLastName ?? ""}`.trim()
                        : "–"}
                    </td>
                    <td className="table-cell text-slate-600 text-sm">
                      {c.TeacherSubject ?? "–"}
                    </td>
                    <td className="table-cell text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        c.StudentCount > 0
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-400"
                      }`}>
                        {c.StudentCount ?? 0}
                      </span>
                    </td>
                    <td className="table-cell">
                      {confirmDeleteId === c.ClassID ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-amber-700 font-medium">
                            Unassign teacher?
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => confirmDelete(c.ClassID)}
                              disabled={remove.isPending}
                              className="text-xs px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs px-2 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(c)}
                            className="btn-icon edit"
                            title={t("editClass")}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            disabled={!c.TeacherID}
                            className={`btn-icon ${c.TeacherID ? "delete" : "opacity-30 cursor-not-allowed"}`}
                            title={c.TeacherID ? "Unassign Teacher" : "No teacher to unassign"}
                          >
                            <FiUserMinus />
                          </button>
                        </div>
                      )}
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
