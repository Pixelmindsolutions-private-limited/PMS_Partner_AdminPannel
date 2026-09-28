import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Partners from "./pages/Partners/Partners";
import PartnerDetails from "./pages/Partners/PartnerDetails";
import Properties from "./pages/Properties/Properties";
import PropertyDetails from "./pages/Properties/PropertyDetails";
import Bookings from "./pages/Bookings/Bookings";
import BookingDetails from "./pages/Bookings/BookingDetails";
import Payments from "./pages/Finance/Payments";
import Earnings from "./pages/Finance/Earnings";
import Payouts from "./pages/Finance/Payouts";
import Transactions from "./pages/Finance/Transactions";
import Customers from "./pages/Customers/Customers";
import CustomerDetails from "./pages/Customers/CustomerDetails";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications/Notifications";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import PrivateRoute from "./pages/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/partners" element={<Partners />} />
          <Route path="/partners/pending" element={<Partners initialStatus="Pending" />} />
          <Route path="/partners/active" element={<Partners initialStatus="Active" />} />
          <Route path="/partners/suspended" element={<Partners initialStatus="Suspended" />} />
          <Route path="/partners/:id" element={<PartnerDetails />} />

          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/approvals" element={<Properties initialStatus="Pending" />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />

          <Route path="/bookings" element={<Bookings />} />
          <Route path="/bookings/pending" element={<Bookings initialStatus="Pending" />} />
          <Route path="/bookings/confirmed" element={<Bookings initialStatus="Confirmed" />} />
          <Route path="/bookings/completed" element={<Bookings initialStatus="Completed" />} />
          <Route path="/bookings/cancelled" element={<Bookings initialStatus="Cancelled" />} />
          <Route path="/bookings/:id" element={<BookingDetails />} />

          <Route path="/payments" element={<Payments />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/payouts" element={<Payouts />} />
          <Route path="/transactions" element={<Transactions />} />

          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />

          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;