import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PriceData = {
  time: string,
  price: number,
};

type Props = {
  data?: PriceData[]; // allow undefined
};

function generateDummyPriceData(count = 30): PriceData[] {
  const now = Date.now();
  const minute = 60_000;
  const arr: PriceData[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * minute);
    const time = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    // smooth oscillation + small jitter
    const base = 100 + Math.sin(i / 4) * 10;
    const jitter = (Math.sin(i) * 2);
    const price = Math.round((base + jitter) * 100) / 100;
    arr.push({ time, price });
  }
  return arr;
}

export default function PriceChart({ data = [] }: Props) {
  const usingDummy = !data || data.length === 0;
  const chartData = usingDummy ? generateDummyPriceData(30) : data;

  return (
    <div style={{ width: '100%', height: 300 }} className="mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="time" />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      {usingDummy && (
        <div className="mt-2 text-xs text-gray-500">Displaying dummy price data because none was provided.</div>
      )}
    </div>
  );
}
