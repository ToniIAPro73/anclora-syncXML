import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
}) {
  const isCenter = align === "center";
  return (
    <div className={isCenter ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}>
      {eyebrow ? <span className="l-eyebrow">{eyebrow}</span> : null}
      <h2 className={`l-h2${eyebrow ? " mt-3" : ""}`}>{title}</h2>
      {intro ? <p className="l-lead mt-4">{intro}</p> : null}
    </div>
  );
}
