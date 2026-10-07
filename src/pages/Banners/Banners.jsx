import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

const BASE_URL = "http://31.97.228.17:4478/api/admin";
const LIST_URL = `${BASE_URL}/list`;
const CREATE_URL = `${BASE_URL}/create`;
const UPDATE_URL = `${BASE_URL}/update`;
const DELETE_URL = `${BASE_URL}/delete`;

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

function Banners() {
  const [query, setQuery] = useState("");
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch banners
  useEffect(() => {
    let isMounted = true;

    async function fetchBanners() {
      try {
        setLoading(true);
        setError(null);

        const authHeader = getAuthHeader();
        if (!authHeader.Authorization) {
          throw new Error("No auth token found. Please login again.");
        }

        const response = await fetch(LIST_URL, {
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
        const list = Array.isArray(result?.banners) ? result.banners : [];

        const mapped = list.map((item) => ({
          id: item._id || item.id,
          title: item.title || "—",
          image: item.image || "",
          description: item.description || "",
          createdAt: item.createdAt
            ? new Date(item.createdAt).toISOString().slice(0, 10)
            : "—",
          updatedAt: item.updatedAt
            ? new Date(item.updatedAt).toISOString().slice(0, 10)
            : "—",
          raw: item,
        }));

        if (isMounted) setBanners(mapped);
      } catch (err) {
        if (isMounted) setError(err.message || "Something went wrong");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBanners();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filteredBanners = useMemo(() => {
    const normalized = query.toLowerCase();
    return banners.filter((banner) => {
      return (
        !normalized ||
        banner.title.toLowerCase().includes(normalized) ||
        banner.description.toLowerCase().includes(normalized)
      );
    });
  }, [banners, query]);

  const resetForm = () => {
    setFormData({ title: "", description: "" });
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (banner) => {
    setEditing(banner);
    setFormData({
      title: banner.title === "—" ? "" : banner.title,
      description: banner.description || "",
    });
    setImageFile(null);
    setImagePreview(banner.image || "");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowModal(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Image required only for create
    if (!editing && !imageFile) {
      setError("Image is required to create a banner.");
      return;
    }

    try {
      setError(null);
      setSubmitting(true);

      const fd = new FormData();
      fd.append("title", formData.title.trim());
      fd.append("description", formData.description.trim());

      if (imageFile) {
        fd.append("image", imageFile);
      }

      let url = CREATE_URL;
      let method = "POST";

      if (editing) {
        url = UPDATE_URL;
        method = "PUT";
        fd.append("bannerId", editing.id);
      }

      // ⚠️ Do NOT set Content-Type — browser auto-sets multipart with boundary
      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeader(),
        },
        body: fd,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || `Request failed with status ${response.status}`
        );
      }

      setShowModal(false);
      setEditing(null);
      resetForm();
      setRefreshKey((c) => c + 1);
    } catch (err) {
      setError(err.message || "Unable to save banner.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (banner) => {
    const confirmDelete = window.confirm(
      `Delete banner "${banner.title}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setError(null);
      setBusyId(banner.id);

      const response = await fetch(DELETE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ bannerId: banner.id }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || `Request failed with status ${response.status}`
        );
      }

      setBanners((current) => current.filter((item) => item.id !== banner.id));
      setRefreshKey((c) => c + 1);
    } catch (err) {
      setError(err.message || "Unable to delete banner.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banner Management"
        description="Manage homepage banners shown to customers."
        actions={[
          { label: "Add Banner", onClick: openCreate, variant: "primary" },
          {
            label: "Refresh",
            onClick: () => setRefreshKey((c) => c + 1),
            variant: "secondary",
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Banners", value: banners.length },
          {
            label: "With Title",
            value: banners.filter((b) => b.title && b.title !== "—").length,
          },
          {
            label: "With Description",
            value: banners.filter((b) => b.description).length,
          },
          {
            label: "Added This Month",
            value: banners.filter((b) => {
              if (b.createdAt === "—") return false;
              const d = new Date(b.createdAt);
              const now = new Date();
              return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
              );
            }).length,
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
              placeholder="Search banners by title or description"
            />
          </div>
        </div>

        {loading && (
          <div className="mb-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
            Loading banners...
          </div>
        )}

        {error && !loading && (
          <div className="mb-4 rounded-2xl border border-dashed border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th className="px-4 py-3 font-semibold">Banner ID</th>
                <th className="px-4 py-3 font-semibold">Preview</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                filteredBanners.map((banner) => (
                  <tr
                    key={banner.id}
                    className="border-b border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {banner.id}
                    </td>
                    <td className="px-4 py-3">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="h-12 w-20 rounded-lg border border-gray-200 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">
                        {banner.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {banner.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {banner.createdAt}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {banner.updatedAt}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {banner.image && (
                          <a
                            href={banner.image}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                            title="View image"
                          >
                            <Eye size={15} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(banner)}
                          className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(banner)}
                          disabled={busyId === banner.id}
                          className={`rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100 ${
                            busyId === banner.id ? "opacity-60 cursor-wait" : ""
                          }`}
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

        {!loading && filteredBanners.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
            No banners found. Click "Add Banner" to create one.
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
          resetForm();
        }}
        title={editing ? "Edit Banner" : "Add Banner"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4">
            <label className="space-y-2 text-sm text-gray-600">
              <span>Title</span>
              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
                placeholder="Summer Sale Banner"
              />
            </label>

            <label className="space-y-2 text-sm text-gray-600">
              <span>Image {editing ? "(leave empty to keep current)" : "*"}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#075d59] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#064b48] focus:border-[#075d59]"
              />
            </label>

            {imagePreview && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="mb-2 text-xs font-semibold text-gray-500">
                  Preview
                </p>
                <img
                  src={imagePreview}
                  alt="preview"
                  className="max-h-40 rounded-lg object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            <label className="space-y-2 text-sm text-gray-600">
              <span>Description</span>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]"
                placeholder="Short description shown under the banner"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setEditing(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editing
                  ? "Update Banner"
                  : "Save Banner"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Banners;