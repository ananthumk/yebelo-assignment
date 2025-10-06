"use client";
import React, { useEffect, useState } from "react";
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
  selectedToken?: string; // new prop
};

function mulberry32_p(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashString_p(s = "") {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

function generateDummyPriceData(count = 30, seedStr = ""): PriceData[] {
  const now = Date.now();
  const minute = 60_000;
  const arr: PriceData[] = [];
  const seed = seedStr ? hashString_p(seedStr) : Math.floor(now % 2147483647);
  const rng = mulberry32_p(seed);
  const baseShift = (seed % 200) - 100; // -100..+99 price shift per token
  const volatility = 0.5 + ((seed % 10) / 2); // 0.5..5.0

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * minute);
    const time = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const base = 100 + Math.sin(i / 4) * 10 + baseShift;
    const jitter = (rng() - 0.5) * volatility * 4;
    const price = Math.round((base + jitter) * 100) / 100;
    arr.push({ time, price: price > 0 ? price : Math.abs(price) + 1 });
  }
  return arr;
}

export default function PriceChart({ data = [], selectedToken }: Props) {
  const usingDummy = !data || data.length === 0;
  const initial = usingDummy ? generateDummyPriceData(30, selectedToken || "") : data;
  const [chartData, setChartData] = useState<PriceData[]>(initial);

  useEffect(() => {
    if (!usingDummy) {
      setChartData(data);
      return;
    }
    // regenerate when token changes to create big visible differences
    setChartData(generateDummyPriceData(30, selectedToken || ""));

    const interval = setInterval(() => {
      setChartData(prev => {
        const last = prev[prev.length - 1];
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const jitter = (Math.random() - 0.5) * 2; // small continuous change
        let nextPrice = +(last.price + jitter).toFixed(2);
        if (nextPrice <= 0) nextPrice = Math.abs(nextPrice) + 1;
        const next = { time, price: nextPrice };
        const out = [...prev.slice(1), next];
        return out;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [usingDummy, selectedToken]);

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
        <div className="mt-2 text-xs text-gray-500">Displaying dummy price data (updates every 3s).</div>
      )}
    </div>
  );
}
