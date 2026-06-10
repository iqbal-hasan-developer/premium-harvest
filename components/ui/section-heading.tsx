export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold text-[#2E7D32]">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-bold tracking-normal text-[#17351a] sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-7 text-neutral-600 sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}
