import {
  Users,
  Building2,
  CalendarCheck,
  IndianRupee,
  Clock3,
  ArrowUpRight,
  MoreHorizontal,
  AlertCircle,
  Eye,
} from "lucide-react";

import RevenueChart from "../components/charts/RevenueChart";
import BookingChart from "../components/charts/BookingChart";
import PartnerGrowthChart from "../components/charts/PartnerGrowthChart";
import PropertyChart from "../components/charts/PropertyChart";

import {
  recentBookings,
  pendingPartners,
} from "../data/dashboardData";

const stats = [
  {
    title: "Total Partners",
    value: "248",
    change: "12.5%",
    trend: "up",
    icon: Users,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Active Partners",
    value: "192",
    change: "8.2%",
    trend: "up",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Properties",
    value: "684",
    change: "15.4%",
    trend: "up",
    icon: Building2,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    title: "Bookings",
    value: "1,842",
    change: "11.8%",
    trend: "up",
    icon: CalendarCheck,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    title: "Revenue",
    value: "₹24.8L",
    change: "18.6%",
    trend: "up",
    icon: IndianRupee,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    title: "Pending Approvals",
    value: "18",
    change: "Needs review",
    trend: "warning",
    icon: Clock3,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Confirmed:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
    Completed:
      "bg-blue-50 text-blue-700 border-blue-100",
    Pending:
      "bg-yellow-50 text-yellow-700 border-yellow-100",
    Cancelled:
      "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        styles[status] || "bg-gray-50 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function Dashboard() {
  return (
    <div className="space-y-6">

      {/* ================================= */}
      {/* Welcome */}
      {/* ================================= */}

      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#075d59] via-[#09877f] to-[#12aaa0] p-7 text-white shadow-sm">

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

          <div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
              PMS ADMIN PANEL
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, Admin 👋
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/70">
              Manage your partners, properties, bookings and
              platform operations from one place.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              System Operational
            </div>

          </div>

        </div>

      </section>

      {/* ================================= */}
      {/* Stats */}
      {/* ================================= */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {stats.map((item) => {

          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">
                    {item.title}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-800">
                    {item.value}
                  </h2>

                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg}`}
                >
                  <Icon
                    size={20}
                    className={item.iconColor}
                  />
                </div>

              </div>

              <div className="mt-4 flex items-center gap-2">

                {item.trend === "warning" ? (
                  <>
                    <AlertCircle
                      size={14}
                      className="text-yellow-500"
                    />

                    <span className="text-xs font-medium text-yellow-600">
                      {item.change}
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight
                      size={14}
                      className="text-emerald-500"
                    />

                    <span className="text-xs font-semibold text-emerald-600">
                      {item.change}
                    </span>

                    <span className="text-xs text-gray-400">
                      vs last month
                    </span>
                  </>
                )}

              </div>

            </div>
          );
        })}

      </section>

      {/* ================================= */}
      {/* Revenue + Booking */}
      {/* ================================= */}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-start justify-between">

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Revenue Overview
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Monthly platform revenue
              </p>
            </div>

            <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-50">
              <MoreHorizontal size={19} />
            </button>

          </div>

          <div className="h-[280px]">
            <RevenueChart />
          </div>

        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-start justify-between">

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Booking Trends
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Booking performance by month
              </p>
            </div>

            <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-50">
              <MoreHorizontal size={19} />
            </button>

          </div>

          <div className="h-[280px]">
            <BookingChart />
          </div>

        </div>

      </section>

      {/* ================================= */}
      {/* Partner Growth + Property Types */}
      {/* ================================= */}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-lg font-bold text-gray-800">
              Partner Growth
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Partner registrations over the last 6 months
            </p>

          </div>

          <div className="h-[280px]">
            <PartnerGrowthChart />
          </div>

        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-lg font-bold text-gray-800">
              Property Distribution
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Properties by category
            </p>

          </div>

          <div className="h-[280px]">
            <PropertyChart />
          </div>

        </div>

      </section>

      {/* ================================= */}
      {/* Recent Bookings */}
      {/* ================================= */}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Recent Bookings
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Latest booking activity
            </p>
          </div>

          <button className="text-sm font-semibold text-[#07877f] hover:text-[#075d59]">
            View All
          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px]">

            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">

                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Booking
                </th>

                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Customer
                </th>

                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Property
                </th>

                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Check-in
                </th>

                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Amount
                </th>

                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Payment
                </th>

                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {recentBookings.map((booking) => (

                <tr
                  key={booking.id}
                  className="border-b border-gray-100 transition hover:bg-gray-50/70"
                >

                  <td className="px-6 py-4">

                    <span className="text-sm font-semibold text-[#075d59]">
                      {booking.id}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <p className="text-sm font-medium text-gray-700">
                      {booking.customer}
                    </p>

                  </td>

                  <td className="px-6 py-4">

                    <p className="text-sm text-gray-600">
                      {booking.property}
                    </p>

                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {booking.partner}
                    </p>

                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {booking.checkIn}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    {booking.amount}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`text-xs font-medium ${
                        booking.payment === "Paid"
                          ? "text-emerald-600"
                          : booking.payment === "Pending"
                          ? "text-yellow-600"
                          : "text-red-500"
                      }`}
                    >
                      {booking.payment}
                    </span>

                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={booking.status} />
                  </td>

                  <td className="px-6 py-4 text-right">

                    <button className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-[#075d59]">
                      <Eye size={17} />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

      {/* ================================= */}
      {/* Pending Partners */}
      {/* ================================= */}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

          <div>

            <div className="flex items-center gap-2">

              <h2 className="text-lg font-bold text-gray-800">
                Pending Partner Approvals
              </h2>

              <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-600">
                {pendingPartners.length}
              </span>

            </div>

            <p className="mt-1 text-xs text-gray-400">
              Partners waiting for verification
            </p>

          </div>

          <button className="text-sm font-semibold text-[#07877f]">
            View All
          </button>

        </div>

        <div className="divide-y divide-gray-100">

          {pendingPartners.map((partner) => (

            <div
              key={partner.id}
              className="flex flex-col gap-4 px-6 py-4 transition hover:bg-gray-50/70 md:flex-row md:items-center md:justify-between"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f7f5] font-bold text-[#087a73]">
                  {partner.name.charAt(0)}
                </div>

                <div>

                  <p className="text-sm font-semibold text-gray-800">
                    {partner.name}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {partner.email}
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap items-center gap-6">

                <div>
                  <p className="text-[10px] uppercase text-gray-400">
                    Properties
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    {partner.properties}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase text-gray-400">
                    Documents
                  </p>

                  <p
                    className={`mt-1 text-xs font-semibold ${
                      partner.documents === "Complete"
                        ? "text-emerald-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {partner.documents}
                  </p>
                </div>

                <div className="flex gap-2">

                  <button className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                    Review
                  </button>

                  <button className="rounded-lg bg-[#087f78] px-3 py-2 text-xs font-semibold text-white hover:bg-[#075d59]">
                    Approve
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default Dashboard;