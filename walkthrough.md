# Admin Refactoring & Fixes

## Overview
This update restructures the admin navigation, integrates duplicate detection into relevant context pages, and fixes a critical syntax error in the batch input page.

## Changes

### Navigation & Routing
- **Renamed Menu**: "Input Massal" is changed to "Input Kajian".
- **Removed Menu**: "Deteksi Duplikat" is removed from the sidebar.
- **New Page**: Created `/admin/input/page.tsx` which serves as a selection hub for:
  - Input Manual
  - Input Massal (AI/OCR)

### Duplicate Detection
- The standalone deduplication page has been removed.
- **Integrated Logic**: Duplicate checking and merging are now built directly into:
  - `Kelola Ustadz` (/admin/ustadz)
  - `Kelola Masjid` (/admin/masjid)
- Created a reusable `DuplicateGroupList` component for consistent UI.

### Bug Fixes & Refactoring
- **Batch Input Page**: Fixed a "Parsing ecmascript source code failed" error in `src/app/admin/batch-input/page.tsx`.
- **Refactoring**: Extracted the complex AI/OCR input section into a new component `src/components/admin/AIInputSection.tsx` to improve code maintainability and prevent nesting errors.

## Usage
1. Go to **Input Kajian** to choose between manual or mass input.
2. Use **Kelola Ustadz** or **Kelola Masjid** and click the "Cek Duplikat" button to manage duplicates.
