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
  data?: RSIData[]; // allow undefined
};

function generateDummyData(count = 30): RSIData[] {
  const now = Date.now();
  const minute = 60_000;
  const arr: RSIData[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * minute);
    const time = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    // pseudo-random but deterministic-ish pattern
    const base = 50 + Math.round(Math.sin(i / 3) * 12);
    const jitter = Math.round((Math.abs(Math.sin(i)) * 10) % 10) - 5;
    let rsi = base + jitter;
    if (rsi < 1) rsi = 1;
    if (rsi > 99) rsi = 99;
    arr.push({ time, rsi });
  }
  return arr;
}

export default function RSIChart({ data = [] }: Props) {
  const usingDummy = !data || data.length === 0;
  const chartData = usingDummy ? generateDummyData(30) : data;

  return (
    <div style={{ width: '100%', height: 220 }} className="mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="#eee" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <ReferenceLine y={30} stroke="red" strokeDasharray="3 3" label="30" />
          <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" label="70" />
          <Line type="monotone" dataKey="rsi" stroke="#82ca9d" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      {usingDummy && (
        <div className="mt-2 text-xs text-gray-500">Displaying dummy RSI data because none was provided.</div>
      )}
    </div>
  );
}

