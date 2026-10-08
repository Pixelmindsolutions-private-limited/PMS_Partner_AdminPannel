import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

const BASE_URL = "http://31.97.228.17:4478/api/admin";

function getToken() {
  return (
    sessionStorage.getItem("adminToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
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

function StatusBadge({ status }) {
  const map = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
    converted: "bg-emerald-50 text-emerald-700 border-emerald-100",
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

function formatDateTime(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-IN");
  } catch {
    return "—";
  }
}

const emptyEdit = {
  clientName: "",
  clientEmail: "",
  clientNumber: "",
  clientAddress: "",
  projectName: "",
  budget: "",
  reference: "",
  timePeriod: "",
  startDate: "",
  projectType: "website",
};

function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "1");
  const [formData, setFormData] = useState(emptyEdit);
  const [savingEdit, setSavingEdit] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("pending");

  const fetchLead = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const authHeader = getAuthHeader();
      if (!authHeader.Authorization) {
        throw new Error("No auth token found. Please login again.");
      }

      const response = await fetch(`${BASE_URL}/get-lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ leadId: id }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Request failed: ${response.status}`);
      }

      const data = result.lead || result.data;
      setLead(data);

      if (data) {
        setFormData({
          clientName: data.clientName || "",
          clientEmail: data.clientEmail || "",
          clientNumber: data.clientNumber || "",
          clientAddress: data.clientAddress || "",
          projectName: data.projectName || "",
          budget: data.budget ?? "",
          reference: data.reference || "",
          timePeriod: data.timePeriod || "",
          startDate: data.startDate
            ? new Date(data.startDate).toISOString().slice(0, 10)
            : "",
          projectType: data.projectType || "website",
        });
        setSelectedStatus(data.clientStatus || "pending");
      }
    } catch (err) {
      setError(err.message || "Unable to load lead details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  useEffect(() => {
    if (!info) return;
    const t = setTimeout(() => setInfo(null), 3500);
    return () => clearTimeout(t);
  }, [info]);

  const isConverted = lead?.clientStatus === "converted";

  // Update lead
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (isConverted) {
      setError("Converted lead cannot be edited.");
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
        leadId: id,
        clientName: formData.clientName.trim(),
        clientEmail: formData.clientEmail.trim(),
        clientNumber: formData.clientNumber.trim(),
        clientAddress: formData.clientAddress.trim(),
        projectName: formData.projectName.trim(),
        budget: Number(formData.budget) || 0,
        reference: formData.reference.trim(),
        timePeriod: formData.timePeriod.trim(),
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : undefined,
        projectType: formData.projectType,
      };

      const response = await fetch(`${BASE_URL}/update-lead`, {
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

      setInfo(result.message || "Lead updated successfully.");
      setIsEditing(false);
      await fetchLead();
    } catch (err) {
      setError(err.message || "Unable to update lead.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Update status
  const handleUpdateStatus = async (newStatus) => {
    if (isConverted) {
      setError("Converted lead status cannot be changed.");
      return;
    }
    if (!newStatus || newStatus === lead.clientStatus) return;

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
        body: JSON.stringify({ leadId: id, status: newStatus }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Request failed: ${response.status}`);
      }

      setInfo(result.message || `Lead status updated to ${newStatus}`);
      await fetchLead();
    } catch (err) {
      setError(err.message || "Unable to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Link
          to="/leads"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#075d59] hover:underline"
        >
          <ArrowLeft size={16} /> Back to Leads
        </Link>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
          Loading lead details...
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-4">
        <Link
          to="/leads"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#075d59] hover:underline"
        >
          <ArrowLeft size={16} /> Back to Leads
        </Link>
        <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-10 text-center text-sm text-red-600">
          {error || "Lead not found."}
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
          to="/leads"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#075d59] hover:underline"
        >
          <ArrowLeft size={16} /> Back to Leads
        </Link>
        <div className="flex flex-wrap gap-3">
          {!isConverted && !isEditing && (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Edit Lead
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    clientName: lead.clientName || "",
                    clientEmail: lead.clientEmail || "",
                    clientNumber: lead.clientNumber || "",
                    clientAddress: lead.clientAddress || "",
                    projectName: lead.projectName || "",
                    budget: lead.budget ?? "",
                    reference: lead.reference || "",
                    timePeriod: lead.timePeriod || "",
                    startDate: lead.startDate
                      ? new Date(lead.startDate).toISOString().slice(0, 10)
                      : "",
                    projectType: lead.projectType || "website",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                disabled={savingEdit}
              >
                <Save size={15} className="mr-2" />
                {savingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Lead Details</h1>
        <StatusBadge status={lead.clientStatus} />
      </div>

      {isConverted && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          ✓ This lead has been converted to a project. Editing, status changes
          and deletion are disabled.
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-gray-600">
              <span>Client Name</span>
              <input
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Client Number</span>
              <input
                value={formData.clientNumber}
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
                value={formData.clientEmail}
                onChange={(e) =>
                  setFormData({ ...formData, clientEmail: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Client Address</span>
              <input
                value={formData.clientAddress}
                onChange={(e) =>
                  setFormData({ ...formData, clientAddress: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Project Name</span>
              <input
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Project Type</span>
              <select
                value={formData.projectType}
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
              <span>Budget (₹)</span>
              <input
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Reference</span>
              <input
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Time Period</span>
              <input
                value={formData.timePeriod}
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
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
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
            <InfoRow label="Name" value={lead.clientName} />
            <InfoRow label="Mobile" value={lead.clientNumber} />
            <InfoRow label="Email" value={lead.clientEmail} />
            <InfoRow label="Address" value={lead.clientAddress} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-gray-800">
              Project Information
            </h2>
            <InfoRow label="Project Name" value={lead.projectName} />
            <InfoRow
              label="Project Type"
              value={
                lead.projectType ? (
                  <span className="capitalize">{lead.projectType}</span>
                ) : (
                  "—"
                )
              }
            />
            <InfoRow label="Budget" value={formatINR(lead.budget)} />
            <InfoRow label="Reference" value={lead.reference} />
            <InfoRow label="Time Period" value={lead.timePeriod} />
            <InfoRow label="Start Date" value={formatDate(lead.startDate)} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-gray-800">
              Status & Timeline
            </h2>
            <InfoRow
              label="Current Status"
              value={<StatusBadge status={lead.clientStatus} />}
            />
            <InfoRow
              label="Created At"
              value={formatDateTime(lead.createdAt)}
            />
            <InfoRow
              label="Last Updated"
              value={formatDateTime(lead.updatedAt)}
            />
          </div>

          {!isConverted && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-gray-800">
                Update Status
              </h2>
              <label className="space-y-2 text-sm text-gray-600 block">
                <span>Change to</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:border-[#075d59]"
                >
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={() => handleUpdateStatus(selectedStatus)}
                  disabled={
                    updatingStatus || selectedStatus === lead.clientStatus
                  }
                >
                  {updatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LeadDetails;