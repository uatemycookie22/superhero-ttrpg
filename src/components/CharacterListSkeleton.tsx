export default function CharacterListSkeleton() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Your Characters</h3>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="block p-4 rounded-lg border border-gray-200 dark:border-zinc-800 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-300 dark:bg-zinc-700 rounded w-32"></div>
              <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
