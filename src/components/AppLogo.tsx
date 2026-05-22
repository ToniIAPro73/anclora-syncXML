import { FileCode2 } from "lucide-react";

export function AppLogo() {
  return (
    <div className="flex items-center gap-3 font-heading text-lg font-bold text-premium">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/35 bg-accent/10 text-accent">
        <FileCode2 className="h-5 w-5" />
      </span>
      <span>Anclora SyncXML</span>
    </div>
  );
}
