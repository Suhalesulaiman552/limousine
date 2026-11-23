export default function DriverDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-slate-900 border border-sky-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-4">
        <h1 className="text-xl font-light tracking-wide text-cyan-400">Driver Dashboard</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Welcome to your live operational portal. Your active routes and schedules will appear here.
        </p>
        <div className="pt-4">
          <a
            href="/admin/monthly"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium text-xs px-5 py-2.5 rounded-xl transition"
          >
            Go to Monthly Client Directory
          </a>
        </div>
      </div>
    </div>
  );
}