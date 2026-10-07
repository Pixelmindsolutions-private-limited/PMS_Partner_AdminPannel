import { useParams } from "react-router-dom";
import { Building2, MapPin } from "lucide-react";
import propertiesData from "../../data/properties";

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

function PropertyDetails() {
  const { id } = useParams();
  const property = propertiesData.find((item) => item.id === id) || propertiesData[0];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{property.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{property.partner} • {property.location}</p>
          </div>
          <StatusBadge status={property.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Property Type", property.type],
          ["Rooms", `${property.rooms} rooms`],
          ["Base Price", property.price],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">{label}</p>
            <h3 className="mt-3 text-xl font-bold text-gray-800">{value}</h3>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[#075d59]"><Building2 size={18} /> <h2 className="font-semibold">Property Information</h2></div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><span className="font-medium text-gray-700">Property ID:</span> {property.id}</li>
            <li><span className="font-medium text-gray-700">Partner:</span> {property.partner}</li>
            <li><span className="font-medium text-gray-700">Location:</span> {property.location}</li>
            <li><span className="font-medium text-gray-700">Capacity:</span> 8 guests</li>
            <li><span className="font-medium text-gray-700">Check-in:</span> 2:00 PM</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[#075d59]"><MapPin size={18} /> <h2 className="font-semibold">Location & Amenities</h2></div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Address: 21 Coastal Avenue, Goa</li>
            <li>Latitude: 15.2993</li>
            <li>Longitude: 74.1230</li>
            <li>Amenities: WiFi, Parking, Pool, Gym, AC, Room Service</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;
