import db from '@/lib/db';
import HomeContent from '@/components/HomeContent';

// Enable ISR with 60 second revalidation
export const revalidate = 60;

const DEFAULT_LAYOUT = {
  sidebar: ['SidebarBrandWidget', 'SidebarMenuWidget', 'OngoingWidget', 'LatestKajianWidget', 'PrayerTimesWidget', 'ContactWidget'],
  main: ['HeroWidget', 'QuickMenuWidget', 'KajianListWidget'],
  mobile: ['HeroWidget:mobile', 'QuickMenuWidget:mobile', 'OngoingWidget:mobile', 'LatestKajianWidget:mobile', 'KajianListWidget:mobile'],
  hidden: [],
  hidden_mobile: ['SidebarMenuWidget:mobile', 'PrayerTimesWidget:mobile', 'ContactWidget:mobile'],
  hidden_menu: []
};

export default async function BerandaPage() {
  // Fetch Layout
  let layout = DEFAULT_LAYOUT;
  try {
    const layoutRes = await db.execute("SELECT value FROM settings WHERE key = 'homepage_layout'");
    console.log('[DEBUG] Layout fetch result:', layoutRes.rows.length, 'rows');

    if (layoutRes.rows.length > 0 && layoutRes.rows[0].value) {
      const fetchedLayout = JSON.parse(layoutRes.rows[0].value as string);
      console.log('[DEBUG] Fetched layout from DB:', JSON.stringify(fetchedLayout, null, 2));

      // Ensure SidebarBrandWidget is present (logic copied from previous client-side)
      let sidebar = fetchedLayout.sidebar || DEFAULT_LAYOUT.sidebar;
      const hidden = fetchedLayout.hidden || [];

      if (Array.isArray(sidebar) && !sidebar.includes('SidebarBrandWidget') && !hidden.includes('SidebarBrandWidget')) {
        sidebar = ['SidebarBrandWidget', ...sidebar];
      }

      // Only merge fields that are missing from fetched layout (don't override existing values)
      layout = {
        sidebar: sidebar,
        main: fetchedLayout.main || DEFAULT_LAYOUT.main,
        mobile: fetchedLayout.mobile || DEFAULT_LAYOUT.mobile,
        hidden: hidden,
        hidden_mobile: fetchedLayout.hidden_mobile || DEFAULT_LAYOUT.hidden_mobile,
        hidden_menu: fetchedLayout.hidden_menu || []
      };
      console.log('[DEBUG] Final merged layout:', JSON.stringify(layout, null, 2));
    } else {
      console.log('[DEBUG] No layout found in DB, using DEFAULT_LAYOUT');
    }
  } catch (e) {
    console.error("[ERROR] Failed to fetch layout on server", e);
  }

  // Fetch Quick Menu
  let quickMenu = null;
  try {
    const qmRes = await db.execute("SELECT value FROM settings WHERE key = 'quick_menu_items'");
    if (qmRes.rows.length > 0 && qmRes.rows[0].value) {
      quickMenu = JSON.parse(qmRes.rows[0].value as string);
    }
  } catch (e) {
    console.error("Failed to fetch quick menu on server", e);
  }

  return (
    <HomeContent initialLayout={layout} initialQuickMenu={quickMenu} />
  );
}
