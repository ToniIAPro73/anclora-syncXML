import type { Metadata } from "next";
import { LandingExperience } from "@/components/landing/LandingExperience";

const title = "Anclora SyncXML — Revisión de huéspedes desde Excel a XML revisable";
const description =
  "Herramienta ligera para revisar datos de huéspedes desde Excel/XLSX y generar XML revisable orientado al flujo SES.HOSPEDAJES, con privacidad por defecto y validación controlada.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Anclora SyncXML",
    images: [{ url: "/brand/logo-anclora-syncxml.png" }],
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function LandingPage() {
  return <LandingExperience />;
}
