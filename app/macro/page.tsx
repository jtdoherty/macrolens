export default function MacroPage() {
  return (
    <>
      <div className="ph"><div className="ph-inner"><h1>Macro Dashboard</h1><p>FRED indicators, regime signals, and macro environment overview</p></div></div>
      <div className="pb"><Stub name="Macro Dashboard" /></div>
    </>
  );
}

function Stub({ name }: { name: string }) {
  return (
    <div className="empty">
      <div className="eicon">🚧</div>
      <div className="etitle">{name} — coming next</div>
      <div className="esub">Phase 1 step in progress. See <code>docs/PLAN.md</code>.</div>
    </div>
  );
}
