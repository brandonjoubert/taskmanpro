# Play Store Data Safety — Declarations

These are the responses to enter in the Google Play Console "Data safety" form
for TaskMan Pro (Android). The app is fully offline and stores data only on
the device.

## Data collection and security

- **Does your app collect or share any of the required user data types?**
  No.

- **Does your app collect any user data at all?**
  No. TaskMan Pro stores task data (titles, notes, dates, priority scores)
  only in the device-local database. This is user-created content that never
  leaves the device, which does not require a data-safety declaration under
  Google's policy for offline, device-only storage.

## Data types (all "Not collected")

- Location: Not collected
- Personal info (name, email, phone, etc.): Not collected
- Financial info: Not collected
- Health and fitness: Not collected
- Messages: Not collected
- Photos and videos: Not collected
- Audio files: Not collected
- Files and docs: Not collected
- Calendar: Not collected
- Contacts: Not collected
- App activity: Not collected
- App info and performance: Not collected
- Device or other IDs: Not collected

## Notes for review

- The app requires no permissions in its manifest beyond the default.
- The app performs no network operations.
- The app contains no ads and no analytics/telemetry SDKs.

## Play Console checklist (for the developer to complete)

- [ ] Upload signed release AAB (`app-release.aab`).
- [ ] Confirm app content rating questionnaire.
- [ ] Set target audience (general; TaskMan Pro is not designed for children).
- [ ] Provide this privacy policy URL on the store listing.
- [ ] Complete the Data safety form using the declarations above.
- [ ] Confirm the app's declared permissions list is empty.
