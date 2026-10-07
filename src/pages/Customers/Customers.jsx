import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, ShieldCheck, UserX } from "lucide-react";
import customersData from "../../data/customers";

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

function Customers() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customers] = useState(customersData);

  const filteredCustomers = useMemo(() => {
    const normalized = query.toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch = !normalized || customer.name.toLowerCase().includes(normalized) || customer.email.toLowerCase().includes(normalized) || customer.phone.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All" || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, query, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Management" description="Manage guest records and account state." />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total Customers", customers.length],
          ["Active", customers.filter((item) => item.status === "Active").length],
          ["Suspended", customers.filter((item) => item.status === "Suspended").length],
          ["Total Spent", "₹8.2L"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">{label}</p>
            <h3 className="mt-3 text-2xl font-bold text-gray-800">{value}</h3>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-md">
            <SearchInput value={query} onChange={setQuery} placeholder="Search customer, email or phone" />
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Active", "Suspended"].map((status) => (
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
                <th className="px-4 py-3 font-semibold">Customer ID</th>
                <th className="px-4 py-3 font-semibold">Customer Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Total Spent</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined Date</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-3">{customer.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{customer.name}</td>
                  <td className="px-4 py-3 text-gray-600">{customer.email}</td>
                  <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{customer.totalSpent}</td>
                  <td className="px-4 py-3"><StatusBadge status={customer.status} /></td>
                  <td className="px-4 py-3 text-gray-600">{customer.joinedDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/customers/${customer.id}`} className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200" title="View"><Eye size={15} /></Link>
                      <button type="button" className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100" title="Activate"><ShieldCheck size={15} /></button>
                      <button type="button" className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100" title="Suspend"><UserX size={15} /></button>
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

export default Customers;
