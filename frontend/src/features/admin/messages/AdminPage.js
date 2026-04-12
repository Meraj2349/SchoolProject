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
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {editId ? t("editMessage") : t("addMessage")}
        </h2>
        <textarea
          value={form.Messages}
          onChange={(e) => setForm((p) => ({ ...p, Messages: e.target.value }))}
          rows={8}
          placeholder={t("messagePlaceholder")}
          className="form-input mb-3"
        />
        <div className="flex items-center gap-3 mt-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.Show}
              onChange={(e) =>
                setForm((p) => ({ ...p, Show: e.target.checked }))
              }
              className="w-4 h-4 accent-blue-600"
            />
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

      {/* Message list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {t("allMessages")}
        </h2>
        {isLoading ? (
          <p className="text-gray-500">{t("loading")}</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.MessageID}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                  {m.Messages?.substring(0, 200)}
                  {m.Messages?.length > 200 ? "…" : ""}
                </p>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400">
                    {m.Show ? t("visible") : t("hidden")}
                  </span>
                  <button
                    onClick={() => handleEdit(m)}
                    className="btn-icon edit"
                    title={t("editMessage")}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(m.MessageID)}
                    className="btn-icon delete"
                    title={t("deleteConfirm")}
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
