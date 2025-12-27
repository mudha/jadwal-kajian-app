'use client';

import { useState, useEffect } from 'react';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('/api/admin/check-session');
                if (response.ok) {
                    const data = await response.json();
                    setIsAdmin(data.authenticated === true);
                } else {
                    setIsAdmin(false);
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

    return { isAdmin, isLoading };
}
