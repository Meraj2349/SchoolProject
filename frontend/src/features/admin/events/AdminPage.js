"use client";

import { useState } from "react";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "@/hooks/useEvents";
import { useTranslations } from "@/store/languageStore";

const EMPTY = {
  EventName: "",
  EventType: "Academic",
  StartDate: "",
  EndDate: "",
  Venue: "",
  Description: "",
};
const EVENT_TYPES = ["Academic", "Sports", "Cultural", "Other"];

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
      flash(editId ? t("eventUpdated") : t("eventAdded"));
      reset();
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  const TABLE_HEADERS = [t("name"), t("type"), t("start"), t("end"), t("venue"), t("actions")];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {editId ? t("editEvent") : t("addEvent")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("eventName")}</label>
            <input type="text" name="EventName" value={form.EventName} onChange={handleChange} className="form-input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("type")}</label>
            <select name="EventType" value={form.EventType} onChange={handleChange} className="form-input">
              {EVENT_TYPES.map((tp) => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("startDate")}</label>
            <input type="date" name="StartDate" value={form.StartDate} onChange={handleChange} className="form-input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("endDate")}</label>
            <input type="date" name="EndDate" value={form.EndDate} onChange={handleChange} className="form-input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("venue")}</label>
            <input type="text" name="Venue" value={form.Venue} onChange={handleChange} className="form-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("description")}</label>
            <textarea name="Description" value={form.Description} onChange={handleChange} rows={3} className="form-input" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn-primary">{editId ? t("updateEvent") : t("addEvent")}</button>
          {editId && <button type="button" onClick={reset} className="btn-secondary">{t("cancel")}</button>}
        </div>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">
            {t("allEvents")} ({events.length})
          </h2>
        </div>
        {isLoading ? (
          <p className="p-6 text-gray-500">{t("loading")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {TABLE_HEADERS.map((h) => <th key={h} className="table-header">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.EventID} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{ev.EventName}</td>
                    <td className="table-cell">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {ev.EventType}
                      </span>
                    </td>
                    <td className="table-cell">{ev.StartDate ? new Date(ev.StartDate).toLocaleDateString() : "–"}</td>
                    <td className="table-cell">{ev.EndDate ? new Date(ev.EndDate).toLocaleDateString() : "–"}</td>
                    <td className="table-cell">{ev.Venue || "–"}</td>
                    <td className="table-cell">
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
                        className="text-blue-600 bg-transparent border-none cursor-pointer text-sm font-medium hover:text-blue-800 mr-3 transition-colors"
                      >
                        {t("editEvent")}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t("deleteConfirm"))) remove.mutate(ev.EventID);
                        }}
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
