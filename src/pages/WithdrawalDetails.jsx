import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import {
  approveWithdrawal,
  getWithdrawalById,
  rejectWithdrawal,
} from "../services/withdrawalService";

function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-[#075d59] text-white hover:bg-[#064b48]",
    secondary:
      "bg-white text-[#075d59] border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}

function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className={`w-full rounded-2xl border border-gray-200 bg-white shadow-2xl ${sizes[size]}`}
      >
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

function StatusBadge({ status }) {
  const map = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rejected: "bg-red-50 text-red-700 border-red-100",
  };
  const key = String(status || "").toLowerCase();
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
        map[key] || "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {status || "—"}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right break-words">
        {value === null || value === undefined || value === "" ? "—" : value}
      </span>
    </div>
  );
}

function formatINR(n) {
  return `\u20B9${(Number(n) || 0).toLocaleString("en-IN")}`;
}

function formatDateTime(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function WithdrawalDetails() {
  const { id } = useParams();

  const [withdrawal, setWithdrawal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // approve modal
  const [showApprove, setShowApprove] = useState(false);
  const [approveForm, setApproveForm] = useState({
    paymentReference: "",
    paymentNote: "",
  });
  const [approving, setApproving] = useState(false);

  // reject modal
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const result = await getWithdrawalById(id);
      setWithdrawal(result?.data || result?.withdrawal || null);
    } catch (err) {
      setError(err.message || "Unable to load withdrawal details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      setApproving(true);
      setError(null);
      const res = await approveWithdrawal(id, approveForm);
      setToast(res?.message || "Withdrawal approved successfully");
      setShowApprove(false);
      setApproveForm({ paymentReference: "", paymentNote: "" });
      await fetchDetails();
    } catch (err) {
      setError(err.message || "Unable to approve withdrawal.");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    try {
      setRejecting(true);
      setError(null);
      const res = await rejectWithdrawal(id, { rejectionReason });
      setToast(res?.message || "Withdrawal rejected successfully");
      setShowReject(false);
      setRejectionReason("");
      await fetchDetails();
    } catch (err) {
      setError(err.message || "Unable to reject withdrawal.");
    } finally {
      setRejecting(false);
    }
  };

  const status = withdrawal?.status || "";
  const isPending = status === "pending";

  if (loading) {
    return (
      <div className="space-y-4">
        <Link
          to="/withdrawals"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#075d59] hover:underline"
        >
          <ArrowLeft size={16} /> Back to Withdrawals
        </Link>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
          Loading withdrawal details...
        </div>
      </div>
    );
  }

  if (error && !withdrawal) {
    return (
      <div className="space-y-4">
        <Link
          to="/withdrawals"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#075d59] hover:underline"
        >
          <ArrowLeft size={16} /> Back to Withdrawals
        </Link>
        <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-10 text-center text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!withdrawal) return null;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700">
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link
          to="/withdrawals"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#075d59] hover:underline"
        >
          <ArrowLeft size={16} /> Back to Withdrawals
        </Link>

        {isPending && (
          <div className="flex flex-wrap gap-3">
            <Button variant="success" onClick={() => setShowApprove(true)}>
              Approve Withdrawal
            </Button>
            <Button variant="danger" onClick={() => setShowReject(true)}>
              Reject Withdrawal
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Withdrawal Details</h1>
        <StatusBadge status={status} />
      </div>

      {error && (
        <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Status banners */}
      {status === "completed" && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={18} />
          Withdrawal Completed
        </div>
      )}

      {status === "rejected" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-red-700">
            <XCircle size={18} />
            Withdrawal Rejected
          </div>
          {withdrawal.rejectionReason && (
            <p className="mt-2 text-sm text-red-700">
              <span className="font-semibold">Reason:</span>{" "}
              {withdrawal.rejectionReason}
            </p>
          )}
        </div>
      )}

      {/* Info grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Partner Details */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-gray-800">
            Partner Details
          </h2>
          <InfoRow label="Partner Name" value={withdrawal.partner?.name} />
          <InfoRow label="Mobile" value={withdrawal.partner?.mobile} />
          <InfoRow label="Email" value={withdrawal.partner?.email} />
        </div>

        {/* Withdrawal Details */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-gray-800">
            Withdrawal Details
          </h2>
          <InfoRow
            label="Withdrawal Amount"
            value={formatINR(withdrawal.amount)}
          />
          <InfoRow label="Status" value={<StatusBadge status={status} />} />
          <InfoRow
            label="Requested Date"
            value={formatDateTime(withdrawal.requestedAt)}
          />
          <InfoRow
            label="Processed Date"
            value={formatDateTime(withdrawal.processedAt)}
          />
          <InfoRow
            label="Paid Date"
            value={formatDateTime(withdrawal.paidAt)}
          />
        </div>

        {/* Bank Details */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-gray-800">Bank Details</h2>
          <InfoRow
            label="Account Holder Name"
            value={withdrawal.bankDetails?.accountHolderName}
          />
          <InfoRow label="Bank Name" value={withdrawal.bankDetails?.bankName} />
          <InfoRow
            label="Account Number"
            value={withdrawal.bankDetails?.accountNumber}
          />
          <InfoRow label="IFSC Code" value={withdrawal.bankDetails?.ifscCode} />
        </div>

        {/* UPI + Payment Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-gray-800">
            UPI & Payment
          </h2>
          <InfoRow label="UPI ID" value={withdrawal.upiId || "Not provided"} />

          {status === "completed" && (
            <>
              <InfoRow
                label="Payment Reference"
                value={withdrawal.paymentReference || "—"}
              />
              <InfoRow
                label="Payment Note"
                value={withdrawal.paymentNote || "—"}
              />
              <InfoRow
                label="Paid Date"
                value={formatDateTime(withdrawal.paidAt)}
              />
            </>
          )}

          {status === "rejected" && (
            <InfoRow
              label="Rejection Reason"
              value={withdrawal.rejectionReason || "—"}
            />
          )}

          {status === "pending" && (
            <div className="mt-3 rounded-xl border border-dashed border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-700">
              Awaiting admin action. Use the buttons above to approve or reject.
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        open={showApprove}
        onClose={() => !approving && setShowApprove(false)}
        title="Approve Withdrawal?"
        size="md"
      >
        <form onSubmit={handleApprove} className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            <div>
              <b>Partner:</b> {withdrawal.partner?.name || "—"}
            </div>
            <div>
              <b>Amount:</b> {formatINR(withdrawal.amount)}
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Are you sure you want to approve this withdrawal?
          </p>

          <label className="space-y-2 text-sm text-gray-600 block">
            <span>Payment Reference (optional)</span>
            <input
              value={approveForm.paymentReference}
              onChange={(e) =>
                setApproveForm({
                  ...approveForm,
                  paymentReference: e.target.value,
                })
              }
              placeholder="TXN123456789"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
            />
          </label>

          <label className="space-y-2 text-sm text-gray-600 block">
            <span>Payment Note (optional)</span>
            <textarea
              rows={3}
              value={approveForm.paymentNote}
              onChange={(e) =>
                setApproveForm({ ...approveForm, paymentNote: e.target.value })
              }
              placeholder="Payment transferred through bank"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowApprove(false)}
              disabled={approving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={approving}>
              {approving ? "Approving..." : "Approve Withdrawal"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={showReject}
        onClose={() => !rejecting && setShowReject(false)}
        title="Reject Withdrawal"
        size="md"
      >
        <form onSubmit={handleReject} className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            <div>
              <b>Partner:</b> {withdrawal.partner?.name || "—"}
            </div>
            <div>
              <b>Amount:</b> {formatINR(withdrawal.amount)}
            </div>
          </div>

          <label className="space-y-2 text-sm text-gray-600 block">
            <span>Rejection Reason *</span>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason here"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-red-400"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowReject(false)}
              disabled={rejecting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={rejecting}>
              {rejecting ? "Rejecting..." : "Reject Withdrawal"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default WithdrawalDetails;
