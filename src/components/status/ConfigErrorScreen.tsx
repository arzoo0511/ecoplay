type ConfigErrorScreenProps = {
  missing: string[];
};

export default function ConfigErrorScreen({
  missing,
}: ConfigErrorScreenProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-red-500/30 bg-slate-900/80 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-red-300">Configuration Error</h1>
        <p className="mt-4 text-slate-200">
          Copy .env.example to .env and fill in your Supabase credentials, then
          restart the app.
        </p>
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Missing or placeholder variables
          </h2>
          <ul className="mt-3 space-y-2">
            {missing.map((name) => (
              <li
                key={name}
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-200"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
