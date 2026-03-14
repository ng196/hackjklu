export default function MainAppSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div className="space-y-2">
        <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
