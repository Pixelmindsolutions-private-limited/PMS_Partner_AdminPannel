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

const tabs = ["Profile", "General", "Commission", "Notifications", "Security", "Roles & Permissions"];

function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage admin profile, company policies, commission rules and security controls." />

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button key={tab} type="button" className={`rounded-xl px-3 py-2 text-sm font-medium ${tab === "Profile" ? "bg-[#075d59] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="mb-4 text-lg font-bold text-gray-800">Profile</h2>
            <div className="space-y-4 text-sm text-gray-600">
              <label className="block"><span className="mb-1 block">Admin Name</span><input defaultValue="Admin User" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5" /></label>
              <label className="block"><span className="mb-1 block">Email</span><input defaultValue="admin@pmspartner.com" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5" /></label>
              <label className="block"><span className="mb-1 block">Phone</span><input defaultValue="+91 98765 43210" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5" /></label>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="mb-4 text-lg font-bold text-gray-800">Commission</h2>
            <div className="space-y-4 text-sm text-gray-600">
              <label className="block"><span className="mb-1 block">Platform Commission %</span><input defaultValue="10" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5" /></label>
              <label className="block"><span className="mb-1 block">Partner Commission %</span><input defaultValue="90" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5" /></label>
              <label className="block"><span className="mb-1 block">Cancellation Fee</span><input defaultValue="₹500" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5" /></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
