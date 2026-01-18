
# Implementation Plan - Terminology Update "Mingguan" to "Pekanan"

## Objective
Standardize terminology by replacing "Mingguan" with "Pekanan" and "Minggu" (context dependent) with "Pekan" across the application UI, specifically for recurring event definitions.

## Changes Applied

### 1. `src/components/admin/RecurringPatternSelector.tsx`
- **Labels Updated:**
    - "Mingguan (Setiap minggu)" → "Pekanan (Setiap pekan)"
    - "Dua Mingguan (Setiap 2 minggu)" → "Dua Pekanan (Setiap 2 pekan)"
    - "2x Sebulan (Minggu 1 & 3)" → "2x Sebulan (Pekan 1 & 3)"
    - "2x Sebulan (Minggu 2 & 4)" → "2x Sebulan (Pekan 2 & 4)"
- **Dropdown Labels:**
    - "Minggu Ke-" → "Pekan Ke-"
    - "Minggu {n}" → "Pekan {n}"

### 2. `src/lib/recurring-generator.ts`
- **Helper Function `getPatternDescription`:**
    - Updated return strings to use "Pekan" instead of "Minggu" for recurrence descriptions (e.g., "Setiap pekan", "Pekan ke-1").

### 3. `src/app/admin/page.tsx`
- **Dashboard Text:**
    - Updated "Mingguan/Bulanan" → "Pekanan/Bulanan" in the Recurring Kajian card description.

## Verification
- **Code Search:** Verified that other instances of "mingguan" do not exist.
- **Context Awareness:** "Minggu" as a day name (Sunday) was preserved in `DAY_NAMES` arrays and date formatting utilities.

## Additional Update: Rename Sunday to Ahad

**Completed on:** 2026-01-20

**Changes:**
1.  **`src/lib/recurring-generator.ts`**: Updated `DAY_NAMES` array to use "Ahad" instead of "Minggu".
2.  **`src/components/admin/RecurringPatternSelector.tsx`**: Updated `DAY_NAMES` dropdown options to use "Ahad".
3.  **`src/lib/date-utils.ts`**: Confirmed `formatIndoDate` uses "Ahad". `parseIndoDate` strips "Minggu" correctly.
4.  **`src/app/api/kajian/route.ts`**: API automatically replaces "Minggu" with "Ahad" on both GET response and POST storage.
5.  **UI Components**: `KajianCard`, `KajianListWidget`, `LatestKajianWidget`, `KajianDetail` all support "Ahad" display.

**Verification:**
-   Recurring patterns now generate "Setiap Ahad".
-   Calendar view and details page will display "Ahad" for Sunday events.
