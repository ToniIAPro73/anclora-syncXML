import { AppLogo } from "@/components/AppLogo";

type AncloraAuthCardProps = {
  mode: "login" | "gate" | "authenticated" | "config-error";
  title?: string;
  badge?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export function AncloraAuthCard({
  mode,
  title,
  badge = "PILOTO CONTROLADO",
  description,
  children,
  footer,
}: AncloraAuthCardProps) {
  return (
    <section className={`auth-card auth-card-${mode}`} aria-label={title ?? "Acceso a Anclora SyncXML"}>
      <header className="auth-card-header">
        <AppLogo size={50} showName={false} variant="mark" />
        <div className="auth-card-divider" aria-hidden="true" />
        <p className="auth-card-app-name">Anclora SyncXML</p>
        {badge ? <p className="auth-card-badge">{badge}</p> : null}
      </header>

      <div className="auth-card-body">
        {title ? <h1 className="auth-card-title">{title}</h1> : null}
        {description ? <p className="auth-card-description">{description}</p> : null}
        {children}
      </div>

      {footer ? <footer className="auth-card-footer">{footer}</footer> : null}
    </section>
  );
}
