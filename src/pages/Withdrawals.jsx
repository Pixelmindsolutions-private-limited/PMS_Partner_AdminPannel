import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye,  } from "lucide-react";
import { getAllWithdrawals } from "../services/withdrawalService";

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

function getMethod(item) {
  if (item.bankDetails && item.bankDetails.accountNumber) return "Bank";
  if (item.upiId) return "UPI";
  return "—";
}

const FILTERS = ["All", "Pending", "Completed", "Rejected"];

function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchWithdrawals() {
      try {
        setLoading(true);
        setError(null);

        const result = await getAllWithdrawals();
        const list = Array.isArray(result?.data) ? result.data : [];

        if (isMounted) setWithdrawals(list);
      } catch (err) {
        if (isMounted) setError(err.message || "Unable to load withdrawals.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchWithdrawals();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filtered = useMemo(() => {
    if (filter === "All") return withdrawals;
    const key = filter.toLowerCase();
    return withdrawals.filter((w) => String(w.status || "").toLowerCase() === key);
  }, [withdrawals, filter]);

  const counts = useMemo(() => {
    return {
      all: withdrawals.length,
      pending: withdrawals.filter((w) => w.status === "pending").length,
      completed: withdrawals.filter((w) => w.status === "completed").length,
      rejected: withdrawals.filter((w) => w.status === "rejected").length,
    };
  }, [withdrawals]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdrawals"
        description="Manage partner withdrawal requests"
        actions={[
          {
            label: "Refresh",
            variant: "secondary",
            onClick: () => setRefreshKey((c) => c + 1),
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: counts.all },
          { label: "Pending", value: counts.pending },
          { label: "Completed", value: counts.completed },
          { label: "Rejected", value: counts.rejected },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
              {stat.label}
            </p>
            <h3 className="mt-3 text-2xl font-bold text-gray-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                filter === f
                  ? "bg-[#075d59] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading && (
          <div className="mb-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
            Loading withdrawals...
          </div>
        )}

        {error && !loading && (
          <div className="mb-4 rounded-2xl border border-dashed border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 font-semibold">Partner</th>
                  <th className="px-4 py-3 font-semibold">Mobile</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Payment Method</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Requested Date</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {item.partner?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.partner?.mobile || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {formatINR(item.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {getMethod(item)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(item.requestedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/withdrawals/${item._id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                      >
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && !error && (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
            No withdrawal requests found.
          </div>
        )}
      </div>
    </div>
  );
}

export default Withdrawals;