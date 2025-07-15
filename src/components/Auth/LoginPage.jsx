import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { loginWithGoogle } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const user = await loginWithGoogle();
            if(user){
                toast.success(`Welcome ${user.displayName || 'User'}!`);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0f1b] text-white">
            <form onSubmit={handleLogin} className="bg-[#181a27] p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 mb-4 rounded bg-[#0f111a] border border-gray-700"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mb-4 rounded bg-[#0f111a] border border-gray-700"
                    required
                />
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button type="submit" className="w-full py-2 bg-purple-600 rounded hover:bg-purple-700 mb-3">
                    Login
                </button>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-2 bg-red-500 hover:bg-red-600 rounded transition mb-3"
                >
                    🔐 Sign in with Google
                </button>

                <p className="mt-4 text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-purple-400">Sign up</Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
