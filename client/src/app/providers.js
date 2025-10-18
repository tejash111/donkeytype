"use client"

import { SocketProvider } from '@/contexts/SocketContext';

export default function Providers({ children }) {
    return (
        <SocketProvider>
            {children}
        </SocketProvider>
    );
}
