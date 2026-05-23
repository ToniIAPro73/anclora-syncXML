"use client";

import { ShieldAlert } from "lucide-react";
import { usePreferences } from "./AppPreferencesProvider";

export function ProductClassification() {
  const { dictionary: t } = usePreferences();
  return (
    <section className="panel p-6">
      <div className="flex items-start gap-4">
        <div className="icon-tile"><ShieldAlert className="h-5 w-5" /></div>
        <div>
          <h1 className="font-heading text-2xl font-black">{t.classification}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">{t.classificationCopy}</p>
        </div>
      </div>
      <dl className="mt-6 grid gap-3 md:grid-cols-2">
        {[
          [t.product, t.appName],
          [t.productFamily, t.premium],
          [t.productVertical, t.hospitalityVertical],
          [t.productState, t.controlledValidation],
          [t.productRisk, t.highRisk],
          [t.intendedUse, t.intendedUseText],
          [t.unintendedUse, t.unintendedUseText],
        ].map(([label, value]) => (
          <div key={label} className="metric-card">
            <dt className="text-xs font-bold uppercase text-muted">{label}</dt>
            <dd className="mt-2 text-sm font-semibold text-secondary">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
