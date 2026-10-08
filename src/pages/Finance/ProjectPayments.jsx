import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Save } from "lucide-react";

const BASE_URL = "http://31.97.228.17:4478/api/admin";
const COMMISSION_URL = `${BASE_URL}/projects/set-commission`;
const CLIENT_PAYMENT_URL = `${BASE_URL}/projects/add-client-payment`;
const PROJECT_DETAILS_URL = `${BASE_URL}/projects/payments`; // existing endpoint

function getToken() {
  return sessionStorage.getItem("adminToken") || "";
}

function getAuthHeader() {
  const raw = getToken();
  if (!raw) return {};
  const value = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  return { Authorization: value };
}

/* ------------------------------------------------------------------ */
/* Shared UI                                                          */
/* ------------------------------------------------------------------ */

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
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
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

function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4 text-gray-400"
      >
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="ml-2 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
      />
    </div>
  );
}

function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-2xl" };
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
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatINR(n) {
  return `\u20B9${(Number(n) || 0).toLocaleString("en-IN")}`;
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


function methodLabel(m) {
  const map = {
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    bank: "Bank Transfer",
    upi: "UPI",
    card: "Card",
    cheque: "Cheque",
    other: "Other",
  };
  return map[String(m || "").toLowerCase()] || m || "—";
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

function ProjectPayments() {
  const [projectId, setProjectId] = useState("");
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [searched, setSearched] = useState(false);

  // commission form
  const [commissionRate, setCommissionRate] = useState("");
  const [commissionSaving, setCommissionSaving] = useState(false);
  const [commissionError, setCommissionError] = useState("");

  // payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "bank_transfer",
    reference: "",
    note: "",
    receivedAt: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
    commissionPaid: true,
  });

  // auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /* -------------------- fetch project -------------------- */
  const fetchProject = useCallback(async (id = projectId) => {
    const targetId = String(id || "").trim();
    if (!targetId) {
      setError("Please enter a project ID.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("No auth token found. Please login again.");
      }

      const response = await fetch(PROJECT_DETAILS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ projectId: targetId }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Request failed: ${response.status}`);
      }

      const data = result.project || result.data || null;
      setProject(data);
      setSearched(true);

      if (data) {
        setCommissionRate(
          data.commissionSide?.commissionRate ??
            data.commissionRate ??
            ""
        );
      }
    } catch (err) {
      setError(err.message || "Unable to load project.");
      setProject(null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  /* -------------------- normalize project -------------------- */
  const normalized = useMemo(() => {
    if (!project) return null;

    // support both shapes: { clientSide, commissionSide } and flat
    const cs = project.clientSide || {};
    const com = project.commissionSide || {};

    return {
      projectName: project.projectName || "—",
      clientName: project.clientName || "—",
      budget: cs.budget ?? project.budget ?? 0,
      totalPaid: cs.totalPaid ?? project.totalPaid ?? 0,
      balanceDue: cs.balanceDue ?? project.balanceDue ?? 0,
      commissionRate: com.commissionRate ?? project.commissionRate ?? 0,
      totalCommission: com.totalCommission ?? project.totalCommission ?? 0,
      commissionCredited:
        com.commissionCredited ?? project.commissionCredited ?? 0,
      commissionBalance:
        com.commissionBalance ?? project.commissionBalance ?? 0,
      installments: project.installments || project.clientPayments || [],
      commissionPayments:
        project.commissionPayments || project.commissionPayments || [],
    };
  }, [project]);

  /* -------------------- update commission -------------------- */
  const handleUpdateCommission = async () => {
    const rateNum = Number(commissionRate);

    if (commissionRate === "" || commissionRate === null) {
      setCommissionError("Commission rate is required.");
      return;
    }
    if (isNaN(rateNum)) {
      setCommissionError("Commission rate must be a number.");
      return;
    }
    if (rateNum < 0) {
      setCommissionError("Commission rate cannot be less than 0.");
      return;
    }
    if (rateNum > 100) {
      setCommissionError("Commission rate cannot exceed 100.");
      return;
    }
    if (!projectId.trim()) {
      setCommissionError("Project ID is required.");
      return;
    }

    try {
      setCommissionSaving(true);
      setCommissionError("");
      setError(null);

      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("No auth token found. Please login again.");
      }

      const response = await fetch(COMMISSION_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          projectId: projectId.trim(),
          commissionRate: rateNum,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Request failed: ${response.status}`);
      }

      setToast(result.message || "Commission rate updated successfully.");
      await fetchProject();
    } catch (err) {
      setCommissionError(err.message || "Unable to update commission.");
    } finally {
      setCommissionSaving(false);
    }
  };

  /* -------------------- add client payment -------------------- */
  const openPaymentModal = () => {
    setPaymentError("");
    setPaymentForm({
      amount: "",
      method: "bank_transfer",
      reference: "",
      note: "",
      receivedAt: new Date().toISOString().slice(0, 16),
      commissionPaid: true,
    });
    setShowPaymentModal(true);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();

    const amt = Number(paymentForm.amount);
    if (!amt || amt <= 0) {
      setPaymentError("Amount must be greater than 0.");
      return;
    }

    try {
      setPaymentSaving(true);
      setPaymentError("");
      setError(null);

      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("No auth token found. Please login again.");
      }

      const body = {
        projectId: projectId.trim(),
        amount: amt,
        method: paymentForm.method,
        reference: paymentForm.reference.trim(),
        note: paymentForm.note.trim(),
        receivedAt: paymentForm.receivedAt
          ? new Date(paymentForm.receivedAt).toISOString()
          : new Date().toISOString(),
        commissionPaid: Boolean(paymentForm.commissionPaid),
      };

      const response = await fetch(CLIENT_PAYMENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Request failed: ${response.status}`);
      }

      setToast(result.message || "Client payment added successfully.");
      setShowPaymentModal(false);
      await fetchProject();
    } catch (err) {
      setPaymentError(err.message || "Unable to add payment.");
    } finally {
      setPaymentSaving(false);
    }
  };

  /* -------------------- render -------------------- */
  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Payments"
        description="Manage commission settings and record client installments."
        actions={[
          {
            label: "Refresh",
            variant: "secondary",
            onClick: () => fetchProject(),
          },
        ]}
      />

      {/* toast */}
      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700">
          {toast}
        </div>
      )}

      {/* error */}
      {error && (
        <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* project lookup */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="w-full max-w-xl">
            <SearchInput
              value={projectId}
              onChange={setProjectId}
              placeholder="Enter Project ID (MongoDB _id)"
            />
          </div>
          <Button onClick={() => fetchProject()} disabled={loading}>
            {loading ? "Loading..." : "Load Project"}
          </Button>
          {project && (
            <Button
              variant="secondary"
              onClick={() => {
                setProjectId("");
                setProject(null);
                setError(null);
                setSearched(false);
                setCommissionRate("");
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* empty state */}
      {!searched && !loading && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
          Enter a project ID above and click <b>Load Project</b>.
        </div>
      )}

      {/* project loaded */}
      {normalized && (
        <>
          {/* project summary cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Project Budget", value: formatINR(normalized.budget) },
              { label: "Total Paid", value: formatINR(normalized.totalPaid) },
              { label: "Balance Due", value: formatINR(normalized.balanceDue) },
              {
                label: "Commission Rate",
                value: `${normalized.commissionRate}%`,
              },
              {
                label: "Total Commission",
                value: formatINR(normalized.totalCommission),
              },
              {
                label: "Commission Credited",
                value: formatINR(normalized.commissionCredited),
              },
              {
                label: "Commission Balance",
                value: formatINR(normalized.commissionBalance),
              },
              {
                label: "Client Payments",
                value: normalized.installments.length,
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

          {/* project header */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
              Project
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-800">
              {normalized.projectName}
            </h2>
            <p className="text-sm text-gray-500">
              Client: {normalized.clientName}
            </p>
          </div>

          {/* commission settings */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              Commission Settings
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                  Project Budget
                </p>
                <p className="mt-2 text-lg font-bold text-gray-800">
                  {formatINR(normalized.budget)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                  Commission Rate (%)
                </p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commissionRate}
                  onChange={(e) => {
                    setCommissionRate(e.target.value);
                    setCommissionError("");
                  }}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#075d59]"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                  Total Commission
                </p>
                <p className="mt-2 text-lg font-bold text-gray-800">
                  {formatINR(normalized.totalCommission)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                  Commission Credited
                </p>
                <p className="mt-2 text-lg font-bold text-emerald-700">
                  {formatINR(normalized.commissionCredited)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                  Commission Balance
                </p>
                <p className="mt-2 text-lg font-bold text-orange-700">
                  {formatINR(normalized.commissionBalance)}
                </p>
              </div>
            </div>

            {commissionError && (
              <div className="mt-4 rounded-2xl border border-dashed border-red-200 bg-red-50 p-3 text-center text-xs text-red-600">
                {commissionError}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleUpdateCommission}
                disabled={commissionSaving}
              >
                <Save size={15} />
                {commissionSaving ? "Updating..." : "Update Commission"}
              </Button>
            </div>
          </div>

          {/* client payments */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-gray-800">
                Client Payments
              </h2>
              <Button onClick={openPaymentModal}>
                <Plus size={15} /> Add Client Payment
              </Button>
            </div>

            {normalized.installments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                No client payments found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                      <th className="px-4 py-3 font-semibold">Payment Date</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Method</th>
                      <th className="px-4 py-3 font-semibold">Reference</th>
                      <th className="px-4 py-3 font-semibold">Note</th>
                      <th className="px-4 py-3 font-semibold">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalized.installments
                      .slice()
                      .reverse()
                      .map((p, idx) => (
                        <tr
                          key={p._id || idx}
                          className="border-b border-gray-100 hover:bg-gray-50/60"
                        >
                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(p.receivedAt || p.createdAt)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {formatINR(p.amount)}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {methodLabel(p.method)}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {p.reference || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                            {p.note || "—"}
                          </td>
                          <td className="px-4 py-3 text-emerald-700">
                            {p.commissionAmount
                              ? formatINR(p.commissionAmount)
                              : "—"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Payment Modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => !paymentSaving && setShowPaymentModal(false)}
        title="Add Client Payment"
        size="lg"
      >
        <form onSubmit={handleAddPayment} className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
            <div>
              <b>Project:</b> {normalized?.projectName}
            </div>
            <div>
              <b>Balance Due:</b> {formatINR(normalized?.balanceDue)}
            </div>
            <div>
              <b>Commission Rate:</b> {normalized?.commissionRate}%
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-gray-600">
              <span>Amount *</span>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
                placeholder="30000"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Payment Method</span>
              <select
                value={paymentForm.method}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, method: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:border-[#075d59]"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Transaction Reference</span>
              <input
                value={paymentForm.reference}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, reference: e.target.value })
                }
                placeholder="TXN123456789"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Received Date</span>
              <input
                type="datetime-local"
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
                placeholder="First installment"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
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

          {paymentError && (
            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-3 text-center text-xs text-red-600">
              {paymentError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPaymentModal(false)}
              disabled={paymentSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={paymentSaving}>
              {paymentSaving ? "Adding..." : "Add Payment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProjectPayments;