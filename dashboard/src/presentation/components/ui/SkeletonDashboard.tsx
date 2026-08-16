export default function SkeletonDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded mb-2" />
      <div className="h-4 w-96 bg-slate-200 rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-xl shadow-sm" />
        ))}
      </div>
      <div className="h-80 bg-white rounded-xl shadow-sm" />
    </div>
  );
}
