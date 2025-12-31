import { Suspense } from 'react';
import AdminList from '@/components/admin/AdminList';

export default function AdminManagementPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat data...</div>}>
            <AdminList />
        </Suspense>
    );
}
