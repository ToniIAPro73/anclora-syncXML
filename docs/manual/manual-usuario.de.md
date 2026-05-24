<div class="cover-page">

<div class="cover-logo"><img src="screenshots/logo-anclora-syncxml.png" alt="Anclora SyncXML" /></div>

<div class="cover-brand">Anclora SyncXML</div>

<div class="cover-title">Benutzerhandbuch</div>

<div class="cover-subtitle">Praxisleitfaden zum Importieren von Buchungen, Pruefen von Gaestedaten, Erzeugen von XML und Vorbereiten von SES-Tests</div>

<div class="cover-meta">
  <div class="cover-version">Version 1.0</div>
  <div class="cover-date">24. Mai 2026</div>
</div>

<div class="cover-disclaimer">SyncXML bereitet strukturierte Daten fuer den SES.HOSPEDAJES-Ablauf vor, validiert und exportiert sie. Es ersetzt weder die menschliche Pruefung noch die rechtliche Bewertung des Verantwortlichen.</div>

</div>

<div class="page-break"></div>

## Inhaltsverzeichnis

| Nr. | Abschnitt | Seite |
| --- | --- | ---: |
| 01 | Was ist Anclora SyncXML | 3 |
| 02 | Vor dem Start | 5 |
| 03 | Dokumentenablauf | 6 |
| 04 | Pruefung und intelligente Validierung | 9 |
| 05 | XML-Erzeugung, Pruefung und Download | 12 |
| 06 | SES-Dienste und Test-Pre-Check-in | 15 |
| 07 | Dashboard und operativer Verlauf | 18 |
| 08 | Datenschutz, Sicherheit und gute Praxis | 21 |
| 09 | Haeufige Fragen | 23 |
| 10 | Kurzglossar | 25 |

<div class="page-break"></div>

## 1. Was ist Anclora SyncXML

![Importbildschirm](screenshots/syncxml-de-import.png)

**Anclora SyncXML** ist eine Premium-Anwendung, die eine Buchungs-Excel-Datei in eine pruefbare, validierte XML-Datei fuer den operativen SES.HOSPEDAJES-Ablauf umwandelt.

Die Anwendung ist fuer sensible Gaestedaten ausgelegt und folgt einem Minimierungsansatz: zuerst pruefen, dann korrigieren und erst danach XML erzeugen oder herunterladen.

### Wofuer es gedacht ist

| Bedarf | Wie SyncXML hilft |
| --- | --- |
| Buchungen importieren | Liest die Excel-Datei und erkennt Buchung, Unterkunft, Zahlung und Reisende. |
| Daten validieren | Markiert Fehler und Hinweise vor der XML-Erzeugung. |
| Felder korrigieren | Ermoeglicht das Ergaenzen von SES-Pflichtfeldern in einer gefuehrten Pruefung. |
| XML erzeugen | Erstellt eine XML-Datei pro Buchung mit normalisiertem Dateinamen und Zeitstempel. |
| Vor dem Senden pruefen | Zeigt eine visuelle Ansicht und das technische XML. |
| SES vorbereiten | Enthalt lokale Validierung, Simulation und Vorproduktionskontrollen. |
| Pre-Check-in testen | Erstellt temporaere Testlinks zur Ergaenzung von Reisedaten. |

### Was es nicht tut

- Es ersetzt nicht das offizielle SES-Portal oder die offiziellen Dienste.
- Es sollte nicht als vollstaendiges gesetzliches Register genutzt werden, wenn SES die fuehrende Quelle ist.
- Es speichert keine Bilder von Ausweis oder Reisepass.
- Es sendet nicht an Produktion ohne Konfiguration und Nachweis von Vorproduktionstests.

---

## 2. Vor dem Start

Vor der Nutzung von SyncXML sollte der operative Umfang klar sein.

### Sie benoetigen

- Buchungs-Excel im Format `.xlsx`.
- Berechtigung zur Verarbeitung der im Dokument enthaltenen personenbezogenen Daten.
- Unterkunftsdaten und Betriebs-/Einrichtungscode, wenn die Buchung an SES kommuniziert wird.
- Vollstaendige Reisedaten: Dokument, Geburtsdatum, Nationalitaet, Adresse, Kontakt und Beziehung.
- Interne Vorgaben, wer das XML vor offizieller Nutzung prueft und freigibt.

### Empfehlungen

| Punkt | Empfehlung |
| --- | --- |
| Umgebung | Arbeiten Sie auf einem privaten Bildschirm und vermeiden Sie unnoetige personenbezogene Daten. |
| Datei | Laden Sie nur die fuer den Vorgang benoetigte Excel-Datei hoch. |
| Pruefung | Laden Sie nicht herunter und konsolidieren Sie nicht, solange kritische Fehler bestehen. |
| SES | Nutzen Sie zuerst Vorproduktion und bewahren Sie Annahme-/Ablehnungsnachweise auf. |
| Pre-Check-in | Verwenden Sie in Tests temporaere Links und vermeiden Sie echte Daten ohne Freigabe. |

---

## 3. Dokumentenablauf

![Importablauf auf Deutsch](screenshots/syncxml-de-import.png)

Der Hauptablauf hat vier sichtbare Phasen:

| Phase | Ziel |
| --- | --- |
| Excel importieren | Datei auswaehlen und informierte Bestaetigungen akzeptieren. |
| Daten pruefen | Reisende, Buchung, Vertrag und Validierungen pruefen. |
| XML erzeugen | XML erstellen und visuell pruefen. |
| Konsolidieren | Vorgang im konfigurierten Modus speichern und spaeteren Download erlauben. |

Die **Operationstraceability** zeigt Import, Validierung, Vorschau, Mapping, Duplikate, XML und Konsolidierung, ohne vollstaendige personenbezogene Daten offenzulegen.

### Excel importieren

1. Lesen Sie die informierten Bestaetigungen.
2. Aktivieren Sie **Alle Bestaetigungen auswaehlen** oder jede Checkbox einzeln.
3. Waehlen Sie die `.xlsx`-Datei.
4. Klicken Sie auf **Importieren**.

Ist die Datei ungueltig, leer, zu gross oder nicht lesbar, zeigt die Anwendung vor dem Fortfahren eine Fehlermeldung.

---

## 4. Pruefung und intelligente Validierung

![Pruefung importierter Daten](screenshots/syncxml-de-review.png)

In der Pruefphase sehen Sie, was die Anwendung erkannt hat, bevor ein XML erzeugt wird.

### Hauptelemente

| Element | Verwendung |
| --- | --- |
| Gaestetabelle | Name, Dokument, Nationalitaet, Kontakt und Validierungsstatus pruefen. |
| Vollstaendige Daten anzeigen | Zeigt unmaskierte Daten nur in einer privaten Umgebung. |
| Daten validieren | Fuehrt die intelligente Validierung aus. |
| CSV-Bericht | Laedt einen Bericht mit Vorfaellen und Status je Buchung und Reisendem herunter. |
| Gefuehrte Pruefung | Ergaenzt SES-Pflichtfelder oder korrigiert Hinweise. |
| Duplikate | Entscheiden, ob verdaechtige Datensaetze uebersprungen, behalten oder manuell geprueft werden. |

### Validierungsfarben

| Status | Bedeutung |
| --- | --- |
| Gueltig | Feld ist korrekt oder fuer den aktuellen Ablauf ausreichend. |
| Hinweis | Sollte geprueft werden, blockiert aber nicht immer XML. |
| Fehler | Blockiert Erzeugung, Download oder Konsolidierung bis zur Korrektur. |

### Felder, die oft geprueft werden muessen

- INE-Gemeindecode fuer Adressen in Spanien.
- Dokumenttraeger fuer NIF/NIE.
- Geschlecht und Beziehung.
- Telefon oder E-Mail.
- Zweiter Nachname, falls erforderlich.
- Postleitzahl und Adresse.

---

## 5. XML-Erzeugung, Pruefung und Download

![Visuelle Ansicht des erzeugten XML](screenshots/syncxml-de-xml.png)

Wenn kritische Fehler korrigiert sind, klicken Sie auf **XML erzeugen**. Die Anwendung erstellt eine visuelle und eine technische Ansicht.

### Visuelle Ansicht

Die visuelle Ansicht ordnet das XML in Bloecke:

| Block | Inhalt |
| --- | --- |
| Anfrage | Einrichtungscode, Name und Adresse. |
| Vertrag | Referenz, Anreise, Abreise, Personen und Zahlung. |
| Zahlung | Zahlungsart, maskierte IBAN und Internetangabe. |
| Personen | Enthaltene Reisende, maskiertes Dokument und Kontakt. |

### XML-Ansicht

Die XML-Ansicht zeigt den technischen Inhalt, der heruntergeladen wird. Dieser muss vor offizieller Nutzung geprueft werden.

### XML-Download

Der Dateiname verwendet folgendes Format:

`syncxml-buchungsnummer-DDMMJJHH24MISS.xml`

Der Download ist blockiert, solange kritische XML-Vorfaelle bestehen.

---

## 6. SES-Dienste und Test-Pre-Check-in

![SES- und Test-Pre-Check-in-Panel](screenshots/syncxml-de-precheckin-panel.png)

SyncXML enthaelt ein assistiertes SES-Panel:

| Aktion | Beschreibung |
| --- | --- |
| SES-XML validieren | Fuehrt lokale Validierung gegen implementierte SES-Regeln aus. |
| Simulation vorbereiten | Bereitet eine Anfrage vor, ohne Daten an das Ministerium zu senden. |
| An Vorproduktion senden | Nur verfuegbar, wenn Zugangsdaten konfiguriert sind. |
| Los/Mitteilung abfragen | Erfordert Vorproduktions-Zugangsdaten. |
| Katalog abfragen | Erlaubt die Pruefung offizieller Kataloge, wenn SES konfiguriert ist. |

Produktion bleibt gesperrt, bis kontrollierte Tests abgeschlossen sind.

### Test-Pre-Check-in

![Oeffentliches Pre-Check-in-Formular](screenshots/syncxml-de-precheckin-form.png)

Das Test-Pre-Check-in-Panel erstellt einen temporaeren Link, um Reisedaten vor der Pruefung zu ergaenzen.

In diesem Modus:

- Der Link ist temporaer.
- Es werden keine Dokumentbilder gespeichert.
- Es wird kein vollstaendiges gesetzliches Register erstellt.
- Es werden nur operative Metadaten gespeichert: Token, Referenz, Status, Hash und Zeiten.
- SES bleibt die offizielle Quelle, wenn die reale Kommunikation erfolgt.

---

## 7. Dashboard und operativer Verlauf

![Dashboard mit konsolidierter Buchung](screenshots/syncxml-de-dashboard-detail.png)

Das Dashboard ermoeglicht die Suche nach Buchungen, Statuspruefung und erneuten XML-Download, sofern der konfigurierte Speichermodus dies erlaubt.

### Hauptkarten

| Karte | Information |
| --- | --- |
| Buchungsliste | Referenz, Unterkunft und Status. |
| Detail | Anreise, Abreise, Personen und erkannte Reisende. |
| Aktionen | XML herunterladen oder Buchung loeschen. |
| Produktklassifizierung | Erinnerung an Umfang und Nutzungsgrenzen. |

### Datumsformat

Daten werden als `TT/MM/JJJJ` angezeigt. Wenn eine Uhrzeit vorhanden ist, als `TT/MM/JJJJ HH:MM:SS`.

---

## 8. Datenschutz, Sicherheit und gute Praxis

SyncXML verarbeitet personenbezogene Informationen. Nutzen Sie diese Regeln:

| Regel | Grund |
| --- | --- |
| Daten minimieren | Nur hochladen, was fuer die Kommunikation erforderlich ist. |
| Vor Export pruefen | Fehler vor offizieller Nutzung vermeiden. |
| Keine Bilder speichern | Ausweis-/Passbilder duerfen nicht in SyncXML gespeichert werden. |
| Vorproduktion nutzen | SES vor echten Vorgaengen testen. |
| Temporaere Vorgaenge loeschen | Nach Abschluss der Pruefung den Loeschbutton nutzen. |
| Zugriff kontrollieren | Nur autorisierte Nutzer sollen Buchungen mit PII oeffnen. |

> SyncXML bietet keine Rechtsberatung. Der Verantwortliche muss Datenschutz, DPA, Aufbewahrung und Betriebsverfahren freigeben.

---

## 9. Haeufige Fragen

### Kann ich XML mit Fehlern erzeugen?

Nein. Kritische Fehler blockieren Erzeugung, Download oder Konsolidierung, bis sie korrigiert sind.

### Was passiert, wenn der Gemeindecode fehlt?

Fuer spanische Adressen verlangt SES den INE-Gemeindecode. Die gefuehrte Pruefung ermoeglicht die Ergaenzung.

### Kann ich aus der Anwendung an SES senden?

In Vorproduktion, sobald Zugangsdaten und Konfiguration vorhanden sind. Produktion bleibt standardmaessig gesperrt.

### Ist Pre-Check-in produktionsbereit?

Nein. Es ist im Testmodus implementiert, um den Ablauf vor echten Daten oder Persistenz zu validieren.

### Werden gescannte Dokumente gespeichert?

Nein. Die aktuelle Richtlinie blockiert Bilder von Ausweis und Reisepass.

---

## 10. Kurzglossar

| Begriff | Bedeutung |
| --- | --- |
| SES | Offizielles System fuer Beherbergungsmitteilungen. |
| XML | Strukturierte Datei mit Buchungs- und Reisedaten. |
| Vorproduktion | Testumgebung vor Produktion. |
| Hash | Technischer Fingerabdruck zur Identifikation ohne Speicherung des gesamten Inhalts. |
| DPA | Vertrag zur Auftragsverarbeitung. |
| PII | Personenbezogene identifizierbare Informationen. |
| INE | Spanisches Statistikamt; Quelle fuer Gemeindecodes. |

<div class="footer-brand">Anclora SyncXML · Benutzerhandbuch · Version 1.0</div>
