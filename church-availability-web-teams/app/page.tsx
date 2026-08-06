export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-moss-400 mb-2">Service Team</p>
        <h1 className="font-display text-4xl text-moss-900 mb-6">Church Availability</h1>
        <p className="text-moss-600 mb-8">
          Already have a team? Use the link your coordinator shared with you.
        </p>
        <a
          href="/new-team"
          className="inline-block bg-moss-600 text-parchment rounded-lg px-5 py-3 font-medium hover:bg-moss-900 transition-colors"
        >
          Start a new team
        </a>
      </div>
    </main>
  );
}
