import { useState } from "react";

const BASE_URL = "http://31.97.228.17:4478/api/admin";
const SET_COMMISSION_URL = `${BASE_URL}/projects/set-commission`;
const ADD_PAYMENT_URL = `${BASE_URL}/projects/add-client-payment`;

function getToken() {
  return sessionStorage.getItem("adminToken") || "";
}

function getAuthHeader() {
  const raw = getToken();
  if (!raw) return {};
  const value = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  return { Authorization: value };
}

function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-[#075d59] text-white hover:bg-[#064b48]",
    secondary: "bg-white text-[#075d59] border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}

function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;

  const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className={`w-full rounded-2xl border border-gray-200 bg-white shadow-2xl ${sizes[size]}`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function PageHeader({ title, description, actions = [] }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "primary"}
            onClick={action.onClick}
            className={action.className || ""}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function formatINR(n) {
  const num = Number(n) || 0;
  return `\u20B9${num.toLocaleString("en-IN")}`;
}

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

function Earnings() {
  const [projectId, setProjectId] = useState("");
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [commissionRate, setCommissionRate] = useState("");
  const [commissionSubmitting, setCommissionSubmitting] = useState(false);

  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "upi",
    reference: "",
    note: "",
    receivedAt: new Date().toISOString().slice(0, 10),
    commissionPaid: true,
  });

  // ---- set commission ----
  const handleSetCommission = async (event) => {
    event.preventDefault();

    const rate = Number(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setError("Commission rate must be between 0 and 100.");
      return;
    }
    if (!projectId.trim()) {
      setError("Project ID is required.");
      return;
    }

    try {
      setCommissionSubmitting(true);
      setError(null);
      setInfo(null);

      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("No auth token found. Please login again.");
      }

      const response = await fetch(SET_COMMISSION_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          projectId: projectId.trim(),
          commissionRate: rate,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || `Request failed with status ${response.status}`
        );
      }

      // backend returns full project
      if (result.project) {
        setProject(normalizeProject(result.project));
      }

      setInfo(result.message || "Commission rate updated.");
      setShowCommissionModal(false);
      setCommissionRate("");
    } catch (err) {
      setError(err.message || "Unable to set commission rate.");
    } finally {
      setCommissionSubmitting(false);
    }
  };

  // ---- add client payment ----
  const handleAddPayment = async (event) => {
    event.preventDefault();

    const amt = Number(paymentForm.amount);
    if (!amt || amt <= 0) {
      setError("Amount must be a positive number.");
      return;
    }
    if (!projectId.trim()) {
      setError("Project ID is required.");
      return;
    }

    try {
      setPaymentSubmitting(true);
      setError(null);
      setInfo(null);

      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("No auth token found. Please login again.");
      }

      const response = await fetch(ADD_PAYMENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          projectId: projectId.trim(),
          amount: amt,
          method: paymentForm.method,
          reference: paymentForm.reference.trim(),
          note: paymentForm.note.trim(),
          receivedAt: paymentForm.receivedAt
            ? new Date(paymentForm.receivedAt).toISOString()
            : new Date().toISOString(),
          commissionPaid: paymentForm.commissionPaid,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || `Request failed with status ${response.status}`
        );
      }

      // backend returns full project
      if (result.project) {
        setProject(normalizeProject(result.project));
      }

      setInfo(result.message || "Installment recorded.");
      setShowPaymentModal(false);
      setPaymentForm({
        amount: "",
        method: "upi",
        reference: "",
        note: "",
        receivedAt: new Date().toISOString().slice(0, 10),
        commissionPaid: true,
      });
    } catch (err) {
      setError(err.message || "Unable to add payment.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const installments = project?.clientPayments || [];
  const commissionPayments = project?.commissionPayments || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner Earnings"
        description="Set commission rate and record client installments by project ID."
        actions={[
          {
            label: "Set Commission",
            variant: "secondary",
            onClick: () => {
              if (!projectId.trim()) {
                setError("Enter project ID first.");
                return;
              }
              setCommissionRate(project?.commissionRate ?? "");
              setShowCommissionModal(true);
            },
          },
          {
            label: "Add Payment",
            variant: "primary",
            onClick: () => {
              if (!projectId.trim()) {
                setError("Enter project ID first.");
                return;
              }
              setShowPaymentModal(true);
            },
          },
        ]}
      />

      {/* Project ID input */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="space-y-2 text-sm text-gray-600">
          <span className="font-semibold">Project ID</span>
          <input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Paste MongoDB project _id"
            className="w-full max-w-2xl rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
          />
        </label>

        {error && (
          <div className="mt-4 rounded-2xl border border-dashed border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {info && !error && (
          <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-700">
            {info}
          </div>
        )}
      </div>

      {!project && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
          Paste a project ID above, then use <b>Set Commission</b> or{" "}
          <b>Add Payment</b>. Project details will appear here after the first
          action.
        </div>
      )}

      {project && (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Budget", value: formatINR(project.budget) },
              { label: "Total Paid", value: formatINR(project.totalPaid) },
              { label: "Balance Due", value: formatINR(project.balanceDue) },
              {
                label: "Commission Credited",
                value: formatINR(project.commissionCredited),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                  {stat.label}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-gray-800">
                  {stat.value}
                </h3>
              </div>
            ))}
          </div>

          {/* Project header */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Project
                </p>
                <h2 className="mt-1 text-lg font-bold text-gray-800">
                  {project.projectName || "—"}
                </h2>
                <p className="text-sm text-gray-500">
                  Client: {project.clientName || "—"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                  Rate: {project.commissionRate ?? 0}%
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                  Commission Balance: {formatINR(project.commissionBalance)}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                  Total Commission: {formatINR(project.totalCommission)}
                </span>
              </div>
            </div>
          </div>

          {/* Client installments */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Client Installments
              </h2>
              <span className="text-sm font-semibold text-gray-500">
                Total: {formatINR(project.totalPaid)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">Note</th>
                    <th className="px-4 py-3 font-semibold">Commission</th>
                    <th className="px-4 py-3 font-semibold">Received At</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((item, idx) => (
                    <tr
                      key={item._id || idx}
                      className="border-b border-gray-100 hover:bg-gray-50/60"
                    >
                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {formatINR(item.amount)}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600">
                        {item.method || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.reference || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.note || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.commissionAmount
                          ? formatINR(item.commissionAmount)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(item.receivedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {installments.length === 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                No installments recorded yet.
              </div>
            )}
          </div>

          {/* Commission payouts */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Commission Payouts
              </h2>
              <span className="text-sm font-semibold text-gray-500">
                Total: {formatINR(project.commissionCredited)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Note</th>
                    <th className="px-4 py-3 font-semibold">Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionPayments.map((item, idx) => (
                    <tr
                      key={item._id || idx}
                      className="border-b border-gray-100 hover:bg-gray-50/60"
                    >
                      <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {formatINR(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.note || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(item.paidAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {commissionPayments.length === 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                No commission payouts yet.
              </div>
            )}
          </div>
        </>
      )}

      {/* Set Commission Modal */}
      <Modal
        open={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        title="Set Commission Rate"
        size="md"
      >
        <form onSubmit={handleSetCommission} className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
            <div>
              <b>Project ID:</b> {projectId}
            </div>
            {project && (
              <>
                <div>
                  <b>Budget:</b> {formatINR(project.budget)}
                </div>
                <div>
                  <b>Current Rate:</b> {project.commissionRate ?? 0}%
                </div>
              </>
            )}
          </div>

          <label className="space-y-2 text-sm text-gray-600">
            <span>Commission Rate (%) *</span>
            <input
              required
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              placeholder="e.g. 10"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCommissionModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={commissionSubmitting}>
              {commissionSubmitting ? "Saving..." : "Save Rate"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Payment Modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Add Client Payment"
        size="lg"
      >
        <form onSubmit={handleAddPayment} className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
            <div>
              <b>Project ID:</b> {projectId}
            </div>
            {project && (
              <>
                <div>
                  <b>Balance Due:</b> {formatINR(project.balanceDue)}
                </div>
                <div>
                  <b>Commission Rate:</b> {project.commissionRate ?? 0}%
                </div>
              </>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-gray-600">
              <span>Amount *</span>
              <input
                required
                type="number"
                min="1"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
                placeholder="5000"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Method</span>
              <select
                value={paymentForm.method}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, method: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:border-[#075d59]"
              >
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Reference</span>
              <input
                value={paymentForm.reference}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, reference: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
                placeholder="UPI txn / cheque no."
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Received At</span>
              <input
                type="date"
                value={paymentForm.receivedAt}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, receivedAt: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600 md:col-span-2">
              <span>Note</span>
              <textarea
                rows={3}
                value={paymentForm.note}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, note: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
                placeholder="Optional note"
              />
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-600 md:col-span-2">
              <input
                type="checkbox"
                checked={paymentForm.commissionPaid}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    commissionPaid: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-gray-300 accent-[#075d59]"
              />
              <span>Credit commission to partner wallet automatically</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={paymentSubmitting}>
              {paymentSubmitting ? "Saving..." : "Save Payment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Normalize the full `project` object returned by setCommissionRate / addClientPayment
// into the flat shape this page uses.
function normalizeProject(p) {
  return {
    projectName: p.projectName,
    clientName: p.clientName,
    budget: p.budget,
    totalPaid: p.totalPaid,
    balanceDue: p.balanceDue,
    commissionRate: p.commissionRate,
    totalCommission: p.totalCommission,
    commissionCredited: p.commissionCredited,
    commissionBalance: p.commissionBalance,
    clientPayments: p.clientPayments || [],
    commissionPayments: p.commissionPayments || [],
  };
}

export default Earnings;