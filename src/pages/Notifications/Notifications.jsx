import { useState } from "react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import notificationsData from "../../data/notifications";

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
                <option>Booking</option>
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
