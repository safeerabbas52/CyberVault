export default function ResourcesSection() {
  const resources = [
    { title: 'CyberVault Security Guidelines', desc: 'Standard operating procedures for vulnerability scanning and risk assessment.', link: '#' },
    { title: 'Lab Environment Access', desc: 'Credentials, VPN configs, and connection endpoints for testing.', link: '#' },
    { title: 'Required Evidence Formats', desc: 'Examples of acceptable screenshots and proof logs for task submissions.', link: '#' }
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Resources & Documentation</h1>
      <p className="text-sm text-slate-400">Reference guides and materials for your tasks.</p>

      <div className="grid md:grid-cols-2 gap-3">
        {resources.map((res, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 hover:border-cyan-500/50 transition">
            <h3 className="font-semibold text-white">{res.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{res.desc}</p>
            <a href={res.link} className="text-xs text-cyan-300 hover:underline inline-block pt-1">Access resource →</a>
          </div>
        ))}
      </div>
    </div>
  );
}