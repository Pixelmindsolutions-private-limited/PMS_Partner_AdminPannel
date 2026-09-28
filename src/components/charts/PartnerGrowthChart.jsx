import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { partnerGrowthData } from "../../data/dashboardData";

function PartnerGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={partnerGrowthData}>

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

        <Line
          type="monotone"
          dataKey="partners"
          name="Partners"
          stroke="#6d5dfc"
          strokeWidth={3}
          dot={{
            r: 4,
            fill: "#6d5dfc",
            stroke: "#fff",
            strokeWidth: 2,
          }}
        />

      </LineChart>
    </ResponsiveContainer>
  );
}

export default PartnerGrowthChart;