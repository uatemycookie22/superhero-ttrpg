import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Welcome to Superhero TTRPG</h2>
        <p>Version: 1.0</p>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Create campaigns, build characters, and collaborate in real-time with your team.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/campaigns"
          className="p-6 rounded-lg border-2 border-gray-200 dark:border-zinc-800 hover:border-violet-500 dark:hover:border-violet-500 transition-colors"
        >
          <h3 className="text-2xl font-semibold mb-2">Campaigns</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your superhero campaigns
          </p>
        </Link>

        <div className="p-6 rounded-lg border-2 border-gray-200 dark:border-zinc-800 opacity-50">
          <h3 className="text-2xl font-semibold mb-2">Characters</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Coming soon - Create and manage characters
          </p>
        </div>
      </div>

      <div className="mt-12 p-6 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-200 dark:border-violet-900">
        <h3 className="text-xl font-semibold mb-2">Features</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Campaign management with flexible organization</li>
          <li>Custom character sheets with JSON-based attributes</li>
          <li>Real-time collaboration during game sessions (WebSocket)</li>
          <li>SQLite database with Drizzle ORM for type safety</li>
          <li>Dark mode support</li>
        </ul>
      </div>
    </div>
  );
}