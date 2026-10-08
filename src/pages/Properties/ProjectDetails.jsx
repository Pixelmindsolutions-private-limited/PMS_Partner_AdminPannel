import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Pencil} from "lucide-react";

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
        <div className="p-5">{children}</div>
      </div>
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

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right break-words max-w-[60%]">
        {value === null || value === undefined || value === "" ? "—" : value}
      </span>
    </div>
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

const STATUS_OPTIONS = [
  "not_started",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
];

function ProjectDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "1");
  const [formData, setFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("not_started");

  // links
  const [links, setLinks] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [linkForm, setLinkForm] = useState({ label: "", url: "", type: "other" });
  const [linkSubmitting, setLinkSubmitting] = useState(false);

  const isLocked =
    project?.projectStatus === "completed" ||
    project?.projectStatus === "cancelled";

  const fetchProject = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("No auth token found. Please login again.");
      }

      const response = await fetch(`${BASE_URL}/get-project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ projectId: id }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Request failed: ${response.status}`);
      }

      const data = result.project || result.data;
      setProject(data);

      if (data) {
        setFormData({
          clientName: data.clientName || "",
          clientEmail: data.clientEmail || "",
          clientNumber: data.clientNumber || "",
          clientAddress: data.clientAddress || "",
          projectName: data.projectName || "",
          projectType: data.projectType || "website",
          reference: data.reference || "",
          description: data.description || "",
          budget: data.budget ?? "",
          timePeriod: data.timePeriod || "",
          startDate: data.startDate
            ? new Date(data.startDate).toISOString().slice(0, 10)
            : "",
          expectedEndDate: data.expectedEndDate
            ? new Date(data.expectedEndDate).toISOString().slice(0, 10)
            : "",
          requirements: data.requirements || "",
        });
        setSelectedStatus(data.projectStatus || "not_started");
        setLinks(Array.isArray(data.links) ? data.links : []);
      }
    } catch (err) {
      setError(err.message || "Unable to load project.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (!info) return;
    const t = setTimeout(() => setInfo(null), 3500);
    return () => clearTimeout(t);
  }, [info]);

  // Update project
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (isLocked) {
      setError("Completed/cancelled project cannot be edited.");
      return;
    }

    try {
      setSavingEdit(true);
      setError(null);

      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("No auth token found. Please login again.");
      }

      const body = {
        projectId: id,
        clientName: formData.clientName?.trim() || undefined,
        clientEmail: formData.clientEmail?.trim() || undefined,
        clientNumber: formData.clientNumber?.trim() || undefined,
        clientAddress: formData.clientAddress?.trim() || undefined,
        projectName: formData.projectName?.trim() || undefined,
        projectType: formData.projectType || undefined,
        reference: formData.reference?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        timePeriod: formData.timePeriod?.trim() || undefined,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : undefined,
        expectedEndDate: formData.expectedEndDate
          ? new Date(formData.expectedEndDate).toISOString()
          : undefined,
        requirements: formData.requirements?.trim() || undefined,
      };

      // only send budget if actually changed
      if (Number(formData.budget) !== Number(project.budget)) {
        body.budget = Number(formData.budget) || 0;
      }

      const response = await fetch(`${BASE_URL}/update-project`, {
        method: "PUT",
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

      setInfo(result.message || "Project updated successfully.");
      setIsEditing(false);
      await fetchProject();
    } catch (err) {
      setError(err.message || "Unable to update project.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Update status
  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === project.projectStatus) return;

    try {
      setUpdatingStatus(true);
      setError(null);

      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("No auth token found. Please login again.");
      }

      const response = await fetch(`${BASE_URL}/update-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ projectId: id, projectStatus: selectedStatus }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Request failed: ${response.status}`);
      }

      setInfo(result.message || "Project status updated.");
      await fetchProject();
    } catch (err) {
      setError(err.message || "Unable to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Add / update link
  const handleSaveLink = async (e) => {
    e.preventDefault();
    if (!linkForm.label.trim() || !linkForm.url.trim()) {
      setError("Label and URL are required.");
      return;
    }

    try {
      setLinkSubmitting(true);
      setError(null);

      const authHeader = getAuthHeader();
      const isEdit = Boolean(editingLink);
      const url = isEdit ? `${BASE_URL}/update-link` : `${BASE_URL}/add-link`;
      const method = isEdit ? "PUT" : "POST";

      const body = isEdit
        ? {
            projectId: id,
            linkId: editingLink._id,
            label: linkForm.label.trim(),
            url: linkForm.url.trim(),
            type: linkForm.type,
          }
        : {
            projectId: id,
            label: linkForm.label.trim(),
            url: linkForm.url.trim(),
            type: linkForm.type,
          };

      const response = await fetch(url, {
        method,
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

      setInfo(result.message || "Link saved.");
      setShowLinkModal(false);
      setEditingLink(null);
      setLinkForm({ label: "", url: "", type: "other" });
      await fetchProject();
    } catch (err) {
      setError(err.message || "Unable to save link.");
    } finally {
      setLinkSubmitting(false);
    }
  };

  // Delete link
  const handleDeleteLink = async (link) => {
    const ok = window.confirm(`Delete link "${link.label}"?`);
    if (!ok) return;
    try {
      setError(null);
      const authHeader = getAuthHeader();
      const response = await fetch(`${BASE_URL}/delete-link`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ projectId: id, linkId: link._id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Request failed: ${response.status}`);
      }
      setInfo(result.message || "Link deleted.");
      await fetchProject();
    } catch (err) {
      setError(err.message || "Unable to delete link.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#075d59] hover:underline"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
          Loading project details...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#075d59] hover:underline"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-10 text-center text-sm text-red-600">
          {error || "Project not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#075d59] hover:underline"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <div className="flex flex-wrap gap-3">
          {!isEditing && !isLocked && (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Edit Project
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  fetchProject();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={savingEdit}>
                <Save size={15} className="mr-2" />
                {savingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800">
          {project.projectName || "Untitled Project"}
        </h1>
        <StatusBadge status={project.projectStatus} />
      </div>

      {isLocked && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-700">
          This project is <b>{project.projectStatus.replace(/_/g, " ")}</b> and cannot be edited.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Budget", value: formatINR(project.budget) },
          { label: "Total Paid", value: formatINR(project.totalPaid) },
          { label: "Balance Due", value: formatINR(project.balanceDue) },
          {
            label: "Commission",
            value: formatINR(project.totalCommission),
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

      {isEditing ? (
        <form onSubmit={handleSave} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-gray-600">
              <span>Project Name</span>
              <input
                value={formData.projectName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Project Type</span>
              <select
                value={formData.projectType || "website"}
                onChange={(e) =>
                  setFormData({ ...formData, projectType: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:border-[#075d59]"
              >
                <option value="website">Website</option>
                <option value="mobile">Mobile App</option>
                <option value="software">Software</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Client Name</span>
              <input
                value={formData.clientName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Client Number</span>
              <input
                value={formData.clientNumber || ""}
                onChange={(e) =>
                  setFormData({ ...formData, clientNumber: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Client Email</span>
              <input
                type="email"
                value={formData.clientEmail || ""}
                onChange={(e) =>
                  setFormData({ ...formData, clientEmail: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Client Address</span>
              <input
                value={formData.clientAddress || ""}
                onChange={(e) =>
                  setFormData({ ...formData, clientAddress: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Budget (₹)</span>
              <input
                type="number"
                min="0"
                value={formData.budget ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
              <p className="text-xs text-gray-400">
                Cannot be less than amount already paid ({formatINR(project.totalPaid)}).
              </p>
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Reference</span>
              <input
                value={formData.reference || ""}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Time Period</span>
              <input
                value={formData.timePeriod || ""}
                onChange={(e) =>
                  setFormData({ ...formData, timePeriod: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Start Date</span>
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Expected End Date</span>
              <input
                type="date"
                value={formData.expectedEndDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, expectedEndDate: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600 md:col-span-2">
              <span>Description</span>
              <textarea
                rows={2}
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600 md:col-span-2">
              <span>Requirements</span>
              <textarea
                rows={3}
                value={formData.requirements || ""}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>
          </div>
        </form>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-gray-800">
              Client Information
            </h2>
            <InfoRow label="Name" value={project.clientName} />
            <InfoRow label="Mobile" value={project.clientNumber} />
            <InfoRow label="Email" value={project.clientEmail} />
            <InfoRow label="Address" value={project.clientAddress} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-gray-800">
              Project Information
            </h2>
            <InfoRow label="Project Name" value={project.projectName} />
            <InfoRow
              label="Type"
              value={
                project.projectType ? (
                  <span className="capitalize">{project.projectType}</span>
                ) : (
                  "—"
                )
              }
            />
            <InfoRow label="Reference" value={project.reference} />
            <InfoRow label="Time Period" value={project.timePeriod} />
            <InfoRow label="Start Date" value={formatDate(project.startDate)} />
            <InfoRow
              label="Expected End"
              value={formatDate(project.expectedEndDate)}
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
            <h2 className="mb-2 text-lg font-bold text-gray-800">
              Description & Requirements
            </h2>
            <InfoRow label="Description" value={project.description} />
            <InfoRow label="Requirements" value={project.requirements} />
          </div>
        </div>
      )}

      {/* Status update */}
      {!isLocked && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-gray-800">
            Project Status
          </h2>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <label className="space-y-2 text-sm text-gray-600 flex-1">
              <span>Update status to</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:border-[#075d59]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <Button
              onClick={handleUpdateStatus}
              disabled={
                updatingStatus || selectedStatus === project.projectStatus
              }
            >
              {updatingStatus ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      )}

      {/* Links */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-800">Project Links</h2>
          <Button
            variant="primary"
            onClick={() => {
              setEditingLink(null);
              setLinkForm({ label: "", url: "", type: "other" });
              setShowLinkModal(true);
            }}
          >
            <Plus size={15} className="mr-1" /> Add Link
          </Button>
        </div>

        {links.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
            No links added yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 font-semibold">Label</th>
                  <th className="px-4 py-3 font-semibold">URL</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr
                    key={link._id}
                    className="border-b border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {link.label}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#075d59] underline hover:text-[#064b48] break-all"
                      >
                        {link.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">
                      {link.type || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLink(link);
                            setLinkForm({
                              label: link.label || "",
                              url: link.url || "",
                              type: link.type || "other",
                            });
                            setShowLinkModal(true);
                          }}
                          className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(link)}
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
        )}
      </div>

      {/* Link Modal */}
      <Modal
        open={showLinkModal}
        onClose={() => !linkSubmitting && setShowLinkModal(false)}
        title={editingLink ? "Edit Link" : "Add Link"}
        size="md"
      >
        <form onSubmit={handleSaveLink} className="space-y-5">
          <label className="space-y-2 text-sm text-gray-600 block">
            <span>Label *</span>
            <input
              required
              value={linkForm.label}
              onChange={(e) =>
                setLinkForm({ ...linkForm, label: e.target.value })
              }
              placeholder="Live URL"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
            />
          </label>

          <label className="space-y-2 text-sm text-gray-600 block">
            <span>URL *</span>
            <input
              required
              type="url"
              value={linkForm.url}
              onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
            />
          </label>

          <label className="space-y-2 text-sm text-gray-600 block">
            <span>Type</span>
            <select
              value={linkForm.type}
              onChange={(e) =>
                setLinkForm({ ...linkForm, type: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:border-[#075d59]"
            >
              <option value="github">GitHub</option>
              <option value="figma">Figma</option>
              <option value="live">Live</option>
              <option value="staging">Staging</option>
              <option value="docs">Docs</option>
              <option value="other">Other</option>
            </select>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowLinkModal(false)}
              disabled={linkSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={linkSubmitting}>
              {linkSubmitting ? "Saving..." : editingLink ? "Update" : "Add Link"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProjectDetails;