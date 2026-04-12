"use client";

import { useState } from "react";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "@/hooks/useEvents";
import { useTranslations } from "@/store/languageStore";
import "@/styles/EventsPage.css";

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
    <div className="admin-events-page" style={{ padding: 0 }}>
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
        <h2>{editId ? t("editEvent") : t("addEvent")}</h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("eventName")}
            </label>
            <input
              type="text"
              name="EventName"
              value={form.EventName}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>{t("type")}</label>
            <select
              name="EventType"
              value={form.EventType}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
            >
              {EVENT_TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {tp}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("startDate")}
            </label>
            <input
              type="date"
              name="StartDate"
              value={form.StartDate}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("endDate")}
            </label>
            <input
              type="date"
              name="EndDate"
              value={form.EndDate}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>
              {t("venue")}
            </label>
            <input
              type="text"
              name="Venue"
              value={form.Venue}
              onChange={handleChange}
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
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
      <h2>
        {t("allEvents")} ({events.length})
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
            {events.map((ev) => (
              <tr key={ev.EventID}>
                <td className="table-cell">{ev.EventName}</td>
                <td className="table-cell">{ev.EventType}</td>
                <td className="table-cell">
                  {ev.StartDate
                    ? new Date(ev.StartDate).toLocaleDateString()
                    : "–"}
                </td>
                <td className="table-cell">
                  {ev.EndDate ? new Date(ev.EndDate).toLocaleDateString() : "–"}
                </td>
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
                    style={{
                      color: "#2563eb",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      marginRight: 8,
                    }}
                  >
                    {t("editEvent")}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t("deleteConfirm")))
                        remove.mutate(ev.EventID);
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
