import React from "react";

type Props = {
  price: number | null;
  rsi: number | null;
};

export default function CurrentValues({ price, rsi }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:space-x-10 p-4 bg-white rounded shadow mt-4 w-full max-w-2xl">
      <div className="flex-1">
        <p className="font-semibold">Current Price</p>
        <p className="text-lg">{price !== null ? price.toFixed(6) : "--"}</p>
      </div>
      <div className="flex-1 mt-2 sm:mt-0">
        <p className="font-semibold">Current RSI</p>
        <p className="text-lg">{rsi !== null ? rsi.toFixed(2) : "--"}</p>
      </div>
    </div>
  );
}
