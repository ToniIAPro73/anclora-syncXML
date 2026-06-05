# Quick Start Guide: Anclora SyncXML Controlled Pilot

**Version:** 1.0  
**Language:** English  
**Date:** 2026-06-05

---

## What is this?

You are in the **controlled pilot phase** of Anclora SyncXML. In this phase, you test core functionality with 100% synthetic data, with no connection to live SES.HOSPEDAJES systems.

---

## What can I test?

✅ **Allowed:**
- Import the provided synthetic Excel file
- Review and validate data in the interface
- Generate downloadable XML
- Download XML for local inspection
- Provide feedback on experience

❌ **NOT allowed:**
- Automatically submit XML to SES.HOSPEDAJES
- Use real guest or booking data
- Upload personally identifiable information (PII)
- Treat generated XML as official submission

---

## Step by step

### 1. Access the application

Open the link provided in your acceptance email:

```
https://<your-preview-or-prod-url>/app
```

The system will request confirmation of access to pre-MVP phase.

### 2. Download the synthetic file

From the "Pilot Resources" section or via email:

- File: `pilot-demo-stable.xlsx`
- Data: 1 booking, 2 guests, coherent dates, synthetic documents
- Size: ~22 KB
- Format: Excel XLSX compatible

### 3. Import the file

In the interface:

1. Click "Import file"
2. Select `pilot-demo-stable.xlsx`
3. Wait for initial validation
4. Review data in table

### 4. Review the data

The interface shows:

- **Booking:** number, dates, accommodation
- **Guests:** names, documents, contact
- **Validation:** status indicators (✓ valid, ⚠️ warning, ✗ error)
- **Errors:** detail if anything is invalid

### 5. Interpret errors (if any)

Possible errors include:

- **Format incorrect:** check the file column
- **Missing data:** some fields are required
- **Invalid value:** dates, document numbers, formats

For the provided synthetic file, you should see no critical errors.

### 6. Generate XML

1. Click "Generate XML"
2. Wait for processing (< 10 seconds)
3. XML preview opens

### 7. Download the XML

1. In the preview, click "Download"
2. Downloads as `booking-<timestamp>.xml`
3. You can inspect it locally in a text editor

---

## Required information

### ⚠️ Legal disclaimer

**During this phase, the pilot does not perform official submissions or autonomous submissions to the SES.HOSPEDAJES environment. Any technical test against SES pre-production, if applicable, will be executed only by the technical owner of Anclora SyncXML using synthetic or anonymized data.**

- No legal guarantee of compliance
- Not validated against hospitality regulations
- Generated XML is **for structure review only**, not official submission
- Anclora SyncXML is in **pre-MVP phase**

### Do not use real data

Please:
- Do not import real guest data
- Do not import actual bank information
- Do not import real documents
- Do not import real addresses or contacts

### Technical owner responsibility

If tests against SES pre-production are required:
- Only Anclora's technical owner can perform them
- Always using synthetic data
- Tests conducted in controlled environment
- **Pilot users do not have access** to that functionality

---

## Feedback

How to submit feedback?

1. **About UX/experience:** Reply to your acceptance email
2. **About errors/bugs:** Describe step-by-step what you did and what error you saw
3. **About generated XML:** Indicate if structure is clear or confusing
4. **Suggestions:** Any improvement is welcome

---

## Frequently asked questions

**Q: Can I use my own test data?**  
A: Yes, but **only synthetic data**. Do not import real information.

**Q: Why doesn't XML submit automatically?**  
A: We are in controlled pilot. The technical owner validates any official submission.

**Q: Is the XML valid for SES?**  
A: The XML follows SES structure, but is **not validated against the official API** in this phase.

**Q: Can I use this in production?**  
A: No. Wait for official launch. This is validation pilot only.

**Q: Is my data saved?**  
A: Imported data is used only in your session. Not stored on server.

---

## Next step

After testing:

1. Copy your feedback
2. Reply to the email with observations
3. Wait for next steps notification

Thank you for participating in the pilot!

---

*Anclora SyncXML — Controlled Pilot*  
*v1.0 — 2026-06-05*
