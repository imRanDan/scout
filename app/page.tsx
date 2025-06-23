'use client';

import { useState } from "react";

type Spot = {
  name: string;
  description: string;
  location: string;
  vibe: string;
  hours: string;
};

export default function Page() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const res = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });
    const data = await res.json();
    setResults(data.spots);
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Scout</h1>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 p-2 rounded border"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Find a chill cafe near Queen West..."
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Searching..." : "Go"}
          </button>
        </div>

        <div className="space-y-4">
          {results.map((spot, idx) => (
            <div key={idx} className="p-4 bg-white rounded shadow">
              <h2 className="text-xl font-semibold">{spot.name}</h2>
              <p className="text-gray-700">{spot.description}</p>
              <p className="text-sm text-gray-500">
                {spot.location} · {spot.vibe} · {spot.hours}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
