"use client";

import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  useMessages,
  useCreateMessage,
  useUpdateMessage,
  useDeleteMessage,
} from "@/hooks/useMessages";
import { useTranslations } from "@/store/languageStore";
import "@/styles/MessagesPage.css";

export default function AdminPage() {
  const { data: messages = [], isLoading } = useMessages();
  const create = useCreateMessage();
  const update = useUpdateMessage();
  const remove = useDeleteMessage();
  const t = useTranslations("admin.messages");

  const [form, setForm] = useState({ Messages: "", Show: true });
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState({ error: null, success: null });

  const flash = (msg, isErr = false) => {
    setStatus(
      isErr ? { error: msg, success: null } : { error: null, success: msg },
    );
    setTimeout(() => setStatus({ error: null, success: null }), 4000);
  };

  const handleSave = async () => {
    if (!form.Messages.trim()) {
      flash(t("messageRequired"), true);
      return;
    }
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, data: form });
        flash(t("messageUpdated"));
        setEditId(null);
      } else {
        await create.mutateAsync(form);
        flash(t("messageAdded"));
      }
      setForm({ Messages: "", Show: true });
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  const handleEdit = (m) => {
    setForm({ Messages: m.Messages, Show: m.Show });
    setEditId(m.MessageID);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await remove.mutateAsync(id);
      flash(t("deleted"));
    } catch (e) {
      flash(e.message, true);
    }
  };

  return (
    <div className="messages-page">
      <h1>{t("title")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}
      <div className="form-section">
        <h2>{editId ? t("editMessage") : t("addMessage")}</h2>
        <textarea
          value={form.Messages}
          onChange={(e) => setForm((p) => ({ ...p, Messages: e.target.value }))}
          rows={8}
          placeholder={t("messagePlaceholder")}
          className="form-input"
          style={{ width: "100%" }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={form.Show}
              onChange={(e) =>
                setForm((p) => ({ ...p, Show: e.target.checked }))
              }
            />{" "}
            {t("showOnWebsite")}
          </label>
          <button onClick={handleSave} className="btn-primary">
            {editId ? t("update") : t("add")}
          </button>
          {editId && (
            <button
              onClick={() => {
                setEditId(null);
                setForm({ Messages: "", Show: true });
              }}
              className="btn-secondary"
            >
              {t("cancel")}
            </button>
          )}
        </div>
      </div>
      <div className="list-section">
        <h2>{t("allMessages")}</h2>
        {isLoading ? (
          <p>{t("loading")}</p>
        ) : (
          <div>
            {messages.map((m) => (
              <div
                key={m.MessageID}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <p style={{ marginBottom: 8 }}>
                  {m.Messages?.substring(0, 200)}
                  {m.Messages?.length > 200 ? "…" : ""}
                </p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    {m.Show ? t("visible") : t("hidden")}
                  </span>
                  <button
                    onClick={() => handleEdit(m)}
                    className="btn-icon edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(m.MessageID)}
                    className="btn-icon delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
