import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { partnerEarnings } from "../../data/payments";

function Earnings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Partner Earnings" description="Summary of partner revenue, commissions and payouts across the network." />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Gross Revenue", "₹1.12Cr"],
          ["Commission", "₹11.2L"],
          ["Net Earnings", "₹1.01Cr"],
          ["Pending", "₹18.6L"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">{label}</p>
            <h3 className="mt-3 text-2xl font-bold text-gray-800">{value}</h3>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Revenue Trend</h2>
        </div>
        <div className="flex h-52 items-end gap-3">
          {[38, 52, 44, 68, 72, 82].map((height, index) => (
            <div key={index} className="flex-1 rounded-t-2xl bg-[#075d59]/80" style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th className="px-4 py-3 font-semibold">Partner</th>
                <th className="px-4 py-3 font-semibold">Total Bookings</th>
                <th className="px-4 py-3 font-semibold">Gross Revenue</th>
                <th className="px-4 py-3 font-semibold">Commission</th>
                <th className="px-4 py-3 font-semibold">Net Earnings</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Pending</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {partnerEarnings.map((item) => (
                <tr key={item.partner} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.partner}</td>
                  <td className="px-4 py-3">{item.totalBookings}</td>
                  <td className="px-4 py-3">{item.grossRevenue}</td>
                  <td className="px-4 py-3">{item.commission}</td>
                  <td className="px-4 py-3">{item.netEarnings}</td>
                  <td className="px-4 py-3">{item.paid}</td>
                  <td className="px-4 py-3">{item.pending}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Earnings;
