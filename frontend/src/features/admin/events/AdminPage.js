"use client";

import { useState } from "react";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "@/hooks/useEvents";
import { useTranslations } from "@/store/languageStore";
import { FiEdit2, FiTrash2, FiCalendar, FiPlusCircle } from "react-icons/fi";

const EMPTY = {
  EventName: "",
  EventType: "Academic",
  StartDate: "",
  EndDate: "",
  Venue: "",
  Description: "",
};
const EVENT_TYPES = ["Academic", "Sports", "Cultural", "Other"];
const EVENT_TYPE_COLORS = {
  Academic: "bg-blue-50 text-blue-700",
  Sports: "bg-green-50 text-green-700",
  Cultural: "bg-purple-50 text-purple-700",
  Other: "bg-slate-100 text-slate-700",
};

export default function AdminPage() {
  const { data: events = [], isLoading } = useEvents();
  const create = useCreateEvent();
  const update = useUpdateEvent();
  const remove = useDeleteEvent();
  const t = useTranslations("admin.events");

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
      flash(editId ? t("eventUpdated") : t("eventAdded"));
      reset();
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  const TABLE_HEADERS = [
    t("name"),
    t("type"),
    t("start"),
    t("end"),
    t("venue"),
    t("actions"),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Schedule and manage school events
        </p>
      </div>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FiPlusCircle className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            {editId ? t("editEvent") : t("addEvent")}
          </h2>
        </div>
        <form onSubmit={handleSave} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("eventName")}
              </label>
              <input
                type="text"
                name="EventName"
                value={form.EventName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("type")}
              </label>
              <select
                name="EventType"
                value={form.EventType}
                onChange={handleChange}
                className="form-input"
              >
                {EVENT_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("startDate")}
              </label>
              <input
                type="date"
                name="StartDate"
                value={form.StartDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("endDate")}
              </label>
              <input
                type="date"
                name="EndDate"
                value={form.EndDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("venue")}
              </label>
              <input
                type="text"
                name="Venue"
                value={form.Venue}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("description")}
              </label>
              <textarea
                name="Description"
                value={form.Description}
                onChange={handleChange}
                rows={3}
                className="form-input"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
            <button type="submit" className="btn-primary">
              {editId ? t("updateEvent") : t("addEvent")}
            </button>
            {editId && (
              <button type="button" onClick={reset} className="btn-secondary">
                {t("cancel")}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FiCalendar className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {t("allEvents")}
            </h2>
            <p className="text-xs text-slate-400">
              {events.length} total events
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            {t("loading")}
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
                {events.map((ev, i) => (
                  <tr
                    key={ev.EventID}
                    className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                  >
                    <td className="table-cell font-semibold text-slate-800">
                      {ev.EventName}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${EVENT_TYPE_COLORS[ev.EventType] || "bg-slate-100 text-slate-700"}`}
                      >
                        {ev.EventType}
                      </span>
                    </td>
                    <td className="table-cell text-slate-600 whitespace-nowrap">
                      {ev.StartDate
                        ? new Date(ev.StartDate).toLocaleDateString()
                        : "–"}
                    </td>
                    <td className="table-cell text-slate-600 whitespace-nowrap">
                      {ev.EndDate
                        ? new Date(ev.EndDate).toLocaleDateString()
                        : "–"}
                    </td>
                    <td className="table-cell text-slate-600">
                      {ev.Venue || "–"}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditId(ev.EventID);
                            setForm({
                              EventName: ev.EventName || "",
                              EventType: ev.EventType || "Academic",
                              StartDate: ev.StartDate?.split("T")[0] || "",
                              EndDate: ev.EndDate?.split("T")[0] || "",
                              Venue: ev.Venue || "",
                              Description: ev.Description || "",
                            });
                          }}
                          className="btn-icon edit"
                          title={t("editEvent")}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t("deleteConfirm")))
                              remove.mutate(ev.EventID);
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
