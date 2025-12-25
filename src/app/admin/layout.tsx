import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminLayoutClient from '@/components/AdminLayoutClient';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Determine active session (double check server side)
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) {
        redirect('/login');
    }

    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
