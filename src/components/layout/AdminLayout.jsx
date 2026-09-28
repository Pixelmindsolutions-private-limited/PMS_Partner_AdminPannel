import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f4f7f8]">

      <Sidebar />

      <Header />

      <main className="ml-[280px] pt-[76px]">

        <div className="min-h-[calc(100vh-76px)] p-6">

          <Outlet />

        </div>

      </main>

    </div>
  );
}

export default AdminLayout;