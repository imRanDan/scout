'use client';

import { useState} from 'react';
import { motion } from "framer-motion";
import Spinner from '@/components/Spinner';

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
  const [loading, setLoading] = useState(false);         // for "Go"
  const [loadingMore, setLoadingMore] = useState(false); // for "Show me more"

const fetchSpots = async (append = false) => {
  if (!input) return;

  if (append) {
    setLoadingMore(true);
  } else {
    setLoading(true);
  }

  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: input }),
  });

  const data = await res.json();

  if (!data?.spots) {
    setLoading(false);
    setLoadingMore(false);
    return;
  }

  setResults((prev) => {
    if (!append) return data.spots;

    const existingNames = new Set(prev.map((s) => s.name));
    const newUnique = data.spots.filter((s: Spot) => !existingNames.has(s.name));
    return [...prev, ...newUnique];
  });

  setLoading(false);
  setLoadingMore(false);
};

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl text-gray-900 font-bold mb-2">Scout</h1>
        <p className="text-sm text-gray-600 mb-4">
          Scout helps you find cafés, restaurants, and venues to host at around Toronto. Just tell it what you are looking for. 
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
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center justify-center"
        >
          {loading ? <Spinner /> : <span>Go</span>}
        </button>
        </div>

        <div className="space-y-4">
          {results.map((spot, index) => (
            
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-lg p-4 bg-white shadow"
            >
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
           </motion.div>
          ))}
        </div>

        {results.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={() => fetchSpots(true)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded flex items-center justify-center"
              disabled={loadingMore}
            >
              {loadingMore ? <Spinner /> : '🔁 Show me more'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
