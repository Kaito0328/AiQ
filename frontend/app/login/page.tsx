"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/src/design/primitives/Container';
import { Flex } from '@/src/design/primitives/Flex';
import { LoginForm } from '@/src/features/auth/components/LoginForm';
import { RegisterForm } from '@/src/features/auth/components/RegisterForm';

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-surface-muted py-12">
            <Container size="md">
                <Flex direction="column" align="center" justify="center">
                    {mode === 'login' ? (
                        <LoginForm
                            onSuccess={handleSuccess}
                            onSwitchToRegister={() => setMode('register')}
                        />
                    ) : (
                        <RegisterForm
                            onSuccess={handleSuccess}
                            onSwitchToLogin={() => setMode('login')}
                        />
                    )}
                </Flex>
            </Container>
        </div>
    );
}
