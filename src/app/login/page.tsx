import type { Metadata } from "next";
import { LoginPageContent } from "@/components/landing/LoginPageContent";

export const metadata: Metadata = {
  title: "Iniciar sesión — Anclora SyncXML",
  description:
    "Acceso autorizado a Anclora SyncXML en validación controlada. La participación en el piloto se concede tras revisión manual de la solicitud.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginPageContent />;
}
