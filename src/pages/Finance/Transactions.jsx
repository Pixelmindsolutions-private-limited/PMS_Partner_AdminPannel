import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { transactionsData } from "../../data/payments";

function Transactions() {
  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" description="Complete transaction history for payments, refunds, commissions and payouts." />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th className="px-4 py-3 font-semibold">Transaction ID</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Partner</th>
                <th className="px-4 py-3 font-semibold">Booking</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Payment Method</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactionsData.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-3">{transaction.id}</td>
                  <td className="px-4 py-3">{transaction.type}</td>
                  <td className="px-4 py-3">{transaction.partner}</td>
                  <td className="px-4 py-3">{transaction.booking}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{transaction.amount}</td>
                  <td className="px-4 py-3">{transaction.method}</td>
                  <td className="px-4 py-3"><StatusBadge status={transaction.status} /></td>
                  <td className="px-4 py-3">{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
