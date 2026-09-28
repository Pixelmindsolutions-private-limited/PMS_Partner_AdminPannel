import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FileText, Landmark, MapPin, Wallet } from "lucide-react";
import Button from "../../components/Button";
import StatusBadge from "../../components/StatusBadge";
import partnersData from "../../data/partners";
import propertiesData from "../../data/properties";
import bookingsData from "../../data/bookings";
import { paymentTransactions } from "../../data/payments";

const tabs = ["Overview", "Properties", "Bookings", "Payments", "Documents"];

function PartnerDetails() {
  const { id } = useParams();
  const partner = partnersData.find((item) => item.id === id) || partnersData[0];
  const [activeTab, setActiveTab] = useState("Overview");

  const partnerProperties = useMemo(
    () => propertiesData.filter((item) => item.partner === partner.company),
    [partner.company],
  );

  const partnerBookings = useMemo(
    () => bookingsData.filter((item) => item.partner === partner.company),
    [partner.company],
  );

  const partnerPayments = useMemo(
    () => paymentTransactions.filter((item) => item.partner === partner.company),
    [partner.company],
  );

  const documents = [
    { name: "Business Registration", uploaded: "2026-09-10", status: "Verified" },
    { name: "GST Certificate", uploaded: "2026-09-10", status: "Verified" },
    { name: "PAN Card", uploaded: "2026-09-09", status: "Verified" },
    { name: "ID Proof", uploaded: "2026-09-08", status: "Pending" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#075d59] text-xl font-bold text-white">{partner.name.charAt(0)}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{partner.name}</h1>
              <p className="text-sm text-gray-500">{partner.company}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                <span>Partner ID: {partner.id}</span>
                <span>•</span>
                <span>{partner.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatusBadge status={partner.status} />
            <Button variant="secondary">Edit</Button>
            <Button variant="danger">Suspend</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total Properties", partnerProperties.length],
          ["Total Bookings", partnerBookings.length],
          ["Total Revenue", partner.revenue],
          ["Commission", "₹3.6L"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">{label}</p>
            <h3 className="mt-3 text-xl font-bold text-gray-800">{value}</h3>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${activeTab === tab ? "bg-[#075d59] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-[#075d59]"><FileText size={17} /> <h3 className="font-semibold">Contact Information</h3></div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><span className="font-medium text-gray-700">Email:</span> {partner.email}</li>
                <li><span className="font-medium text-gray-700">Phone:</span> {partner.phone}</li>
                <li><span className="font-medium text-gray-700">Joined:</span> {partner.joinedDate}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-[#075d59]"><Landmark size={17} /> <h3 className="font-semibold">Business Information</h3></div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><span className="font-medium text-gray-700">Company:</span> {partner.company}</li>
                <li><span className="font-medium text-gray-700">Business Type:</span> Hospitality</li>
                <li><span className="font-medium text-gray-700">GST:</span> 27AABCC1234M1ZX</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-[#075d59]"><MapPin size={17} /> <h3 className="font-semibold">Address</h3></div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>12, Harbor Road</li>
                <li>Andheri East, Mumbai</li>
                <li>Maharashtra, India 400069</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-[#075d59]"><Wallet size={17} /> <h3 className="font-semibold">Bank Information</h3></div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><span className="font-medium text-gray-700">Bank:</span> HDFC Bank</li>
                <li><span className="font-medium text-gray-700">Account:</span> **** 2345</li>
                <li><span className="font-medium text-gray-700">IFSC:</span> HDFC0001234</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "Properties" && (
          <div className="space-y-3">
            {partnerProperties.map((property) => (
              <div key={property.id} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div>
                  <h4 className="font-semibold text-gray-800">{property.name}</h4>
                  <p className="text-sm text-gray-500">{property.location} • {property.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{property.price}</p>
                  <StatusBadge status={property.status} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Bookings" && (
          <div className="space-y-3">
            {partnerBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div>
                  <h4 className="font-semibold text-gray-800">{booking.id}</h4>
                  <p className="text-sm text-gray-500">{booking.customer} • {booking.checkIn} to {booking.checkOut}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{booking.amount}</p>
                  <StatusBadge status={booking.bookingStatus} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Payments" && (
          <div className="space-y-3">
            {partnerPayments.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div>
                  <h4 className="font-semibold text-gray-800">{item.id}</h4>
                  <p className="text-sm text-gray-500">{item.bookingId} • {item.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{item.amount}</p>
                  <StatusBadge status={item.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Documents" && (
          <div className="grid gap-4 md:grid-cols-2">
            {documents.map((document) => (
              <div key={document.name} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{document.name}</h4>
                    <p className="mt-1 text-xs text-gray-500">Uploaded: {document.uploaded}</p>
                  </div>
                  <StatusBadge status={document.status} />
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="secondary">View</Button>
                  <Button variant="secondary">Download</Button>
                  <Button variant="success">Approve</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PartnerDetails;
