import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function RevenueChart({ data }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // ✅ MỚI - Tự động điều chỉnh format YAxis
  const formatYAxis = (value) => {
    if (value === 0) return "0";

    // >= 1 triệu → 1.5M
    if (Math.abs(value) >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }

    // >= 1 nghìn → 500k
    if (Math.abs(value) >= 1_000) {
      return `${(value / 1_000).toFixed(0)}k`;
    }

    return value.toFixed(0);
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#198754" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#198754" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="date" style={{ fontSize: "12px" }} />

        <YAxis style={{ fontSize: "12px" }} tickFormatter={formatYAxis} />

        <Tooltip
          formatter={(value) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #dee2e6",
          }}
        />

        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#198754"
          fillOpacity={1}
          fill="url(#colorRevenue)"
          name="Doanh thu"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default RevenueChart;
