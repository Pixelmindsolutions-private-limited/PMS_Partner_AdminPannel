import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { revenueData } from "../../data/dashboardData";

function RevenueChart() {
  const formatAmount = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }

    return `₹${(value / 1000).toFixed(0)}K`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={revenueData}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient
            id="revenueGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#0f9d92"
              stopOpacity={0.3}
            />

            <stop
              offset="100%"
              stopColor="#0f9d92"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>

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
          tickFormatter={formatAmount}
        />

        <Tooltip
          formatter={(value) => [
            `₹${Number(value).toLocaleString("en-IN")}`,
            "Revenue",
          ]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          }}
        />

        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#0f9d92"
          strokeWidth={3}
          fill="url(#revenueGradient)"
          dot={{
            r: 4,
            fill: "#0f9d92",
            strokeWidth: 2,
            stroke: "#ffffff",
          }}
          activeDot={{
            r: 6,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default RevenueChart;