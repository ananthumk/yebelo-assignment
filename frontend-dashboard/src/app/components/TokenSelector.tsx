import React, { useEffect, useRef, useState } from "react";

type Props = {
  tokens: string[];
  selectedToken: string;
  onChange: (token: string) => void;
};

export default function TokenSelector({ tokens, selectedToken, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="w-full" ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="w-full text-left px-3 py-2 border rounded flex items-center justify-between"
        title={selectedToken}
      >
        <span className="truncate">{selectedToken || "Select token"}</span>
        <span className="ml-2 text-xs opacity-60">▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Token options"
          className="absolute left-0 right-0 mt-1 z-50 max-h-60 overflow-auto rounded shadow-lg"
          style={{ background: "black", listStyle: "none", padding: 0, margin: 0 }}
        >
          {tokens.map((token) => (
            <li
              key={token}
              role="option"
              aria-selected={token === selectedToken}
              onClick={() => {
                onChange(token);
                setOpen(false);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-gray-800 text-white truncate"
              title={token}
              style={{ background: "black" }}
            >
              {token}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
