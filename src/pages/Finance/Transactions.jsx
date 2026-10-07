import { transactionsData } from "../../data/payments";

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
