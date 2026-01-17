import { getAdminStats } from '@/lib/db-stats';
import StatsView from '@/components/admin/StatsView';

// Force dynamic because stats change constantly
export const dynamic = 'force-dynamic';

export default async function AdminStatsPage() {
    const stats = await getAdminStats();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Statistics</h1>
                    <p className="text-slate-500">Overview of your application performance.</p>
                </div>
            </div>

            <StatsView stats={stats} />
        </div>
    );
}
