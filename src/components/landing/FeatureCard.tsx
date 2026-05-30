import type { LucideIcon } from "lucide-react";

export function FeatureCard({
  icon: Icon,
  title,
  text,
  gold = false,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  gold?: boolean;
}) {
  return (
    <article className={`l-card h-full${gold ? " l-card-gold" : ""}`}>
      <span className="l-icon-tile" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="l-h3 mt-4">{title}</h3>
      <p className="l-text mt-2 text-sm">{text}</p>
    </article>
  );
}
