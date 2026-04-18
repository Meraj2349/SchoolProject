"use client";

import { useState, useRef, useCallback } from "react";
import {
  useClasses,
  useClassNames,
  useStandardSections,
  useCreateClass,
  useUpdateClass,
  useHardDeleteClass,
} from "@/hooks/useClasses";
import { useBranchStore } from "@/store/branchStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import { FiEdit2, FiPlusCircle, FiGrid, FiTrash2 } from "react-icons/fi";

const EMPTY_FORM = { className: "", section: "" };

export default function ClassesSectionsAdminPage() {
  const { data: classes = [], isLoading } = useClasses();
  const { data: classNameOptions = [] } = useClassNames();
  const { data: sectionOptions = [] } = useStandardSections();
  const create = useCreateClass();
  const update = useUpdateClass();
  const hardRemove = useHardDeleteClass();

  const branchId = useBranchStore((s) => s.currentBranchId);
  const role = useAuthStore((s) => s.role);
  const isSuperAdmin = role === "super_admin";
  const needsBranch = isSuperAdmin && branchId == null;

  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [editTeacherId, setEditTeacherId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const formRef = useRef(null);

  const reset = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setEditTeacherId(null);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (needsBranch) {
      toast.error("Select a branch from the top bar first");
      return;
    }
    if (!form.className.trim()) {
      toast.error("Class name is required");
      return;
    }
    if (!form.section.trim()) {
      toast.error("Section is required");
      return;
    }
    const payload = {
      className: form.className.trim(),
      section: form.section.trim(),
      teacherId: editTeacherId || null,
    };
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, data: payload });
        toast.success("Class updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Class added");
      }
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Save failed");
    }
  };

  const handleEdit = (c) => {
    setEditId(c.ClassID);
    setEditTeacherId(c.TeacherID ?? null);
    setConfirmDeleteId(null);
    setForm({ className: c.ClassName ?? "", section: c.Section ?? "" });
    setTimeout(
      () =>
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  };

  const confirmDelete = (id) => {
    hardRemove.mutate(id, {
      onSuccess: () => {
        toast.success("Class deleted");
        setConfirmDeleteId(null);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error || "Delete failed");
        setConfirmDeleteId(null);
      },
    });
  };

  const isBusy = create.isPending || update.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Class & Section</h1>
        <p className="text-sm text-slate-500 mt-1">
          Add class name and section. Teacher assignment happens separately on
          the Class Teacher page.
        </p>
      </div>

      {needsBranch && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong className="font-semibold">Select a branch</strong> from the
          top bar before adding classes.
        </div>
      )}

      <div
        ref={formRef}
        className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-colors ${
          editId ? "border-2 border-amber-400" : "border border-slate-200"
        }`}
      >
        <div
          className={`px-6 py-4 border-b flex items-center gap-3 ${editId ? "bg-amber-50 border-amber-100" : "border-slate-100"}`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${editId ? "bg-amber-100" : "bg-indigo-50"}`}
          >
            <FiPlusCircle
              className={`text-sm ${editId ? "text-amber-600" : "text-indigo-600"}`}
            />
          </div>
          <h2 className="text-base font-semibold text-slate-800 flex-1">
            {editId ? "Edit Class / Section" : "Add Class / Section"}
          </h2>
          {editId && (
            <button
              type="button"
              onClick={reset}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Class <span className="text-red-400">*</span>
              </label>
              <input
                list="cs-classname-list"
                type="text"
                value={form.className}
                onChange={(e) =>
                  setForm((p) => ({ ...p, className: e.target.value }))
                }
                placeholder="Select or type new class…"
                required
                autoComplete="off"
                className="form-input"
              />
              <datalist id="cs-classname-list">
                {classNameOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Section <span className="text-red-400">*</span>
              </label>
              <input
                list="cs-section-list"
                type="text"
                value={form.section}
                onChange={(e) =>
                  setForm((p) => ({ ...p, section: e.target.value }))
                }
                placeholder="e.g. A, B, Morning…"
                required
                autoComplete="off"
                className="form-input"
              />
              <datalist id="cs-section-list">
                {sectionOptions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
            <button
              type="submit"
              disabled={isBusy || needsBranch}
              className="btn-primary disabled:opacity-60"
            >
              {isBusy ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : editId ? (
                "Update Class"
              ) : (
                "Add Class"
              )}
            </button>
            {editId && (
              <button type="button" onClick={reset} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FiGrid className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              All Classes & Sections
            </h2>
            <p className="text-xs text-slate-400">
              {classes.length} total rows
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            Loading…
          </div>
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FiGrid className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">No classes yet. Add one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Class</th>
                  <th className="table-header">Section</th>
                  <th className="table-header">Teacher</th>
                  <th className="table-header">Students</th>
                  <th className="table-header">Actions</th>
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
                        : "—"}
                    </td>
                    <td className="table-cell text-center">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          c.StudentCount > 0
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {c.StudentCount ?? 0}
                      </span>
                    </td>
                    <td className="table-cell">
                      {confirmDeleteId === c.ClassID ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-red-700 font-medium">
                            Delete class row permanently?
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => confirmDelete(c.ClassID)}
                              disabled={hardRemove.isPending}
                              className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
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
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => setConfirmDeleteId(c.ClassID)}
                              className="btn-icon delete"
                              title="Delete class row (super admin)"
                            >
                              <FiTrash2 />
                            </button>
                          )}
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
