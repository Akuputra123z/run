import type { ReactNode } from 'react';
import FlashMessages from '@/components/flash-messages';

export default function FlashLayout({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
            <FlashMessages />
        </>
    );
}