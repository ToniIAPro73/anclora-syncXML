# Auditoría Base: Anclora SyncXML - Piloto Controlado

Fecha: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Rama: $(git rev-parse --abbrev-ref HEAD)
Commit: $(git rev-parse --short HEAD)

## 1. Estructura actual de landing

src/components/landing/landingData.ts:export const LOGIN_HREF = "/login";
src/components/landing/LoginPageContent.tsx:import { LoginView } from "./LoginView";
src/components/landing/LoginPageContent.tsx:export function LoginPageContent() {
src/components/landing/LoginPageContent.tsx:        <LoginView />
src/components/landing/LandingHeader.tsx:          <Link href="/login" className="l-btn l-btn-ghost text-sm">
src/components/landing/LandingHeader.tsx:              <Link href="/login" className="l-btn l-btn-ghost w-full mb-2">
src/components/landing/LoginView.tsx: * Public /login view.
src/components/landing/LoginView.tsx:export function LoginView() {
src/components/landing/LoginView.tsx:        const response = await fetch("/api/auth/login", {

## 2. Componentes de landing existentes

total 172
drwxr-xr-x 2 toni toni  4096 Jun  3 05:28 .
drwxr-xr-x 5 toni toni  4096 Jun  3 06:37 ..
-rw-r--r-- 1 toni toni  2274 Jun  3 05:28 AccessSection.tsx
-rw-r--r-- 1 toni toni   827 Jun  3 05:28 AdvantagesSection.tsx
-rw-r--r-- 1 toni toni  5436 May 30 21:04 AppAccessButton.tsx
-rw-r--r-- 1 toni toni  1454 Jun  3 05:28 AppAvailableSection.tsx
-rw-r--r-- 1 toni toni  1905 Jun  3 05:28 AudienceSection.tsx
-rw-r--r-- 1 toni toni  7423 Jun  3 05:28 CookieConsent.tsx
-rw-r--r-- 1 toni toni   587 Jun  3 05:28 CookiePreferencesButton.tsx
-rw-r--r-- 1 toni toni  1218 Jun  3 05:28 CookiesPageContent.tsx
-rw-r--r-- 1 toni toni   515 May 30 21:04 FeatureCard.tsx
-rw-r--r-- 1 toni toni  1409 Jun  3 05:28 FinalCTA.tsx
-rw-r--r-- 1 toni toni   550 Jun  3 05:28 FloatingCookieButton.tsx
-rw-r--r-- 1 toni toni  3296 Jun  3 05:28 HeroSection.tsx
-rw-r--r-- 1 toni toni   750 May 30 21:04 LandingAnalytics.tsx
-rw-r--r-- 1 toni toni  1740 Jun  3 05:28 LandingExperience.tsx
-rw-r--r-- 1 toni toni  2954 Jun  3 05:28 LandingFooter.tsx
-rw-r--r-- 1 toni toni  5603 Jun  3 11:04 LandingHeader.tsx
-rw-r--r-- 1 toni toni  3477 Jun  3 05:28 LanguageToggle.tsx
-rw-r--r-- 1 toni toni   460 Jun  3 05:28 LoginPageContent.tsx
-rw-r--r-- 1 toni toni  8767 Jun  3 05:28 LoginView.tsx
-rw-r--r-- 1 toni toni  1089 Jun  3 05:28 NoPromiseSection.tsx
-rw-r--r-- 1 toni toni  1091 Jun  3 05:28 PilotPageContent.tsx
-rw-r--r-- 1 toni toni 11034 Jun  3 05:28 PilotRequestForm.tsx
-rw-r--r-- 1 toni toni  1281 Jun  3 05:28 PrivacyTrustSection.tsx
-rw-r--r-- 1 toni toni   815 Jun  3 05:28 ProblemSection.tsx
-rw-r--r-- 1 toni toni   567 May 30 21:04 SectionHeading.tsx
-rw-r--r-- 1 toni toni  2386 Jun  3 05:28 SectionNavigator.tsx
-rw-r--r-- 1 toni toni  2529 Jun  3 05:28 SolutionSection.tsx
-rw-r--r-- 1 toni toni  2022 Jun  3 05:28 StatusSection.tsx
-rw-r--r-- 1 toni toni  1301 Jun  3 05:28 WorkflowSection.tsx
-rw-r--r-- 1 toni toni   859 May 31 00:06 analytics.ts
-rw-r--r-- 1 toni toni 10740 Jun  3 05:28 landingData.ts
-rw-r--r-- 1 toni toni  2165 Jun  3 05:28 navigation.ts

## 3. Rutas API relacionadas

src/app/api/admin/ine/municipios/route.ts
src/app/api/admin/ine/municipios/sync/route.ts
src/app/api/auth/change-password/route.ts
src/app/api/auth/login/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/recover/route.ts
src/app/api/auth/session/route.ts
src/app/api/cron/sync-municipios/route.ts
src/app/api/generate/xml/route.ts
src/app/api/internal/admin-access/route.ts
src/app/api/internal/pilot-users/route.ts
src/app/api/pilot/request/route.ts
src/app/api/precheckin/[token]/route.ts
src/app/api/precheckin/test-session/route.ts
src/app/api/reservations/[id]/download/xml/route.ts
src/app/api/reservations/[id]/route.ts
src/app/api/reservations/route.ts
src/app/api/ses/anulacion-lote/route.ts
src/app/api/ses/catalogo/route.ts
src/app/api/ses/communicate/route.ts
src/app/api/ses/comunicacion/route.ts
src/app/api/ses/lote/route.ts
src/app/api/ses/status/route.ts
src/app/api/ses/submissions/route.ts
src/app/api/ses/validate/route.ts
src/app/api/upload/excel/route.ts

## 4. Tests actuales

24

## 5. Documentación existente

14

## 6. Test-data y fixtures

-rw-r--r--  1 toni toni 22594 May 26 09:18 test2-clean.xlsx
-rw-r--r--  1 toni toni 22080 May 26 09:18 test2-eu-solo.xlsx
-rw-r--r--  1 toni toni 23823 May 26 09:18 test3-clean.xlsx
-rw-r--r--  1 toni toni 23148 May 26 09:18 test3-esp-eu-noeu-mixto.xlsx
-rw-r--r--  1 toni toni 24795 May 30 21:04 test4-clean-2esp.xlsx
-rw-r--r--  1 toni toni 25898 May 30 21:04 test5-familia-mixta.xlsx
-rw-r--r--  1 toni toni 25355 May 30 21:04 test6-europeos.xlsx
-rw-r--r--  1 toni toni 25359 May 30 21:04 test7-nie-autocorrect.xlsx
-rw-r--r--  1 toni toni 25310 May 30 21:04 test8-1noche-iban.xlsx
-rw-r--r--  1 toni toni 27157 May 30 21:04 test9-grupo-grande.xlsx
