import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import {
  ALERT_TYPES,
  INITIAL_ALERTS,
} from "../data/alertData";

const TYPE_STYLES = {
  overdue: {
    icon: Clock3,
    iconClass: "text-red-500",
    bgClass: "bg-red-50",
  },
  workload: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50",
  },
  blocked: {
    icon: AlertTriangle,
    iconClass: "text-red-500",
    bgClass: "bg-red-50",
  },
  sprint: {
    icon: Zap,
    iconClass: "text-indigo-500",
    bgClass: "bg-indigo-50",
  },
};

function Toggle({ enabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        enabled ? "bg-indigo-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function AlertCard({ alert, onToggle, onEdit, onDelete }) {
  const style = TYPE_STYLES[alert.type] ?? TYPE_STYLES.overdue;
  const Icon = style.icon;

  return (
    <article
      className={`rounded-xl border bg-white p-5 shadow-sm transition ${
        alert.enabled
          ? "border-slate-200"
          : "border-slate-200 opacity-75"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.bgClass}`}
          >
            <Icon
              className={`h-5 w-5 ${style.iconClass}`}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900">
              {alert.name}
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {alert.description}
            </p>
          </div>
        </div>

        <Toggle
          enabled={alert.enabled}
          onChange={() => onToggle(alert.id)}
          label={`${alert.enabled ? "Disable" : "Enable"} ${alert.name}`}
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span
            className={`h-2 w-2 rounded-full ${
              alert.enabled ? "bg-emerald-500" : "bg-slate-300"
            }`}
          />

          <span
            className={
              alert.enabled
                ? "text-emerald-600"
                : "text-slate-400"
            }
          >
            {alert.enabled ? "Active" : "Disabled"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(alert)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={`Edit ${alert.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(alert)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={`Delete ${alert.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function AlertModal({
  alert,
  onClose,
  onSave,
}) {
  const isEditing = Boolean(alert);

  const [form, setForm] = useState(
    alert ?? {
      type: "overdue",
      name: "",
      description: "",
      enabled: true,
      threshold: 1,
      unit: "day",
    }
  );

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "threshold"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));

    setError("");
  };

  const handleTypeChange = (event) => {
    const type = event.target.value;
    const typeInfo = ALERT_TYPES[type];

    setForm((current) => ({
      ...current,
      type,
      name: current.name || typeInfo.label,
      description:
        current.description || typeInfo.description,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Alert name is required.");
      return;
    }

    if (form.type !== "blocked") {
      if (
        form.threshold === "" ||
        form.threshold === null ||
        Number(form.threshold) < 0
      ) {
        setError("Please enter a valid threshold.");
        return;
      }
    }

    onSave({
      ...form,
      id: alert?.id ?? `ALT-${Date.now()}`,
      name: form.name.trim(),
      description:
        form.description.trim() ||
        ALERT_TYPES[form.type].description,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="alert-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {isEditing ? "Edit alert" : "Create alert"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure when Nexa should notify you.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div>
            <label
              htmlFor="alert-type"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Alert type
            </label>

            <select
              id="alert-type"
              name="type"
              value={form.type}
              onChange={handleTypeChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {Object.entries(ALERT_TYPES).map(
                ([value, info]) => (
                  <option key={value} value={value}>
                    {info.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="alert-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Alert name
            </label>

            <input
              id="alert-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="High workload alert"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {form.type !== "blocked" && (
            <div>
              <label
                htmlFor="alert-threshold"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Threshold
              </label>

              <div className="flex gap-2">
                <input
                  id="alert-threshold"
                  name="threshold"
                  type="number"
                  min="0"
                  value={form.threshold}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <div className="flex min-w-24 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                  {form.type === "workload"
                    ? "%"
                    : "days"}
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="alert-description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="alert-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe when this alert should trigger."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isEditing ? "Save changes" : "Create alert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ alert, onCancel, onConfirm }) {
  if (!alert) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-alert-title"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
          <Trash2 className="h-5 w-5 text-red-600" />
        </div>

        <h2
          id="delete-alert-title"
          className="mt-4 text-lg font-semibold text-slate-900"
        >
          Delete alert?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          "{alert.name}" will be removed from your alert rules.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete alert
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Alerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [modalAlert, setModalAlert] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(null);

  const activeCount = useMemo(
    () => alerts.filter((alert) => alert.enabled).length,
    [alerts]
  );

  const handleToggle = (id) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              enabled: !alert.enabled,
            }
          : alert
      )
    );
  };

  const handleSave = (alert) => {
    setAlerts((current) => {
      const exists = current.some(
        (item) => item.id === alert.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === alert.id ? alert : item
        );
      }

      return [alert, ...current];
    });
  };

  const handleDelete = () => {
    if (!deleteAlert) return;

    setAlerts((current) =>
      current.filter(
        (alert) => alert.id !== deleteAlert.id
      )
    );

    setDeleteAlert(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Nexa Automation
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Alerts
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Configure rules that help you stay ahead of important
            project and team events.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          New alert
        </button>
      </header>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Bell className="h-4 w-4 text-indigo-500" />
            Total rules
          </div>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {alerts.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Active rules
          </div>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {activeCount}
          </p>
        </div>

        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Settings2 className="h-4 w-4 text-slate-500" />
            Monitoring
          </div>

          <p className="mt-2 text-sm font-semibold text-emerald-600">
            {activeCount > 0
              ? "Active and monitoring"
              : "No active rules"}
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 sm:p-6">
        <div className="flex gap-3">
          <Zap className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Stay ahead of problems
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Alerts are proactive rules. Unlike notifications,
              which tell you what already happened, alerts define
              the conditions that should require your attention.
            </p>
          </div>
        </div>
      </section>

      {/* Alert Rules */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Alert rules
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enable the rules you want Nexa to monitor.
          </p>
        </div>

        {alerts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Bell className="mx-auto h-8 w-8 text-slate-400" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No alert rules
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create an alert rule to start monitoring your workspace.
            </p>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Create alert
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onToggle={handleToggle}
                onEdit={setModalAlert}
                onDelete={setDeleteAlert}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {(showCreateModal || modalAlert) && (
        <AlertModal
          alert={modalAlert}
          onClose={() => {
            setShowCreateModal(false);
            setModalAlert(null);
          }}
          onSave={handleSave}
        />
      )}

      <DeleteModal
        alert={deleteAlert}
        onCancel={() => setDeleteAlert(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}