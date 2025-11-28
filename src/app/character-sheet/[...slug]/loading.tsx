export default function CharacterSheetLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded col-span-2" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded col-span-2" />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  );
}
