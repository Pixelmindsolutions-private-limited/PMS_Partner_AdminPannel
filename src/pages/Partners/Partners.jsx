import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, UserCheck } from "lucide-react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import SearchInput from "../../components/SearchInput";
import StatusBadge from "../../components/StatusBadge";
import partnersData from "../../data/partners";

const statusOptions = ["All", "Active", "Pending", "Suspended", "Rejected"];

function Partners({ initialStatus = "All" }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [partners, setPartners] = useState(partnersData);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    businessType: "",
  });

  const filteredPartners = useMemo(() => {
    const normalized = query.toLowerCase();

    return partners.filter((partner) => {
      const matchesSearch =
        !normalized ||
        partner.name.toLowerCase().includes(normalized) ||
        partner.company.toLowerCase().includes(normalized) ||
        partner.email.toLowerCase().includes(normalized) ||
        partner.phone.toLowerCase().includes(normalized);

      const matchesStatus = statusFilter === "All" || partner.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [partners, query, statusFilter]);

  const handleFormSubmit = (event) => {
    event.preventDefault();

    const requiredFields = ["firstName", "lastName", "email", "phone", "company", "businessType"];
    const isIncomplete = requiredFields.some((field) => !String(formData[field]).trim());

    if (isIncomplete) {
      alert("Please complete all required partner fields.");
      return;
    }

    const newPartner = {
      id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${formData.firstName} ${formData.lastName}`,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      properties: 0,
      bookings: 0,
      revenue: "₹0",
      status: "Pending",
      joinedDate: new Date().toISOString().slice(0, 10),
    };

    setPartners((current) => [newPartner, ...current]);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      businessType: "",
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner Management"
        description="Monitor and manage all partner onboarding, performance and approvals."
        actions={[
          { label: "Add Partner", onClick: () => setShowModal(true), variant: "primary" },
          { label: "Export", onClick: () => alert("Export is ready for download."), variant: "secondary" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Partners", value: partners.length },
          { label: "Active", value: partners.filter((item) => item.status === "Active").length },
          { label: "Pending", value: partners.filter((item) => item.status === "Pending").length },
          { label: "Revenue", value: "₹2.8Cr" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">{stat.label}</p>
            <h3 className="mt-3 text-2xl font-bold text-gray-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-md">
            <SearchInput value={query} onChange={setQuery} placeholder="Search by name, company, email or phone" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${statusFilter === status ? "bg-[#075d59] text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th className="px-4 py-3 font-semibold">Partner ID</th>
                <th className="px-4 py-3 font-semibold">Partner Name</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Properties</th>
                <th className="px-4 py-3 font-semibold">Bookings</th>
                <th className="px-4 py-3 font-semibold">Revenue</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined Date</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner) => (
                <tr key={partner.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-700">{partner.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">{partner.name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{partner.company}</td>
                  <td className="px-4 py-3 text-gray-600">{partner.email}</td>
                  <td className="px-4 py-3 text-gray-600">{partner.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{partner.properties}</td>
                  <td className="px-4 py-3 text-gray-600">{partner.bookings}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{partner.revenue}</td>
                  <td className="px-4 py-3"><StatusBadge status={partner.status} /></td>
                  <td className="px-4 py-3 text-gray-600">{partner.joinedDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/partners/${partner.id}`} className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200" title="View"><Eye size={15} /></Link>
                      <button type="button" className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100" title="Edit"><Pencil size={15} /></button>
                      <button type="button" className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100" title="Approve"><UserCheck size={15} /></button>
                      <button type="button" className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPartners.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
            No partners match the current search and filter criteria.
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Partner" size="lg">
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-gray-600">
              <span>First Name</span>
              <input required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]" />
            </label>
            <label className="space-y-2 text-sm text-gray-600">
              <span>Last Name</span>
              <input required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]" />
            </label>
            <label className="space-y-2 text-sm text-gray-600">
              <span>Email</span>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]" />
            </label>
            <label className="space-y-2 text-sm text-gray-600">
              <span>Phone</span>
              <input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]" />
            </label>
            <label className="space-y-2 text-sm text-gray-600 md:col-span-2">
              <span>Company Name</span>
              <input required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]" />
            </label>
            <label className="space-y-2 text-sm text-gray-600 md:col-span-2">
              <span>Business Type</span>
              <input required value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-[#075d59]" />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Save Partner</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Partners;
