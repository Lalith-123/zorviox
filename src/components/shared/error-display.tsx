export function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
      {error}
    </div>
  );
}
