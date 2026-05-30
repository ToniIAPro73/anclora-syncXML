type AppLogoProps = {
  size?: number;
  showName?: boolean;
  variant?: "mark" | "lockup";
  withContainer?: boolean;
  className?: string;
};

export function AppLogo({
  size = 45,
  showName = true,
  variant = "lockup",
  withContainer = false,
  className = "",
}: AppLogoProps) {
  const mark = (
    <img
      className="app-logo-mark"
      src="/brand/logo-anclora-syncxml.png"
      alt=""
      aria-hidden="true"
      style={{ width: size, height: size }}
    />
  );

  if (variant === "mark" || !showName) {
    return withContainer ? <span className={`icon-tile ${className}`}>{mark}</span> : mark;
  }

  return (
    <div className={`flex items-center gap-3 font-heading text-lg font-bold text-premium ${className}`}>
      {withContainer ? <span className="icon-tile">{mark}</span> : mark}
      <span>Anclora SyncXML</span>
    </div>
  );
}
