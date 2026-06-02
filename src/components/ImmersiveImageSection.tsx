"use client";

import { useLanguage } from "@/lib/i18n";

type ImmersiveImageSectionProps = {
  id?: string;
  image: string;
  mobileImage?: string;
  title?: string;
  subtitle?: string;
  copyKey?: "station" | "assets";
};

export function ImmersiveImageSection({
  id,
  image,
  mobileImage,
  title,
  subtitle,
  copyKey,
}: ImmersiveImageSectionProps) {
  const { t } = useLanguage();
  const localizedTitle =
    copyKey === "station"
      ? t.immersive.stationTitle
      : copyKey === "assets"
        ? t.immersive.assetsTitle
        : title;
  const localizedSubtitle =
    copyKey === "station"
      ? t.immersive.stationSubtitle
      : copyKey === "assets"
        ? t.immersive.assetsSubtitle
        : subtitle;

  return (
    <section
      id={id}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-zinc-950 px-4 py-20 text-center sm:px-8"
    >
      <picture className="absolute inset-0">
        {mobileImage && <source srcSet={mobileImage} media="(max-width: 639px)" />}
        <source srcSet={image} media="(min-width: 640px)" />
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </picture>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white min-[390px]:text-5xl sm:text-7xl lg:text-8xl">
          {localizedTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-zinc-200 sm:mt-5 sm:text-2xl sm:leading-9">
          {localizedSubtitle}
        </p>
      </div>
    </section>
  );
}
