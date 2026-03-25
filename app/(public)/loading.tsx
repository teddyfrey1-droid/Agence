export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="h-14 w-72 animate-pulse rounded-2xl bg-black/5" />
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-3xl border border-black/10 bg-white"
          />
        ))}
      </div>
    </div>
  );
}
