export function SectionHeading({
  title,
  subtitle,
  light,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="mb-10 text-center">
      <h2 className={`font-serif text-3xl font-bold sm:text-4xl ${light ? 'text-cream' : 'text-maroon-700'}`}>
        {title}
      </h2>
      <div className="heading-ornament" />
      {subtitle && (
        <p className={`mx-auto mt-4 max-w-2xl ${light ? 'text-cream/80' : 'text-ink/70'}`}>{subtitle}</p>
      )}
    </div>
  );
}
