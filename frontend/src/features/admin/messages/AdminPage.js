"use client";

import { useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiMessageSquare,
  FiPlusCircle,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage chairman messages displayed on the website
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
            <FiPlusCircle className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            {editId ? t("editMessage") : t("addMessage")}
          </h2>
        </div>
        <div className="p-6">
          <textarea
            value={form.Messages}
            onChange={(e) =>
              setForm((p) => ({ ...p, Messages: e.target.value }))
            }
            rows={7}
            placeholder={t("messagePlaceholder")}
            className="form-input"
          />
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.Show}
                onChange={(e) =>
                  setForm((p) => ({ ...p, Show: e.target.checked }))
                }
                className="w-4 h-4 accent-indigo-600"
              />
              {t("showOnWebsite")}
            </label>
          </div>
          <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
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
      </div>

      {/* Message list */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FiMessageSquare className="text-slate-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            {t("allMessages")}
          </h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            {t("loading")}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.MessageID}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  {m.Messages?.substring(0, 200)}
                  {m.Messages?.length > 200 ? "…" : ""}
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${m.Show ? "text-emerald-600" : "text-slate-400"}`}
                  >
                    {m.Show ? (
                      <FiEye className="text-xs" />
                    ) : (
                      <FiEyeOff className="text-xs" />
                    )}
                    {m.Show ? t("visible") : t("hidden")}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => handleEdit(m)}
                      className="btn-icon edit"
                      title={t("editMessage")}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(m.MessageID)}
                      className="btn-icon delete"
                      title={t("deleteConfirm")}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
