import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Partners from "./pages/Partners/Partners";
import PartnerDetails from "./pages/Partners/PartnerDetails";
import Properties from "./pages/Properties/Properties";
import PropertyDetails from "./pages/Properties/PropertyDetails";
import Banners from "./pages/Banners/Banners";

import ProjectPayments from "./pages/Finance/ProjectPayments";
import Earnings from "./pages/Finance/Earnings";
import WalletMoney from "./pages/Finance/WalletMoney";
import Transactions from "./pages/Finance/Transactions";
import Customers from "./pages/Customers/Customers";
import CustomerDetails from "./pages/Customers/CustomerDetails";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications/Notifications";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import PrivateRoute from "./pages/PrivateRoute";
import PendingPartners from "./pages/Partners/PendingPartners";
import ActivePartners from "./pages/Partners/ActivePartners";
import SuspendedPartners from "./pages/Partners/SuspendedPartners";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/partners" element={<Partners />} />
          <Route path="/partners/pending" element={<PendingPartners />} />
          <Route path="/partners/active" element={<ActivePartners />} />
          <Route path="/partners/suspended" element={<SuspendedPartners />} />
          <Route path="/partners/:id" element={<PartnerDetails />} />

          <Route path="/properties" element={<Properties />} />
          <Route
            path="/properties/approvals"
            element={<Properties initialStatus="Pending" />}
          />
          <Route path="/properties/:id" element={<PropertyDetails />} />

          <Route path="/Banners" element={<Banners />} />

          <Route path="/projectpayments" element={<ProjectPayments />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/wallet" element={<WalletMoney />} />
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
