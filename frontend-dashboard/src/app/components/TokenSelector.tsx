import React from "react";

type Props = {
  tokens: string[];
  selectedToken: string;
  onChange: (token: string) => void;
};

export default function TokenSelector({ tokens, selectedToken, onChange }: Props) {
  return (
    <div className="w-full max-w-sm">
      <select
        className="w-full p-2 border rounded"
        value={selectedToken}
        onChange={(e) => onChange(e.target.value)}
      >
        {tokens.map((token) => (
          <option key={token} value={token}>
            {token}
          </option>
        ))}
      </select>
    </div>
  );
}
