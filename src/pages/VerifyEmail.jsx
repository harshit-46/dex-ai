import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';

const VerifyEmail = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(async () => {
            const user = auth.currentUser;
            if (user) {
                await user.reload();
                if (user.emailVerified) {
                    clearInterval(interval);
                    navigate('/dashboard');
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white text-center p-8">
            <div>
                <h2 className="text-2xl font-bold mb-4">📩 Check Your Email</h2>
                <p className="text-gray-400">
                    We've sent a verification link to your email address. <br />
                    Please verify your email and come back to this page.
                </p>
                <p className="text-sm text-gray-500 mt-4">
                    Once verified, you’ll be redirected automatically to your dashboard.
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
