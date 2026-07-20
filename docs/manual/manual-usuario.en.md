<div class="cover-page">

<div class="cover-logo"><img src="screenshots/logo-anclora-syncxml.png" alt="Anclora SyncXML" /></div>

<div class="cover-brand">Anclora SyncXML</div>

<div class="cover-title">User Manual</div>

<div class="cover-subtitle">Premium guide to operate the controlled pilot, validate bookings, prepare SES.HOSPEDAJES XML and maintain privacy controls</div>

<div class="cover-meta">
  <div class="cover-version">Version 1.1</div>
  <div class="cover-date">20 July 2026</div>
</div>

<div class="cover-disclaimer">SyncXML prepares, validates and exports structured data for the SES.HOSPEDAJES workflow. It does not replace human review, the official portal, pre-production evidence or the controller's legal judgement.</div>

</div>

<div class="page-break"></div>

## Table of contents

| No. | Section | Main control |
| --- | --- | --- |
| 01 | Product scope | Controlled pilot and prudent claims |
| 02 | Access and sessions | Approved login, temporary password and logout |
| 03 | Before importing | Minimum data and private environment |
| 04 | Document import | Confirmations and file limit |
| 05 | Guided review | Errors, warnings and corrections |
| 06 | XML and download | Blocking controls before export |
| 07 | SES and pre-check-in | Pre-production and role permissions |
| 08 | Operational dashboard | User-scoped history |
| 09 | Pilot feedback | Signals without guest data |
| 10 | Security and privacy | Daily controls |
| 11 | Common incidents | Operational response |
| 12 | Glossary | Key terms |

<div class="page-break"></div>

## 1. Product scope

![Import screen](screenshots/syncxml-en-import.png)

**Anclora SyncXML** transforms a booking Excel file into reviewable data and XML prepared for the SES.HOSPEDAJES workflow. The application is designed for controlled validation, operational error reduction and sensitive-data work under minimisation.

The current version is used in a **controlled pilot**. Access is granted after manual review and does not imply automatic approval, legal guarantee or production SES submission.

### What it supports

| Need | How SyncXML helps |
| --- | --- |
| Import bookings | Reads `.xlsx` files and detects booking, property, payment and travellers. |
| Validate data | Marks errors and warnings before XML generation. |
| Correct fields | Lets you complete mandatory SES fields from guided review. |
| Prepare XML | Generates a visual view and a technical view for review. |
| Test SES | Includes local validation and assisted pre-production actions. |
| Review history | Stores user-scoped bookings when persistence is active. |
| Collect feedback | Sends pilot feedback without asking for guest data. |

### Important limits

- It does not replace the official SES portal or services.
- It does not provide legal advice or guarantee absolute compliance.
- It must not be used with production SES without tests, credentials and operational approval.
- It does not store ID card or passport images.
- It does not auto-approve pilot requests.

---

## 2. Access and sessions

Application access is reserved for approved pilot users or authorised administrators.

### Pilot user access flow

1. Open `/login` or click **Sign in** from the landing page.
2. Enter the authorised email and password.
3. If the account uses a temporary password, define a new password before entering.
4. Check that your session email appears in the header.
5. Use **Close application** to exit; the app clears local session state and returns to login.

### Administrator access

| Area | Use |
| --- | --- |
| `/admin/login` | Hidden login for admin profiles. |
| Internal provisioning | Create or rotate pilot-user credentials. |
| SES | Submission actions are restricted by role and configuration. |

### Session controls

- Do not share pilot credentials.
- Change the temporary password on first access.
- Log out after reviewing PII.
- If the connected user is not shown in the header after login, reload the app and sign in again.

---

## 3. Before importing

Before uploading a file, confirm that the case fits the pilot.

### You need

- Booking Excel file in `.xlsx` format.
- Authorisation to process the personal data included.
- Property data and establishment code when the booking will be communicated to SES.
- Traveller data: document, birth date, nationality, address, contact and relationship.
- Internal criteria for who reviews and approves the XML.

### Pre-import controls

| Control | Expected action |
| --- | --- |
| Private environment | Use a non-shared screen and avoid exposing PII. |
| Minimum file | Upload only the Excel required for the operation. |
| Real data | In the pilot, prioritise synthetic or anonymised data unless expressly authorised. |
| Optional sample | You can request pilot access without attaching your own sample; that does not mean synthetic data is accepted by default. |
| Traceability | Define who reviews and what evidence is retained. |

---

## 4. Document import

![Import workflow in English](screenshots/syncxml-en-import.png)

Import starts the operational workflow and applies controls before reading the file.

### Steps

1. Review the informed confirmations.
2. Tick **Select all confirmations** or each checkbox individually.
3. Select the `.xlsx` file.
4. Click **Import**.

### Automatic controls

| Control | Result |
| --- | --- |
| Allowed extension | Only supported formats are accepted. |
| Maximum size | Oversized files are rejected before processing. |
| Validated payload | Parsed output is validated before continuing. |
| INE municipalities | When the database is available, municipality codes are resolved. |
| Duplicates | Suspicious records are shown for manual decision. |

If the file is invalid, empty or unreadable, the application shows an error without continuing to XML.

---

## 5. Guided review

![Imported data review](screenshots/syncxml-en-review.png)

Guided review lets you correct data before generating XML.

### Main elements

| Element | Use |
| --- | --- |
| Guest table | Review name, document, nationality, contact and status. |
| Show full data | Reveals unmasked data only in a private environment. |
| Validate data | Runs smart and implemented SES rules. |
| CSV report | Exports issues by booking and traveller. |
| Guided review | Completes mandatory fields or corrects warnings. |
| Duplicates | Lets you skip, keep or review suspicious records. |

### Validation states

| State | Meaning | Can continue? |
| --- | --- | --- |
| Valid | Field is correct or sufficient for the current flow. | Yes |
| Warning | Should be reviewed; does not always block. | Case by case |
| Error | Blocks XML, download or consolidation. | No |

### Fields that often need attention

- INE municipality code for Spanish addresses.
- Document support for NIF/NIE.
- Sex and relationship according to MIR catalogues.
- Phone or email contact.
- Second surname where applicable.
- Postal code and address.

---

## 6. XML and download

![Generated XML visual view](screenshots/syncxml-en-xml.png)

When critical errors are fixed, click **Generate XML**. The application creates a visual view and a technical view.

### Review before downloading

| Block | What to check |
| --- | --- |
| Request | Establishment code, name and address. |
| Contract | Reference, check-in, check-out, people and payment. |
| Payment | Payment type, masked IBAN and internet flag. |
| People | Included travellers, masked document and contact. |
| XML issues | Structure, namespace or required-field errors. |

### Download

The downloaded filename uses this format:

`syncxml-bookingNumber-DDMMYYHH24MISS.xml`

Download is blocked while critical issues remain. If only warnings remain, review them and keep internal evidence of the decision.

---

## 7. SES and pre-check-in

![SES and test pre-check-in panel](screenshots/syncxml-en-precheckin-panel.png)

SyncXML includes assisted SES actions. Availability depends on credentials, environment and role.

| Action | Control |
| --- | --- |
| Validate SES XML | Local validation against implemented rules. |
| Prepare simulation | Prepares a request without sending data to the Ministry. |
| Send to pre-production | Only with configured credentials and an allowed user. |
| Query lot/communication | Requires credentials and a tracking code. |
| Query catalogue | Reviews official catalogues when SES is configured. |
| Production | Blocked by default until approval and evidence exist. |

Pilot users must not submit to SES. Submission routes apply role control and fail safely when configuration does not allow the action.

### Test pre-check-in

![Public pre-check-in form](screenshots/syncxml-en-precheckin-form.png)

The pre-check-in panel generates temporary links to complete traveller data before review.

Current-mode controls:

- Temporary expiring link.
- Token stored as a hash.
- No document images.
- No complete legal registry.
- Operational status: pending, submitted, expired or revoked.
- Human review before official use.

---

## 8. Operational dashboard

![Dashboard with consolidated booking](screenshots/syncxml-en-dashboard-detail.png)

The dashboard lets you search bookings, review status and download XML when the configured storage mode allows it.

### History controls

| Control | Description |
| --- | --- |
| User isolation | Each user sees only their persisted bookings. |
| Search | Filters by reference or property. |
| Detail | Shows dates, people and detected travellers. |
| XML download | Uses the protected route for the selected booking. |
| Deletion | Deletes the booking accessible to the current user. |
| Pending session | Lets you resume an in-progress local operation. |

Dates are displayed as `DD/MM/YYYY`. If a time exists, they are displayed as `DD/MM/YYYY HH:MM:SS`.

---

## 9. Pilot feedback

The application includes feedback during use and when closing the experience.

### What to send

| Feedback type | Useful example |
| --- | --- |
| Operational friction | "Municipality correction was slow." |
| Validation quality | "The relationship warning was not clear." |
| Pilot outcome | "I generated reviewable XML with synthetic data." |
| Next need | "I need a template for my PMS." |

### What not to send

- Guest names, documents, phones or emails.
- XML with real data.
- Screenshots with visible PII.
- Secrets, credentials or tokens.

Feedback is sent to the configured Anclora team channel and does not replace formal legal or technical support.

---

## 10. Security and privacy

SyncXML handles personal information. Use these daily controls:

| Control | Reason |
| --- | --- |
| Minimise data | Reduce exposure and risk surface. |
| Mask by default | Avoid unnecessary document and contact visibility. |
| Review before export | Prevent errors before official use. |
| Do not store images | ID/passport images are outside current storage. |
| Use pre-production | Test SES before any real operation. |
| Clear temporary operations | Delete test bookings when finished. |
| Control access | Only approved users should open bookings with PII. |
| Avoid sensitive logs | Do not copy PII into incidents, chats or tickets. |

> SyncXML does not provide legal advice. The controller must approve privacy, DPA, retention and operating procedure.

---

## 11. Common incidents

| Incident | Recommended action |
| --- | --- |
| I cannot sign in | Check approved email, password and account status. |
| It asks me to change password | It is a temporary password; define a new one before continuing. |
| The Excel does not import | Check extension, size, structure and that it is not empty. |
| Municipality code is missing | Complete the INE code from guided review. |
| Critical errors remain | Fix them before generating or downloading XML. |
| SES rejects a test | Keep the response, lot/communication and review the error block. |
| I cannot see a booking | Check you signed in with the same user that consolidated it. |
| I need real data | Requires authorisation, private environment and prior operational approval. |

---

## 12. Glossary

| Term | Meaning |
| --- | --- |
| SES | Official system used for hospitality communications. |
| XML | Structured file containing booking and travellers. |
| Pre-production | Test environment before production. |
| RBAC | Role-based access control. |
| Owner | User who owns a persisted booking. |
| Hash | Technical fingerprint that identifies data without storing the original value. |
| DPA | Data processing agreement. |
| PII | Personally identifiable information. |
| INE | Spanish National Statistics Institute; source for municipality codes. |

<div class="footer-brand">Anclora SyncXML · User Manual · Version 1.1 · 20 July 2026</div>
