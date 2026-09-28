import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, ShieldCheck, UserX } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import SearchInput from "../../components/SearchInput";
import StatusBadge from "../../components/StatusBadge";
import customersData from "../../data/customers";

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
      <PageHeader title="Customer Management" description="Manage guest records, bookings and account state." />

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
                <th className="px-4 py-3 font-semibold">Bookings</th>
                <th className="px-4 py-3 font-semibold">Total Spent</th>
                <th className="px-4 py-3 font-semibold">Last Booking</th>
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
                  <td className="px-4 py-3 text-gray-600">{customer.bookings}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{customer.totalSpent}</td>
                  <td className="px-4 py-3 text-gray-600">{customer.lastBooking}</td>
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
