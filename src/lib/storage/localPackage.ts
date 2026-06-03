import JSZip from "jszip";
import type { ParsedExcel, GeneratedXmlResult } from "../domain";
import { buildValidationReportCsv } from "../validationReport";

export async function generateLocalPackageZip(parsed: ParsedExcel, generated: GeneratedXmlResult): Promise<Blob> {
  const zip = new JSZip();
  const timestamp = new Date().toISOString();
  const reference = parsed.reservation.reference || "sin-referencia";
  
  // 1. Manifest
  const manifest = {
    generatedAt: timestamp,
    tool: "Anclora SyncXML",
    version: "v0.1-mvp",
    mode: "temporary-local-package",
    reservationReference: reference,
    files: [
      { path: "manifest.json" },
      { path: "reserva-normalizada.json" },
      { path: "huespedes.csv" },
      { path: "xml-revisable.xml" },
      { path: "informe-validacion.json" },
      { path: "informe-validacion.csv" },
      { path: "README_conservacion.txt" },
    ],
    disclaimer: "XML revisable orientado al flujo SES.HOSPEDAJES. No garantiza aceptación oficial."
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // 2. Reserva normalizada
  const normalized = {
    reservation: parsed.reservation,
    property: parsed.property,
    payment: parsed.payment,
    guestCount: parsed.guests.length,
    validationStatus: parsed.validation.status,
  };
  zip.file("reserva-normalizada.json", JSON.stringify(normalized, null, 2));

  // 3. Huespedes CSV
  const guestHeaders = ["Fila", "Nombre", "Apellido1", "Apellido2", "DocumentoTipo", "DocumentoNumero", "Nacionalidad", "FechaNacimiento"];
  const guestRows = parsed.guests.map(g => [
    g.sourceRow,
    g.firstName,
    g.surname1,
    g.surname2 || "",
    g.documentType || "",
    g.documentNumber || "",
    g.nationalityIso3 || "",
    g.birthDate || ""
  ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"));
  zip.file("huespedes.csv", `${guestHeaders.join(";")}\n${guestRows.join("\n")}\n`);

  // 4. XML revisable
  zip.file("xml-revisable.xml", generated.xml);

  // 5. Informe validación (JSON y CSV)
  zip.file("informe-validacion.json", JSON.stringify(parsed.validation, null, 2));
  zip.file("informe-validacion.csv", buildValidationReportCsv(parsed));

  // 6. README
  const readme = `ANCLORA SYNCXML - PAQUETE LOCAL DE CONSERVACIÓN
----------------------------------------------
Referencia: ${reference}
Generado el: ${timestamp}

AVISO LEGAL Y DE PRIVACIDAD:
1. Este paquete ha sido generado bajo demanda y no se conserva permanentemente en los servidores de Anclora SyncXML por defecto.
2. La responsabilidad legal de conservación de la documentación de viajeros corresponde al sujeto obligado (titular del establecimiento).
3. El archivo 'xml-revisable.xml' es una propuesta técnica orientada al flujo de SES.HOSPEDAJES y DEBE SER REVISADO por una persona antes de cualquier uso oficial.
4. Anclora SyncXML no garantiza la aceptación oficial del XML por parte de las autoridades ni ofrece asesoramiento legal.
5. Se recomienda conservar este paquete en un lugar seguro y bajo el control del titular del establecimiento.

Archivos incluidos:
- manifest.json: Metadatos y firma del paquete.
- reserva-normalizada.json: Datos de la reserva en formato estructurado.
- huespedes.csv: Listado legible de huéspedes.
- xml-revisable.xml: El XML preparado para revisión.
- informe-validacion.json/csv: Detalle de las reglas de validación aplicadas.
`;
  zip.file("README_conservacion.txt", readme);

  return await zip.generateAsync({ type: "blob" });
}
