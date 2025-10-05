"use client";

import React, { useState, useEffect } from "react";
import TokenSelector from "./components/TokenSelector";
import PriceChart from "./components/PriceChart";
import RSIChart from "./components/RSIChart";
import CurrentValues from "./components/CurrentValues";

// Example tokens
const tokens = ["TokenA", "TokenB", "TokenC", "TokenD", "TokenE"];

type PriceData = { time: string; price: number };
type RSIData = { time: string; rsi: number };

export default function Page() {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [rsiData, setRsiData] = useState<RSIData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [currentRsi, setCurrentRsi] = useState<number | null>(null);
  const [availableTokens, setAvailableTokens] = useState<string[]>(tokens);

  // Fetch initial recent messages and token list
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('http://localhost:8000/latest?limit=200');
        const body = await res.json();
        const items = body.items || [];
        // reduce items into price/rsi series for default selected token
        const mapped = items.map((it: any) => ({
          time: new Date(Number(it.ingested_at) * 1000).toLocaleTimeString(),
          price: Number(it.price_in_sol || it.price || 0),
          rsi: Number(it.rsi || 0),
        }));
        setPriceData(mapped.slice(-50).map((m: any) => ({ time: m.time, price: m.price })));
        setRsiData(mapped.slice(-50).map((m: any) => ({ time: m.time, rsi: m.rsi })));

        const tokensRes = await fetch('http://localhost:8000/tokens');
        const tokensBody = await tokensRes.json();
        if (tokensBody.tokens && tokensBody.tokens.length > 0) {
          setAvailableTokens(tokensBody.tokens);
          setSelectedToken(tokensBody.tokens[0]);
        } else {
          setSelectedToken(tokens[0]);
        }
      } catch (e) {
        // ignore fetch errors and fallback to mock tokens
        setSelectedToken(tokens[0]);
      }
    }
    init();
  }, []);

  // Connect to SSE stream
  useEffect(() => {
    const url = 'http://localhost:8000/stream';
    const es = new EventSource(url);

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        // filter by selected token if set
        if (selectedToken && data.token_address && data.token_address !== selectedToken) return;

        const time = new Date(Number(data.ingested_at) * 1000).toLocaleTimeString();
        const price = Number(data.price_in_sol || data.price || 0);
        const rsi = Number(data.rsi || 0);

        setPriceData((prev) => [...prev.slice(-199), { time, price }]);
        setRsiData((prev) => [...prev.slice(-199), { time, rsi }]);
        setCurrentPrice(price || null);
        setCurrentRsi(rsi || null);
      } catch (e) {
        // ignore parse errors
      }
    };

    es.onerror = (e) => {
      // connection lost; EventSource will retry by default
      console.warn('SSE error', e);
    };

    return () => {
      es.close();
    };
  }, [selectedToken]);

  return (
    <div className="p-4 max-w-[95%] mx-auto">
      <h1 className="text-2xl font-bold mb-6">Live Token Dashboard</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <div className="mb-4 sm:mb-0">
          <TokenSelector
            tokens={availableTokens}
            selectedToken={selectedToken || availableTokens[0]}
            onChange={(t) => setSelectedToken(t)}
          />
        </div>
        <div className="mt-2">
          <CurrentValues price={currentPrice} rsi={currentRsi} />
        </div>
      </div>

      <PriceChart data={priceData} />
      <RSIChart data={rsiData} />
    </div>
  );
}
