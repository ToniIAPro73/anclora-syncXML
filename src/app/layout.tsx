import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { AppPreferencesProvider } from "@/components/AppPreferencesProvider";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "Anclora SyncXML",
  description: "Excel seguro de reservas a XML de hospedaje por reserva.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = localStorage.getItem('anclora-syncxml-theme') || 'dark';
                  var params = new URLSearchParams(window.location.search);
                  var rawLanguage = params.get('lang') || params.get('locale') || localStorage.getItem('anclora-syncxml-language') || ((navigator.languages && navigator.languages[0]) || navigator.language || 'es');
                  var language = String(rawLanguage).toLowerCase().split(/[-_]/)[0];
                  if (language !== 'en' && language !== 'de') language = 'es';
                  var resolved = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : theme;
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.lang = language;
                  document.cookie = 'anclora-syncxml-theme=' + theme + '; path=/; max-age=31536000; SameSite=Lax';
                  document.cookie = 'anclora-syncxml-language=' + language + '; path=/; max-age=31536000; SameSite=Lax';
                  document.documentElement.classList.toggle('light', resolved === 'light');
                  document.documentElement.classList.toggle('dark', resolved !== 'light');
                } catch (error) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${sora.variable}`}>
        <AppPreferencesProvider>
          <AppShell>{children}</AppShell>
        </AppPreferencesProvider>
      </body>
    </html>
  );
}
