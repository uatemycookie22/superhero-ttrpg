export default function SkillsLoading() {
  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center py-2">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="bg-gray-900 p-4 min-h-[80vh]">
        <div className="flex gap-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
        <div className="flex justify-center">
          <div className="w-64 h-64 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
