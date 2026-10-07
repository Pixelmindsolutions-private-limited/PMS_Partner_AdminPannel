import { useState } from "react";
import notificationsData from "../../data/notifications";

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

function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className={`w-full rounded-2xl border border-gray-200 bg-white shadow-2xl ${sizes[size]}`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
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

function NotificationsPage() {
  const [notifications, setNotifications] = useState(notificationsData);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", target: "All Partners", type: "General" });

  const handleSend = (event) => {
    event.preventDefault();

    setNotifications((current) => [{
      id: Date.now(),
      title: form.title,
      message: form.message,
      target: form.target,
      type: form.type,
      date: new Date().toISOString().slice(0, 10),
      status: "Unread",
    }, ...current]);

    setForm({ title: "", message: "", target: "All Partners", type: "General" });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Track communication and send operational updates to partners and customers." actions={[{ label: "Send Notification", onClick: () => setShowModal(true), variant: "primary" }]} />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Message</th>
                <th className="px-4 py-3 font-semibold">Target</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-800">{notification.title}</td>
                  <td className="px-4 py-3 text-gray-600">{notification.message}</td>
                  <td className="px-4 py-3 text-gray-600">{notification.target}</td>
                  <td className="px-4 py-3 text-gray-600">{notification.type}</td>
                  <td className="px-4 py-3 text-gray-600">{notification.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={notification.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, status: "Read" } : item))}>Mark as Read</Button>
                      <Button variant="danger" onClick={() => setNotifications((current) => current.filter((item) => item.id !== notification.id))}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Send Notification" size="lg">
        <form onSubmit={handleSend} className="space-y-4">
          <label className="block text-sm text-gray-600">
            <span className="mb-1 block">Title</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]" />
          </label>

          <label className="block text-sm text-gray-600">
            <span className="mb-1 block">Message</span>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows="4" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-600">
              <span className="mb-1 block">Target</span>
              <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]">
                <option>All Partners</option>
                <option>Active Partners</option>
                <option>Specific Partner</option>
                <option>All Customers</option>
                <option>Specific Customer</option>
              </select>
            </label>
            <label className="block text-sm text-gray-600">
              <span className="mb-1 block">Notification Type</span>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]">
                <option>General</option>
                <option>Payment</option>
                <option>Approval</option>
                <option>System</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Send</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default NotificationsPage;
