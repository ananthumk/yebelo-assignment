import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

type RSIData = {
  time: string,
  rsi: number,
};

type Props = {
  data: RSIData[];
};

export default function RSIChart({ data }: Props) {
  return (
    <div style={{ width: '100%', height: 220 }} className="mt-6">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="#eee" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <ReferenceLine y={30} stroke="red" strokeDasharray="3 3" label="30" />
          <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" label="70" />
          <Line type="monotone" dataKey="rsi" stroke="#82ca9d" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

