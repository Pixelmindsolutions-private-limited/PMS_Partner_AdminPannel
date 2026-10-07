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

function Reports() {
  const reportCards = [
    ["Revenue Report", "₹48.2L"],
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

      <div className="grid gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Revenue</h2>
          <div className="flex h-52 items-end gap-3">
            {[30, 38, 48, 57, 74, 88].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-xl bg-[#075d59]" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
