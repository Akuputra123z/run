import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type FlashProps = {
    flash?: {
        success?: string;
        error?: string;
    };
};

export default function FlashMessages() {
    const { props } = usePage<FlashProps>();
    const [visible, setVisible] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const flash = props.flash;
    const message = flash?.success ?? flash?.error;

    useEffect(() => {
        if (!message) {
            return;
        }

        setIsError(Boolean(flash?.error));
        setVisible(message);

        if (timer.current) {
            clearTimeout(timer.current);
        }

        timer.current = setTimeout(() => setVisible(null), 5000);

        return () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
        };
    }, [message, flash?.error]);

    if (!visible) {
        return null;
    }

    const Icon = isError ? AlertCircle : CheckCircle2;

    return (
        <div
            role="status"
            style={{
                position: 'fixed',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                maxWidth: 'min(560px, calc(100vw - 32px))',
                padding: '13px 18px',
                borderRadius: 12,
                background: isError ? '#B3261E' : '#1E8E4E',
                color: '#FFF',
                fontWeight: 700,
                fontSize: 13.5,
                boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
                animation: 'flash-in 0.25s ease-out',
            }}
        >
            <Icon size={18} style={{ flexShrink: 0 }} />
            <span>{visible}</span>
            <style>{'@keyframes flash-in { from { opacity: 0; transform: translate(-50%, -12px); } to { opacity: 1; transform: translate(-50%, 0); } }'}</style>
        </div>
    );
}