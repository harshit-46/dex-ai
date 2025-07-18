import React, { useState } from 'react';
import { createUserWithEmailAndPassword , sendEmailVerification } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            await sendEmailVerification(user);
            toast.success("Signup successful! Please check your email to verify your account.")

            navigate('/verify');
        } catch (err) {
            setError(err.message);
        }
    };
    

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0f1b] text-white">
            <form onSubmit={handleSignup} className="bg-[#181a27] p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
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
                <button type="submit" className="w-full py-2 bg-purple-600 rounded hover:bg-purple-700">Sign Up</button>
                <p className="mt-4 text-sm text-gray-400">Already have an account? <Link to="/login" className="text-purple-400">Login</Link></p>
            </form>
        </div>
    );
};

export default SignUp;