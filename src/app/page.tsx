import db from '@/lib/db';
import HomeContent from '@/components/HomeContent';

// Force dynamic rendering to ensure fresh settings are fetched on every request
export const dynamic = 'force-dynamic';

const DEFAULT_LAYOUT = {
  sidebar: ['SidebarBrandWidget', 'SidebarMenuWidget', 'PrayerTimesWidget', 'ContactWidget'],
  main: ['HeroWidget', 'QuickMenuWidget', 'OngoingWidget', 'LatestKajianWidget', 'KajianListWidget'],
  mobile: ['HeroWidget:mobile', 'QuickMenuWidget:mobile', 'OngoingWidget:mobile', 'LatestKajianWidget:mobile', 'KajianListWidget:mobile'],
  hidden: [],
  hidden_mobile: ['SidebarMenuWidget:mobile', 'PrayerTimesWidget:mobile', 'ContactWidget:mobile']
};

export default async function BerandaPage() {
  // Fetch Layout
  let layout = DEFAULT_LAYOUT;
  try {
    const layoutRes = await db.execute("SELECT value FROM settings WHERE key = 'homepage_layout'");
    if (layoutRes.rows.length > 0 && layoutRes.rows[0].value) {
      const fetchedLayout = JSON.parse(layoutRes.rows[0].value as string);

      // Ensure SidebarBrandWidget is present (logic copied from previous client-side)
      const mobile = fetchedLayout.mobile || DEFAULT_LAYOUT.mobile;
      const hidden_mobile = fetchedLayout.hidden_mobile || DEFAULT_LAYOUT.hidden_mobile;
      let sidebar = fetchedLayout.sidebar || DEFAULT_LAYOUT.sidebar;
      const hidden = fetchedLayout.hidden || [];

      if (Array.isArray(sidebar) && !sidebar.includes('SidebarBrandWidget') && !hidden.includes('SidebarBrandWidget')) {
        sidebar = ['SidebarBrandWidget', ...sidebar];
      }
      // Merge defaults for safety (ensure all keys like 'main' exist)
      layout = { ...DEFAULT_LAYOUT, ...fetchedLayout, sidebar, mobile, hidden_mobile };
    }
  } catch (e) {
    console.error("Failed to fetch layout on server", e);
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
