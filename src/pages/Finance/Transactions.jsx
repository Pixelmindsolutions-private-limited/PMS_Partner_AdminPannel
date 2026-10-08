import { useEffect, useMemo, useState } from "react";

const BASE_URL = "http://31.97.228.17:4478/api/admin";
const TRANSACTIONS_URL = `${BASE_URL}/transactions`;

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
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${className}`}
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

function TypeBadge({ type }) {
  const styles = {
    credit: "bg-emerald-50 text-emerald-700 border-emerald-100",
    debit: "bg-red-50 text-red-700 border-red-100",
  };
  const key = String(type || "").toLowerCase();
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
        styles[key] || "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {type || "—"}
    </span>
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

const TYPE_FILTERS = ["All", "credit", "debit"];

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    let isMounted = true;

    async function fetchTransactions() {
      try {
        setLoading(true);
        setError(null);

        const authHeader = getAuthHeader();
        if (!authHeader.Authorization) {
          throw new Error("No auth token found. Please login again.");
        }

        const response = await fetch(TRANSACTIONS_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false) {
          throw new Error(result.message || `Request failed: ${response.status}`);
        }

        const list = Array.isArray(result?.data) ? result.data : [];
        if (isMounted) setTransactions(list);
      } catch (err) {
        if (isMounted) setError(err.message || "Unable to load transactions.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTransactions();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const n = query.toLowerCase();
    return transactions.filter((t) => {
      const matchesSearch =
        !n ||
        (t.partnerName || "").toLowerCase().includes(n) ||
        (t.partnerMobile || "").toLowerCase().includes(n) ||
        (t.partnerEmail || "").toLowerCase().includes(n) ||
        (t.description || "").toLowerCase().includes(n) ||
        (t._id || "").toLowerCase().includes(n);
      const matchesType =
        typeFilter === "All" ||
        String(t.type || "").toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [transactions, query, typeFilter]);

  const totals = useMemo(() => {
    let credit = 0;
    let debit = 0;
    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (String(t.type).toLowerCase() === "credit") credit += amt;
      else if (String(t.type).toLowerCase() === "debit") debit += amt;
    });
    return {
      count: transactions.length,
      credit,
      debit,
      net: credit - debit,
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet Transactions"
        description="All partner wallet credits and debits across the platform."
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
          { label: "Total Transactions", value: totals.count },
          {
            label: "Total Credit",
            value: formatINR(totals.credit),
            color: "text-emerald-700",
          },
          {
            label: "Total Debit",
            value: formatINR(totals.debit),
            color: "text-red-700",
          },
          {
            label: "Net Balance",
            value: formatINR(totals.net),
            color: "text-gray-800",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
              {stat.label}
            </p>
            <h3
              className={`mt-3 text-2xl font-bold ${
                stat.color || "text-gray-800"
              }`}
            >
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-md">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by partner, mobile, email or description"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`rounded-xl px-3 py-2 text-sm font-medium capitalize transition ${
                  typeFilter === t
                    ? "bg-[#075d59] text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="mb-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
            Loading transactions...
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
                  <th className="px-4 py-3 font-semibold">Transaction ID</th>
                  <th className="px-4 py-3 font-semibold">Partner</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Balance After</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const isCredit =
                    String(t.type || "").toLowerCase() === "credit";
                  return (
                    <tr
                      key={t._id}
                      className="border-b border-gray-100 hover:bg-gray-50/60"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {t._id ? `${String(t._id).slice(-10)}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">
                          {t.partnerName || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t.partnerEmail || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {t.partnerMobile || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <TypeBadge type={t.type} />
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${
                          isCredit ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {isCredit ? "+" : "−"} {formatINR(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatINR(t.balanceAfter)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {t.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDateTime(t.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && !error && (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;