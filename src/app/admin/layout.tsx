import { redirect } from 'next/navigation';
import AdminLayoutClient from '@/components/AdminLayoutClient';
import { getAdminSession } from '@/lib/auth';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getAdminSession();

    if (!session) {
        redirect('/login');
    }

    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
