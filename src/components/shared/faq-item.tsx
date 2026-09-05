export function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div>
      <h3 className="mb-1 text-[14px] font-medium text-foreground">{question}</h3>
      <p className="text-[13px] leading-relaxed text-muted-foreground">{answer}</p>
    </div>
  );
}
