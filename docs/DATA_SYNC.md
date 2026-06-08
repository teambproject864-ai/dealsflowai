# Data storage and sync

DealFlow.AI stores operational data in **Firebase Firestore** (leads, calls, analyses, transcripts, audit logs).

## Removed: Google Sheets sync

Google Sheets integration has been **fully removed** from the application. The following are no longer used:

- `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB`, `GOOGLE_SHEET_MODE`, and related environment variables
- `lib/sheets.ts` and `lib/google-sheet-id.ts`
- `/api/sync/metrics`
- Inline sync calls on lead save, analysis, and post-call notifications

Calendar and Google Meet continue to use the Google APIs via the service account (`lib/google-meet.ts`, `lib/calendar-events.ts`). That is separate from spreadsheet sync.

## Post-booking confirmation

After a successful **scheduled** meeting booking, the system triggers an automated **Twilio voice confirmation** call (see `lib/voice-confirmation.ts` and `voice-call-alerts` feature). Configure Twilio credentials in `.env` as documented in `.env.example`.
