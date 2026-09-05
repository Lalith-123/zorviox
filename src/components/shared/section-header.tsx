export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      {children}
    </h3>
  );
}
