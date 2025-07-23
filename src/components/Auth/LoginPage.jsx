/*


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
                    Sign in with Google
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


*/



//import { Button } from "@/components/ui/button";
//import { Input } from "@/components/ui/input";
//import { Label } from "@/components/ui/label";
//import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Sparkles, Code2, Brain } from "lucide-react";
//import aiCodingBackground from "@/assets/ai-coding-background.jpg";

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
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo/Brand Section */}
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30">
                                <Brain className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                AI Mate
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Welcome back
                        </h1>
                        <p className="text-gray-400">
                            Sign in to your AI code companion
                        </p>
                    </div>

                    {/* Login Form */}
                    <Card className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 shadow-xl shadow-blue-500/10">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-semibold text-center text-white">
                                Sign in
                            </CardTitle>
                            <CardDescription className="text-center text-gray-400">
                                Enter your credentials to access your workspace
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-white">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <a href="#" className="text-blue-400 hover:text-purple-400 transition-colors">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg shadow-blue-500/30 transition-all duration-200"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Sign in
                                </Button>
                                <p className="text-center text-sm text-gray-400">
                                    Don't have an account?{" "}
                                    <a href="#" className="text-blue-400 hover:text-purple-400 transition-colors font-medium">
                                        Sign up
                                    </a>
                                </p>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                            <Code2 className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Smart Code</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                            <Brain className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">AI Powered</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Background Image */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${aiCodingBackground})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
                <div className="absolute inset-0 bg-black/20" />

                {/* Overlay Content */}
                <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white">
                    <div className="max-w-md space-y-6">
                        <h2 className="text-4xl font-bold">
                            Your AI Code Companion
                        </h2>
                        <p className="text-xl text-white/90">
                            Enhance your coding experience with intelligent assistance, smart suggestions, and automated workflows.
                        </p>
                        <div className="flex items-center justify-center space-x-4 text-white/80">
                            <div className="flex items-center space-x-2">
                                <Sparkles className="h-5 w-5" />
                                <span>Smart AI</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Code2 className="h-5 w-5" />
                                <span>Code Gen</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Brain className="h-5 w-5" />
                                <span>Learning</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;