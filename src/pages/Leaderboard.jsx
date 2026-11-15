export default function TeamLeaderboard({ stats }) {
  const team = stats.filter(s => s.id !== '_overall');
  const sortedTeam = [...team].sort((a, b) => (b.percent || 0) - (a.percent || 0));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Team Leaderboard</h1>
      <p className="text-sm text-slate-400">Live verified progress across all domains and team members.</p>
      
      <div className="grid gap-3">
        {sortedTeam.map((s, index) => (
          <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-mono font-bold w-6">#{index + 1}</span>
                <div>
                  <p className="font-semibold text-white">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.domain}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-cyan-300 font-bold text-base">{s.percent}%</span>
                <p className="text-xs text-slate-400">{s.done} / {s.total} tasks done</p>
              </div>
            </div>
            <div className="h-2 bg-white/10 rounded overflow-hidden mt-1">
              <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: s.percent + '%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}