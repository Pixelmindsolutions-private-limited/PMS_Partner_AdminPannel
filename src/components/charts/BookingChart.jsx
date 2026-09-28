import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { bookingData } from "../../data/dashboardData";

function BookingChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={bookingData}
        margin={{
          top: 10,
          right: 5,
          left: 0,
          bottom: 0,
        }}
        barGap={6}
      >
        <CartesianGrid
          stroke="#edf2f2"
          vertical={false}
        />

        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 12,
            fill: "#94a3b8",
          }}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 11,
            fill: "#94a3b8",
          }}
        />

        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        />

        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          wrapperStyle={{
            fontSize: "12px",
            paddingBottom: "15px",
          }}
        />

        <Bar
          dataKey="confirmed"
          name="Confirmed"
          fill="#0f9d92"
          radius={[5, 5, 0, 0]}
          barSize={12}
        />

        <Bar
          dataKey="completed"
          name="Completed"
          fill="#6d5dfc"
          radius={[5, 5, 0, 0]}
          barSize={12}
        />

        <Bar
          dataKey="cancelled"
          name="Cancelled"
          fill="#f59e0b"
          radius={[5, 5, 0, 0]}
          barSize={12}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default BookingChart;