import { useParams } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import bookingsData from "../../data/bookings";

function BookingDetails() {
  const { id } = useParams();
  const booking = bookingsData.find((item) => item.id === id) || bookingsData[0];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Booking</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-800">{booking.id}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={booking.bookingStatus} />
            <StatusBadge status={booking.paymentStatus} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Customer", booking.customer],
          ["Property", booking.property],
          ["Partner", booking.partner],
          ["Total Amount", booking.amount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">{label}</p>
            <h3 className="mt-3 text-lg font-bold text-gray-800">{value}</h3>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Booking Information</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><span className="font-medium text-gray-700">Booking Date:</span> {booking.createdDate}</li>
            <li><span className="font-medium text-gray-700">Check-in:</span> {booking.checkIn}</li>
            <li><span className="font-medium text-gray-700">Check-out:</span> {booking.checkOut}</li>
            <li><span className="font-medium text-gray-700">Guests:</span> {booking.guests}</li>
            <li><span className="font-medium text-gray-700">Payment Method:</span> UPI</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Payment Information</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><span className="font-medium text-gray-700">Total Amount:</span> {booking.amount}</li>
            <li><span className="font-medium text-gray-700">Tax:</span> ₹1,350</li>
            <li><span className="font-medium text-gray-700">Commission:</span> ₹1,890</li>
            <li><span className="font-medium text-gray-700">Partner Amount:</span> ₹17,010</li>
            <li><span className="font-medium text-gray-700">Payment Status:</span> {booking.paymentStatus}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default BookingDetails;
