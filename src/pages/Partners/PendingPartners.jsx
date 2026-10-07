import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, UserCheck } from "lucide-react";

const FILTER_URL = "http://31.97.228.17:4478/api/admin/partners/filter?status=pending";
const APPROVE_URL = "http://31.97.228.17:4478/api/admin/approve";

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

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
    Suspended: "bg-red-50 text-red-700 border-red-100",
    Rejected: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        styles[status] || "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

function deriveStatus(user) {
  if (user.isBlocked) return "Suspended";
  if (user.isApproved) return "Active";
  if (user.isRegistered) return "Pending";
  return "Rejected";
}

function PendingPartners() {
  const [query, setQuery] = useState("");
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPartners() {
      try {
        setLoading(true);
        setError(null);

        const authHeader = getAuthHeader();
        if (!authHeader.Authorization) {
          throw new Error("No auth token found. Please login again.");
        }

        const response = await fetch(FILTER_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized (401). Please login again.");
          }
          throw new Error(`Request failed with status ${response.status}`);
        }

        const result = await response.json();
        const users = Array.isArray(result?.data) ? result.data : [];

        const mapped = users.map((user) => {
          const nameParts = (user.name || "").trim().split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          return {
            id: user.id || user._id,
            name: user.name || "—",
            firstName,
            lastName,
            company: user.company || "—",
            email: user.email || "—",
            phone: user.mobile || "—",
            properties: Array.isArray(user.properties) ? user.properties.length : 0,
            revenue: `\u20B9${user.wallet ?? 0}`,
            status: deriveStatus(user),
            joinedDate: user.createdAt
              ? new Date(user.createdAt).toISOString().slice(0, 10)
              : "—",
            aadharImage: user.aadharImage || "",
            isApproved: user.isApproved,
            isBlocked: user.isBlocked,
            raw: user,
          };
        });

        if (isMounted) setPartners(mapped);
      } catch (err) {
        if (isMounted) setError(err.message || "Something went wrong");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPartners();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filteredPartners = useMemo(() => {
    const normalized = query.toLowerCase();

    return partners.filter((partner) => {
      return (
        !normalized ||
        partner.name.toLowerCase().includes(normalized) ||
        partner.company.toLowerCase().includes(normalized) ||
        partner.email.toLowerCase().includes(normalized) ||
        partner.phone.toLowerCase().includes(normalized)
      );
    });
  }, [partners, query]);

  const handleApprove = async (partner) => {
    if (!getToken()) {
      setError("No auth token found. Please login again.");
      return;
    }

    const confirmApprove = window.confirm(`Approve partner "${partner.name}"?`);
    if (!confirmApprove) return;

    try {
      setError(null);
      setApprovingId(partner.id);

      const response = await fetch(APPROVE_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ userId: partner.id }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || `Request failed with status ${response.status}`
        );
      }

      setPartners((current) => current.filter((item) => item.id !== partner.id));
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(err.message || "Unable to approve partner.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Partners"
        description="Review and approve partner applications that are awaiting verification."
        actions={[
          {
            label: "Refresh",
            onClick: () => setRefreshKey((c) => c + 1),
            variant: "secondary",
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Pending", value: partners.length },
          {
            label: "With Aadhaar",
            value: partners.filter((p) => p.aadharImage).length,
          },
          {
            label: "Registered",
            value: partners.filter((p) => p.raw?.isRegistered).length,
          },
          {
            label: "Wallet Total",
            value: `\u20B9${partners
              .reduce((t, p) => t + (Number(p.raw?.wallet) || 0), 0)
              .toLocaleString("en-IN")}`,
          },
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
        <div className="mb-5">
          <div className="w-full max-w-md">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by name, email or phone"
            />
          </div>
        </div>

        {loading && (
          <div className="mb-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
            Loading partners...
          </div>
        )}

        {error && !loading && (
          <div className="mb-4 rounded-2xl border border-dashed border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            Failed to load partners: {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th className="px-4 py-3 font-semibold">Partner ID</th>
                <th className="px-4 py-3 font-semibold">Partner Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Aadhaar</th>
                <th className="px-4 py-3 font-semibold">Wallet</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined Date</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                filteredPartners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="border-b border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {partner.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">
                        {partner.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{partner.email}</td>
                    <td className="px-4 py-3 text-gray-600">{partner.phone}</td>
                    <td className="px-4 py-3">
                      {partner.aadharImage ? (
                        <a
                          href={partner.aadharImage}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-[#075d59] underline hover:text-[#064b48]"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {partner.revenue}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={partner.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {partner.joinedDate}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/partners/${partner.id}`}
                          className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                          title="View"
                        >
                          <Eye size={15} />
                        </Link>
                        <button
                          type="button"
                          className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(partner)}
                          disabled={approvingId === partner.id}
                          className={`rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 ${
                            approvingId === partner.id
                              ? "opacity-60 cursor-wait"
                              : ""
                          }`}
                          title="Approve"
                        >
                          <UserCheck size={15} />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredPartners.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
            No pending partners found.
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingPartners;