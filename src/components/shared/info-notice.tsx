export function InfoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-2 text-[12px] text-muted-foreground">
      {children}
    </div>
  );
}
