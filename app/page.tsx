'use client';

import { useState} from 'react';

type Spot = {
  name: string;
  description: string;
  location: string;
  vibe: string;
  hours: string;
};

export default function Page() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSpots = async (append = false) => {
    if (!input) return;
    setLoading(true);
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await res.json();

    if (!data?.spots) {
      setLoading(false);
      return;
    }

    setResults((prev) => {
      if (!append) return data.spots;

      const existingNames = new Set(prev.map((s) => s.name));
      const newUnique = data.spots.filter((s: Spot) => !existingNames.has(s.name));

      return [...prev, ...newUnique];
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Scout</h1>
        <p className="text-sm text-gray-600 mb-4">
          Scout helps you find cafés, restaurants, and venues around Toronto. Just tell it what you're looking for. 
        </p>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            className="flex-1 p-2 rounded border"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Find a cozy café near Queen West..."
          />
          <button
            onClick={() => fetchSpots()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? 'Searching...' : 'Go'}
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
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  spot.name + ' ' + spot.location + ', Toronto'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm underline mt-1 inline-block"
              >
                🗺 View on Google Maps
              </a>
            </div>
          ))}
        </div>

        {results.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={() => fetchSpots(true)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded"
              disabled={loading}
            >
              {loading ? 'Loading more...' : '🔁 Show me more'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
