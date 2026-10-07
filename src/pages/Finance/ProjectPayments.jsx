import {  useMemo, useState } from "react";

const PAYMENTS_URL = "http://31.97.228.17:4478/api/admin/projects/payments";

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

function ProjectPayments() {
  const [projectId, setProjectId] = useState("");
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const fetchPayments = async () => {
    const id = projectId.trim();

    if (!id) {
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

      const response = await fetch(PAYMENTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ projectId: id }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || `Request failed with status ${response.status}`
        );
      }

      setProject(result.project || null);
      setSearched(true);
    } catch (err) {
      setError(err.message || "Unable to load payments.");
      setProject(null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") fetchPayments();
  };

  const installments = project?.installments || [];
  const commissionPayments = project?.commissionPayments || [];

  const totalInstallments = useMemo(
    () => installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
    [installments]
  );

  const totalCommissionPaid = useMemo(
    () => commissionPayments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
    [commissionPayments]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Search project by ID to view client installments and commission payouts."
      />

      {/* Search bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="w-full max-w-xl" onKeyDown={handleKeyDown}>
            <SearchInput
              value={projectId}
              onChange={setProjectId}
              placeholder="Enter Project ID (MongoDB _id)"
            />
          </div>
          <Button onClick={fetchPayments} disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </Button>
          {project && (
            <Button
              variant="secondary"
              onClick={() => {
                setProjectId("");
                setProject(null);
                setError(null);
                setSearched(false);
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-dashed border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Empty state before search */}
      {!searched && !loading && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
          Enter a project ID above and click <b>Search</b> to view payment details.
        </div>
      )}

      {/* Results */}
      {project && (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Budget", value: formatINR(project.clientSide?.budget) },
              {
                label: "Total Paid",
                value: formatINR(project.clientSide?.totalPaid),
              },
              {
                label: "Balance Due",
                value: formatINR(project.clientSide?.balanceDue),
              },
              {
                label: "Commission Credited",
                value: formatINR(project.commissionSide?.commissionCredited),
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
                  Rate: {project.commissionSide?.commissionRate ?? 0}%
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                  Commission Balance:{" "}
                  {formatINR(project.commissionSide?.commissionBalance)}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                  Total Commission:{" "}
                  {formatINR(project.commissionSide?.totalCommission)}
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
                Total: {formatINR(totalInstallments)}
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
                No installments recorded for this project.
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
                Total: {formatINR(totalCommissionPaid)}
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
    </div>
  );
}

export default ProjectPayments;