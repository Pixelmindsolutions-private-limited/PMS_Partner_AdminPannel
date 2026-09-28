import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import SearchInput from "../../components/SearchInput";
import StatusBadge from "../../components/StatusBadge";
import bookingsData from "../../data/bookings";

const statusOptions = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];
const paymentOptions = ["All", "Paid", "Pending", "Refunded", "Failed"];

function Bookings({ initialStatus = "All" }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [bookings] = useState(bookingsData);

  const filteredBookings = useMemo(() => {
    const normalized = query.toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !normalized ||
        booking.customer.toLowerCase().includes(normalized) ||
        booking.property.toLowerCase().includes(normalized) ||
        booking.partner.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All" || booking.bookingStatus === statusFilter;
      const matchesPayment = paymentFilter === "All" || booking.paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [bookings, query, statusFilter, paymentFilter]);

  return (
    <div className="space-y-6">
      <PageHeader title="Booking Management" description="Track reservations, payments and booking lifecycle by partner and customer." />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Bookings", value: bookings.length },
          { label: "Confirmed", value: bookings.filter((item) => item.bookingStatus === "Confirmed").length },
          { label: "Pending", value: bookings.filter((item) => item.bookingStatus === "Pending").length },
          { label: "Revenue", value: "₹18.4L" },
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
            <SearchInput value={query} onChange={setQuery} placeholder="Search customer, property or partner" />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${statusFilter === status ? "bg-[#075d59] text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {paymentOptions.map((status) => (
            <button key={status} type="button" onClick={() => setPaymentFilter(status)} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${paymentFilter === status ? "bg-[#183b3a] text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
              {status}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th className="px-4 py-3 font-semibold">Booking ID</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Property</th>
                <th className="px-4 py-3 font-semibold">Partner</th>
                <th className="px-4 py-3 font-semibold">Check-in</th>
                <th className="px-4 py-3 font-semibold">Check-out</th>
                <th className="px-4 py-3 font-semibold">Guests</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-700">{booking.id}</td>
                  <td className="px-4 py-3 text-gray-600">{booking.customer}</td>
                  <td className="px-4 py-3 text-gray-600">{booking.property}</td>
                  <td className="px-4 py-3 text-gray-600">{booking.partner}</td>
                  <td className="px-4 py-3 text-gray-600">{booking.checkIn}</td>
                  <td className="px-4 py-3 text-gray-600">{booking.checkOut}</td>
                  <td className="px-4 py-3 text-gray-600">{booking.guests}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{booking.amount}</td>
                  <td className="px-4 py-3"><StatusBadge status={booking.paymentStatus} /></td>
                  <td className="px-4 py-3"><StatusBadge status={booking.bookingStatus} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/bookings/${booking.id}`} className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200" title="View"><Eye size={15} /></Link>
                      <button type="button" className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100" title="Edit"><Pencil size={15} /></button>
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

export default Bookings;
