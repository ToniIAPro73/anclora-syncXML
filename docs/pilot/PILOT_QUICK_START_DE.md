# Schnellstartanleitung: Anclora SyncXML Kontrollierter Pilot

**Version:** 1.0  
**Sprache:** Deutsch  
**Datum:** 2026-06-05

---

## Was ist das?

Sie befinden sich in der **kontrollierten Pilotphase** von Anclora SyncXML. In dieser Phase testen Sie die Kernfunktionalität mit 100% synthetischen Daten, ohne Verbindung zu Live-SES.HOSPEDAJES-Systemen.

---

## Was kann ich testen?

✅ **Erlaubt:**
- Die bereitgestellte synthetische Excel-Datei importieren
- Daten in der Oberfläche überprüfen und validieren
- Herunterladbare XML generieren
- XML lokal zur Überprüfung herunterladen
- Feedback zur Erfahrung geben

❌ **NICHT erlaubt:**
- XML automatisch an SES.HOSPEDAJES übermitteln
- Echte Gast- oder Buchungsdaten verwenden
- Persönlich identifizierbare Informationen (PII) hochladen
- Generierte XML als offizielle Übermittlung betrachten

---

## Schritt für Schritt

### 1. Zugriff auf die Anwendung

Öffnen Sie den in Ihrer Akzeptanz-E-Mail angegebenen Link:

```
https://<your-preview-or-prod-url>/app
```

Das System fordert Bestätigung für den Zugriff auf die Pre-MVP-Phase.

### 2. Synthetische Datei herunterladen

Aus dem Bereich „Pilot-Ressourcen" oder über E-Mail:

- Datei: `pilot-demo-stable.xlsx`
- Daten: 1 Buchung, 2 Gäste, zusammenhängende Daten, synthetische Dokumente
- Größe: ~22 KB
- Format: Excel XLSX kompatibel

### 3. Datei importieren

In der Benutzeroberfläche:

1. Klicken Sie auf „Datei importieren"
2. Wählen Sie `pilot-demo-stable.xlsx`
3. Warten Sie auf Erstvalidierung
4. Überprüfen Sie Daten in der Tabelle

### 4. Daten überprüfen

Die Schnittstelle zeigt:

- **Buchung:** Nummer, Daten, Unterkunft
- **Gäste:** Namen, Dokumente, Kontakt
- **Validierung:** Status-Indikatoren (✓ gültig, ⚠️ Warnung, ✗ Fehler)
- **Fehler:** Details, falls etwas ungültig ist

### 5. Fehler interpretieren (falls vorhanden)

Mögliche Fehler sind:

- **Format falsch:** Überprüfen Sie die Datei-Spalte
- **Daten fehlen:** Einige Felder sind erforderlich
- **Ungültige Werte:** Daten, Dokumentnummern, Formate

Bei der bereitgestellten synthetischen Datei sollte es keine kritischen Fehler geben.

### 6. XML generieren

1. Klicken Sie auf „XML generieren"
2. Warten Sie auf Verarbeitung (< 10 Sekunden)
3. XML-Vorschau wird geöffnet

### 7. XML herunterladen

1. Klicken Sie in der Vorschau auf „Herunterladen"
2. Download als `booking-<timestamp>.xml`
3. Sie können es lokal in einem Text-Editor überprüfen

---

## Erforderliche Informationen

### ⚠️ Rechtlicher Haftungsausschluss

**In dieser Phase führt der Pilot keine offiziellen oder eigenständigen Übermittlungen an die SES.HOSPEDAJES-Umgebung durch. Technische Tests gegen die SES-Vorproduktionsumgebung werden, falls erforderlich, ausschließlich vom technischen Verantwortlichen von Anclora SyncXML mit synthetischen oder anonymisierten Daten durchgeführt.**

- Keine rechtliche Garantie der Compliance
- Nicht gegen Beherbergungsvorschriften validiert
- Generierte XML dient **nur zur Strukturprüfung**, nicht zur offiziellen Übermittlung
- Anclora SyncXML befindet sich in der **Pre-MVP-Phase**

### Verwenden Sie keine echten Daten

Bitte:
- Importieren Sie keine echten Gästendaten
- Importieren Sie keine echten Bankdaten
- Importieren Sie keine echten Dokumente
- Importieren Sie keine echten Adressen oder Kontakte

### Verantwortung des technischen Eigentümers

Falls Tests gegen SES-Vorproduktion erforderlich sind:
- Nur Ancloras technischer Eigentümer kann sie durchführen
- Immer mit synthetischen Daten
- Tests in kontrollierter Umgebung
- **Pilot-Benutzer haben keinen Zugriff** auf diese Funktionalität

---

## Feedback

Wie geben Sie Feedback?

1. **Über UX/Erfahrung:** Antworten Sie auf Ihre Akzeptanz-E-Mail
2. **Über Fehler/Bugs:** Beschreiben Sie Schritt für Schritt, was Sie getan haben und welcher Fehler auftrat
3. **Über generierte XML:** Geben Sie an, ob die Struktur klar oder verwirrend ist
4. **Vorschläge:** Jede Verbesserung ist willkommen

---

## Häufig gestellte Fragen

**F: Kann ich meine eigenen Testdaten verwenden?**  
A: Ja, aber **nur synthetische Daten**. Importieren Sie keine echten Informationen.

**F: Warum wird XML nicht automatisch eingereicht?**  
A: Wir befinden uns in einem kontrollierten Pilotprogramm. Der technische Eigentümer validiert jede offizielle Übermittlung.

**F: Ist die XML für SES gültig?**  
A: Die XML folgt der SES-Struktur, wird aber in dieser Phase **nicht gegen die offizielle API validiert**.

**F: Kann ich dies in der Produktion verwenden?**  
A: Nein. Warten Sie auf den offiziellen Start. Dies ist nur ein Validierungspilot.

**F: Werden meine Daten gespeichert?**  
A: Importierte Daten werden nur in Ihrer Sitzung verwendet. Nicht auf dem Server gespeichert.

---

## Nächster Schritt

Nach dem Testen:

1. Kopieren Sie Ihr Feedback
2. Antworten Sie auf die E-Mail mit Beobachtungen
3. Warten Sie auf Benachrichtigung der nächsten Schritte

Vielen Dank für die Teilnahme am Pilotprogramm!

---

*Anclora SyncXML — Kontrollierter Pilot*  
*v1.0 — 2026-06-05*
