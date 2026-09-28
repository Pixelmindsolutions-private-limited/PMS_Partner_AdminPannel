import { useParams } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import customersData from "../../data/customers";

function CustomerDetails() {
  const { id } = useParams();
  const customer = customersData.find((item) => item.id === id) || customersData[0];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{customer.email} • {customer.phone}</p>
          </div>
          <StatusBadge status={customer.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total Bookings", customer.bookings],
          ["Completed", "7"],
          ["Cancelled", "1"],
          ["Total Spent", customer.totalSpent],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">{label}</p>
            <h3 className="mt-3 text-xl font-bold text-gray-800">{value}</h3>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Profile</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><span className="font-medium text-gray-700">Customer ID:</span> {customer.id}</li>
            <li><span className="font-medium text-gray-700">Joined:</span> {customer.joinedDate}</li>
            <li><span className="font-medium text-gray-700">Last Booking:</span> {customer.lastBooking}</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Booking History</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>BK-5001 • Azure Peak Resort • ₹18,900</li>
            <li>BK-5003 • Sunset Villa • ₹22,400</li>
            <li>BK-5005 • Cedar Residences • ₹13,500</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetails;
