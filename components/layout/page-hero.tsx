import Image from "next/image";

export function PageHero({
  title,
  description,
  image
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[#1B5E20] py-20 text-white">
      <Image src={image} alt="" fill priority className="object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1B5E20]/90 via-[#1B5E20]/70 to-transparent" />
      <div className="container-page relative z-10 max-w-3xl">
        <h1 className="text-3xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-4 text-base leading-8 text-white/85 sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
