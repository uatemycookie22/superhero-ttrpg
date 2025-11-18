export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-12">
        <div className="text-8xl mb-6">🚧</div>
        <h2 className="text-5xl font-bold mb-4">Under Construction</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Check back soon 😉
        </p>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-300 dark:border-zinc-700">
        <h3 className="text-2xl font-semibold mb-6">Credits</h3>
        <div className="space-y-3 text-lg">
          <p>
            <span className="font-semibold">Creator:</span> Rashard Green
          </p>
          <p>
            <span className="font-semibold">Web Developer:</span> Lysander Hernandez
          </p>
        </div>
      </div>
    </div>
  );
}