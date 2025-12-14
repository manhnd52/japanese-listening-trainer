'use client';
import Link from 'next/link';

import { useState, FormEvent } from 'react';
import { useLogin } from '../hooks/useLogin';
import { LoginCredentials } from '../types';

export default function LoginForm() {
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: '',
    });

    const { login, isLoading, error } = useLogin();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await login(credentials);
            // Redirect or show success message
        } catch (err) {
            // Error is handled by the hook
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-brand-100">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-3xl text-white font-bold">J</span>
                    </div>
                    <h1 className="text-3xl font-bold text-brand-900 mb-2">Welcome Back</h1>
                    <p className="text-brand-600">Sign in to continue your learning journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-brand-900 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={credentials.email}
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-brand-900 bg-brand-50"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-brand-900 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-brand-900 bg-brand-50"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 accent-brand-500 rounded" />
                            <span className="text-brand-700">Remember me</span>
                        </label>
                        <a href="#" className="text-brand-500 hover:text-brand-600 font-semibold">
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-500 text-white py-3 rounded-xl font-bold hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/30"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-brand-600">
                Don't have an account?{' '}
                    <Link href="/register" className="text-brand-500 hover:text-brand-600 font-semibold">
                    Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
