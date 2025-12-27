# Admin Refactoring & Fixes

## Overview
This update restructures the Admin UI by moving the "Belum ada GPS" filter from the **Kelola Jadwal** page to the **Kelola Masjid** page, where it is more contextually appropriate.

## Changes

### 1. Kelola Masjid (`/admin/masjid`)
- **Added Filter**: Implemented a "Belum ada GPS" checkbox filter next to the search bar.
- **Functionality**: When checked, the list filters to show only masjids that are missing Latitude or Longitude data.
- **Counter**: The checkbox label displays a live count of masjids without GPS coordinates `(n)`.

### 2. Kelola Jadwal (`/admin/manage`)
- **Removed Filter**: Removed the "Belum ada GPS" checkbox and its associated filtering logic from this page.
- **Cleanup**: Cleaned up the state and UI code to ensure no conflicts.

## Usage
1. Go to **Kelola Masjid**.
2. Look for the "Belum ada GPS" checkbox next to the search bar.
3. Check it to view only masjids that need coordinate updates.
