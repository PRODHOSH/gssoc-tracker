import React from 'react';

interface RankProps {
  rank: number;
  points: number;
}

export default function GlobalRankBox({ rank, points }: RankProps) {
  return (
    <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl shadow-sm text-white">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Global Rank</h3>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-indigo-400">#{rank}</span>
      </div>
      <p className="text-xs text-slate-400 mt-2">Total Points: <span className="text-white font-medium">{points}</span></p>
    </div>
  );
}
