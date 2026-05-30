"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ShieldCheck, X } from "lucide-react";
import { track } from "./analytics";
import { APP_HREF, APP_MODAL_CHECKLIST } from "./landingData";

type Variant = "primary" | "secondary" | "ghost" | "link";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "l-btn l-btn-primary",
  secondary: "l-btn l-btn-secondary",
  ghost: "l-btn l-btn-ghost",
  link: "l-applink",
};

export function AppAccessButton({
  children,
  variant = "ghost",
  className = "",
  fullWidth = false,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const openModal = useCallback(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    track("click_app_validacion_controlada");
    setOpen(true);
  }, []);

  const accept = useCallback(() => {
    track("modal_app_validation_accept");
    setOpen(false);
    router.push(APP_HREF);
  }, [router]);

  const cancel = useCallback(() => {
    track("modal_app_validation_cancel");
    setOpen(false);
  }, []);

  // Lock scroll, manage focus and keyboard while open.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    confirmRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [open, cancel]);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={`${VARIANT_CLASS[variant]}${fullWidth ? " w-full" : ""}${className ? ` ${className}` : ""}`}
      >
        {children}
      </button>

      {open ? (
        <div
          className="l-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cancel();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-access-title"
            aria-describedby="app-access-desc"
            className="l-modal"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="l-icon-tile" aria-hidden="true">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 id="app-access-title" className="l-h3">
                  Antes de abrir la aplicación
                </h2>
              </div>
              <button
                type="button"
                onClick={cancel}
                className="l-modal-close"
                aria-label="Cerrar y volver a la landing"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <p id="app-access-desc" className="l-text mt-4 text-sm">
              Estás accediendo a Anclora SyncXML en fase pre-MVP / validación
              controlada.
            </p>

            <ul className="mt-5 flex flex-col gap-3">
              {APP_MODAL_CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="l-check l-check-gold" aria-hidden="true">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="l-text text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row-reverse">
              <button
                ref={confirmRef}
                type="button"
                onClick={accept}
                className="l-btn l-btn-primary w-full sm:w-auto"
              >
                Entrar con datos sintéticos o anonimizados
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={cancel}
                className="l-btn l-btn-ghost w-full sm:w-auto"
              >
                Volver a la landing
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
