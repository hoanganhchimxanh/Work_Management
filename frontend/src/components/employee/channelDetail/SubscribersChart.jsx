import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function SubscribersChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" style={{ fontSize: "12px" }} />
        <YAxis style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #dee2e6",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="subsGained"
          stroke="#0d6efd"
          strokeWidth={2}
          name="Subs tăng"
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="subsLost"
          stroke="#dc3545"
          strokeWidth={2}
          name="Subs giảm"
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="netSubs"
          stroke="#6f42c1"
          strokeWidth={2}
          name="Subs thực tế"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SubscribersChart;
