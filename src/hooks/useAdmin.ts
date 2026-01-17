'use client';

import { useState, useEffect } from 'react';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('/api/admin/check-session');
                if (response.ok) {
                    const data = await response.json();
                    setIsAdmin(data.authenticated === true || data.isAdmin === true);
                    setRole(data.role);
                    setFullName(data.fullName);
                    setUsername(data.username);
                } else {
                    setIsAdmin(false);
                    setRole(null);
                    setFullName(null);
                    setUsername(null);
                }
            } catch (error) {
                console.error('Error checking admin session:', error);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    return { isAdmin, role, fullName, username, isLoading };
}
