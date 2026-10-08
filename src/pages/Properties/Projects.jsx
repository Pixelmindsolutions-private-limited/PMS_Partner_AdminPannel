import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, RefreshCw } from "lucide-react";

const BASE_URL = "http://31.97.228.17:4478/api/admin";

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

function StatusBadge({ status }) {
  const map = {
    not_started: "bg-gray-100 text-gray-700 border-gray-200",
    in_progress: "bg-blue-50 text-blue-700 border-blue-100",
    on_hold: "bg-yellow-50 text-yellow-700 border-yellow-100",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    cancelled: "bg-red-50 text-red-700 border-red-100",
  };
  const key = String(status || "").toLowerCase();
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
        map[key] || "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {(status || "—").replace(/_/g, " ")}
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

const STATUS_FILTERS = [
  "All",
  "not_started",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
];

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");


  // Fetch projects
  useEffect(() => {
    let isMounted = true;

    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);

        const authHeader = getAuthHeader();
        if (!authHeader.Authorization) {
          throw new Error("No auth token found. Please login again.");
        }

        const response = await fetch(`${BASE_URL}/my-projects`, {
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

        const list = Array.isArray(result?.projects)
          ? result.projects
          : Array.isArray(result?.data)
            ? result.data
            : [];

        if (isMounted) setProjects(list);
      } catch (err) {
        if (isMounted) setError(err.message || "Unable to load projects.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (!info) return;
    const t = setTimeout(() => setInfo(null), 3500);
    return () => clearTimeout(t);
  }, [info]);

  const filtered = useMemo(() => {
    const n = query.toLowerCase();
    return projects.filter((p) => {
      const matchesSearch =
        !n ||
        (p.projectName || "").toLowerCase().includes(n) ||
        (p.clientName || "").toLowerCase().includes(n) ||
        (p.clientEmail || "").toLowerCase().includes(n) ||
        (p.clientNumber || "").toLowerCase().includes(n);
      const matchesStatus =
        statusFilter === "All" || p.projectStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, query, statusFilter]);

  const counts = useMemo(
    () => ({
      total: projects.length,
      not_started: projects.filter((p) => p.projectStatus === "not_started").length,
      in_progress: projects.filter((p) => p.projectStatus === "in_progress").length,
      completed: projects.filter((p) => p.projectStatus === "completed").length,
    }),
    [projects]
  );


  // Delete project
  const handleDelete = async (project) => {
    const ok = window.confirm(
      `Delete project "${project.projectName}"? This cannot be undone.`
    );
    if (!ok) return;

    try {
      setBusyId(project._id);
      setError(null);

      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("No auth token found. Please login again.");
      }

      const response = await fetch(`${BASE_URL}/delete-project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ projectId: project._id }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Request failed: ${response.status}`);
      }

      setInfo(result.message || "Project deleted successfully.");
      setProjects((cur) => cur.filter((p) => p._id !== project._id));
      setRefreshKey((c) => c + 1);
    } catch (err) {
      setError(err.message || "Unable to delete project.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Management"
        description="Track client projects, budgets, status and deliverables."
        actions={[
          {
            label: "Refresh",
            variant: "secondary",
            onClick: () => setRefreshKey((c) => c + 1),
          },
        ]}
      />

      {info && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700">
          {info}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Projects", value: counts.total },
          { label: "Not Started", value: counts.not_started },
          { label: "In Progress", value: counts.in_progress },
          { label: "Completed", value: counts.completed },
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
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-md">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by project, client name or email"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-3 py-2 text-sm font-medium capitalize transition ${
                  statusFilter === s
                    ? "bg-[#075d59] text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="mb-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
            Loading projects...
          </div>
        )}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Budget</th>
                  <th className="px-4 py-3 font-semibold">Paid</th>
                  <th className="px-4 py-3 font-semibold">Balance</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isInProgress = p.projectStatus === "in_progress";
                  return (
                    <tr
                      key={p._id}
                      className="border-b border-gray-100 hover:bg-gray-50/60"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">
                          {p.projectName || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.reference || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{p.clientName || "—"}</div>
                        <div className="text-xs text-gray-500">
                          {p.clientNumber || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600">
                        {p.projectType || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {formatINR(p.budget)}
                      </td>
                      <td className="px-4 py-3 text-emerald-700">
                        {formatINR(p.totalPaid)}
                      </td>
                      <td className="px-4 py-3 text-orange-700">
                        {formatINR(p.balanceDue)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.projectStatus} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/projects/${p._id}`}
                            className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                            title="View"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            to={`/projects/${p._id}?edit=1`}
                            className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            disabled={busyId === p._id || isInProgress}
                            className={`rounded-lg p-2 ${
                              isInProgress
                                ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                                : "bg-red-50 text-red-700 hover:bg-red-100"
                            } ${busyId === p._id ? "opacity-60 cursor-wait" : ""}`}
                            title={
                              isInProgress
                                ? "In-progress project cannot be deleted"
                                : "Delete"
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
            No projects match the current filter.
          </div>
        )}
      </div>

    </div>
  );
}

export default Projects;