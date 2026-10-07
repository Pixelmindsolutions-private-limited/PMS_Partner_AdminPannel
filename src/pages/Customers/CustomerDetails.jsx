import { useParams } from "react-router-dom";
import customersData from "../../data/customers";

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

      <div className="grid gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Profile</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><span className="font-medium text-gray-700">Customer ID:</span> {customer.id}</li>
            <li><span className="font-medium text-gray-700">Joined:</span> {customer.joinedDate}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetails;
