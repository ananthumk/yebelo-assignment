"use client";
import React, { useEffect, useState } from "react";
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
  selectedToken?: string; // new prop
};

// small deterministic RNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashString(s = "") {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

function clamp(n: number, lo = 1, hi = 99) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function generateDummyData(count = 30, seedStr = ""): RSIData[] {
  const now = Date.now();
  const minute = 60_000;
  const arr: RSIData[] = [];
  const seed = seedStr ? hashString(seedStr) : Math.floor(now % 2147483647);
  const rng = mulberry32(seed);
  // much larger per-token baseline shift and higher volatility to make tokens noticeably different
  const tokenOffset = Math.round((seed % 81) - 40); // -40..+40 shift per token
  const volatility = 6 + Math.round((seed % 20)); // 6..25 volatility

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * minute);
    const time = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    // base oscillation + tokenOffset + rng-driven wiggle * volatility
    const base = 50 + Math.round(Math.sin(i / 3) * 12) + tokenOffset;
    const jitter = Math.round((rng() - 0.5) * volatility * 2);
    let rsi = base + jitter;
    rsi = clamp(rsi);
    arr.push({ time, rsi });
  }
  return arr;
}

export default function RSIChart({ data = [], selectedToken }: Props) {
  const usingDummy = !data || data.length === 0;
  const initial = usingDummy ? generateDummyData(30, selectedToken || "") : data;
  const [chartData, setChartData] = useState<RSIData[]>(initial);

  useEffect(() => {
    if (!usingDummy) {
      setChartData(data);
      return;
    }

    // regenerate when selectedToken changes to show pronounced difference
    const base = generateDummyData(30, selectedToken || "");

    // create a large immediate spike/drop based on token hash so it's deterministic and large
    if (selectedToken) {
      const h = hashString(selectedToken);
      const spikeMag = 20 + (h % 30); // 20..49 RSI points magnitude
      const direction = (h % 2 === 0) ? 1 : -1; // up or down
      // taper spike across last 3 points for visible but not instantaneous single-point glitch
      const tapered = base.slice();
      for (let k = 0; k < 3; k++) {
        const idx = tapered.length - 1 - k;
        if (idx >= 0) {
          const taperFactor = 1 - k * 0.4; // 1, 0.6, 0.2
          const newVal = clamp(tapered[idx].rsi + direction * spikeMag * taperFactor);
          tapered[idx] = { ...tapered[idx], rsi: newVal };
        }
      }
      setChartData(tapered);
    } else {
      setChartData(base);
    }

    const interval = setInterval(() => {
      setChartData(prev => {
        const last = prev[prev.length - 1];
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const jitter = Math.round((Math.random() - 0.5) * 6); // -3..+3
        let nextRsi = last.rsi + jitter;
        nextRsi = clamp(nextRsi);
        const next = { time, rsi: nextRsi };
        const out = [...prev.slice(1), next];
        return out;
      });
    }, 3000);

    return () => clearInterval(interval);
  // include selectedToken so token change triggers regeneration + spike
  }, [usingDummy, selectedToken]);

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
        <div className="mt-2 text-xs text-gray-500">Displaying dummy RSI data (updates every 3s). Token changes produce large shifts.</div>
      )}
    </div>
  );
}

