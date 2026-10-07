import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, UserCheck } from "lucide-react";
import propertiesData from "../../data/properties";

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
          <Button key={index} variant={action.variant || "primary"} onClick={action.onClick} className={action.className || ""}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-gray-400">
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
    Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Completed: "bg-blue-50 text-blue-700 border-blue-100",
    Cancelled: "bg-red-50 text-red-700 border-red-100",
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Failed: "bg-red-50 text-red-700 border-red-100",
    Processing: "bg-orange-50 text-orange-700 border-orange-100",
    Verified: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Unverified: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
}

const statusOptions = ["All", "Approved", "Pending", "Rejected", "Suspended"];

function Properties({ initialStatus = "All" }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [properties] = useState(propertiesData);

  const filteredProperties = useMemo(() => {
    const normalized = query.toLowerCase();

    return properties.filter((property) => {
      const matchesSearch = !normalized || property.name.toLowerCase().includes(normalized) || property.partner.toLowerCase().includes(normalized) || property.location.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All" || property.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [properties, query, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Property Management"
        description="Review listed properties, approvals and partner inventory."
        actions={[
          { label: "Add Property", onClick: () => alert("Add property modal is ready for implementation."), variant: "primary" },
          { label: "Export", onClick: () => alert("Export generated."), variant: "secondary" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Properties", value: properties.length },
          { label: "Approved", value: properties.filter((item) => item.status === "Approved").length },
          { label: "Pending", value: properties.filter((item) => item.status === "Pending").length },
          { label: "Revenue", value: "₹24.8L" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">{stat.label}</p>
            <h3 className="mt-3 text-2xl font-bold text-gray-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-md">
            <SearchInput value={query} onChange={setQuery} placeholder="Search property, partner or location" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((status) => (
              <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${statusFilter === status ? "bg-[#075d59] text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th className="px-4 py-3 font-semibold">Property ID</th>
                <th className="px-4 py-3 font-semibold">Property Name</th>
                <th className="px-4 py-3 font-semibold">Partner</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Rooms</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created Date</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-gray-700">{property.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{property.name}</td>
                  <td className="px-4 py-3 text-gray-600">{property.partner}</td>
                  <td className="px-4 py-3 text-gray-600">{property.location}</td>
                  <td className="px-4 py-3 text-gray-600">{property.type}</td>
                  <td className="px-4 py-3 text-gray-600">{property.rooms}</td>
                  <td className="px-4 py-3 text-gray-800">{property.price}</td>
                  <td className="px-4 py-3"><StatusBadge status={property.status} /></td>
                  <td className="px-4 py-3 text-gray-600">{property.createdDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/properties/${property.id}`} className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200" title="View"><Eye size={15} /></Link>
                      <button type="button" className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100" title="Edit"><Pencil size={15} /></button>
                      <button type="button" className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100" title="Approve"><UserCheck size={15} /></button>
                      <button type="button" className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Properties;
