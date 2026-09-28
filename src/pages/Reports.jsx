import PageHeader from "../components/PageHeader";

function Reports() {
  const reportCards = [
    ["Revenue Report", "₹48.2L"],
    ["Booking Report", "1,846"],
    ["Partner Report", "248"],
    ["Property Report", "684"],
    ["Commission Report", "₹8.6L"],
    ["Payout Report", "₹5.1L"],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Platform performance, revenue and growth analytics across the portfolio." actions={[{ label: "Export CSV", onClick: () => alert("CSV export generated."), variant: "secondary" }, { label: "Export PDF", onClick: () => alert("PDF export generated."), variant: "primary" }]} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">{label}</p>
            <h3 className="mt-3 text-2xl font-bold text-gray-800">{value}</h3>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Revenue</h2>
          <div className="flex h-52 items-end gap-3">
            {[30, 38, 48, 57, 74, 88].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-xl bg-[#075d59]" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Bookings</h2>
          <div className="flex h-52 items-end gap-3">
            {[18, 27, 35, 46, 63, 76].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-xl bg-[#09877f]" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
