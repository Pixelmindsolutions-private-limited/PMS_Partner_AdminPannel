import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { paymentTransactions } from "../../data/payments";

function Payments() {
  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Track all platform payment transactions and settlement progress." />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total Revenue", "₹24.8L"],
          ["Platform Commission", "₹2.6L"],
          ["Partner Earnings", "₹18.7L"],
          ["Pending Payouts", "₹5.2L"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">{label}</p>
            <h3 className="mt-3 text-2xl font-bold text-gray-800">{value}</h3>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th className="px-4 py-3 font-semibold">Transaction ID</th>
                <th className="px-4 py-3 font-semibold">Booking ID</th>
                <th className="px-4 py-3 font-semibold">Partner</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Commission</th>
                <th className="px-4 py-3 font-semibold">Partner Amount</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {paymentTransactions.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-3">{item.id}</td>
                  <td className="px-4 py-3">{item.bookingId}</td>
                  <td className="px-4 py-3">{item.partner}</td>
                  <td className="px-4 py-3">{item.customer}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{item.amount}</td>
                  <td className="px-4 py-3">{item.commission}</td>
                  <td className="px-4 py-3">{item.partnerAmount}</td>
                  <td className="px-4 py-3">{item.paymentMethod}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.paymentStatus} /></td>
                  <td className="px-4 py-3">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payments;
