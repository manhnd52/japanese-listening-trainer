'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRegister } from '../hooks/useRegister';

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: ''
    });

    const { register, isLoading, error } = useRegister();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await register(formData);
        } catch (err) {

        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-brand-100">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-brand-900 mb-2">Create Account</h1>
                    <p className="text-brand-600">Start your learning journey today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Full Name Field */}
                    <div>
                <label className="block text-sm font-semibold text-brand-900 mb-2">Full Name</label>
                <input
                    type="text"
                    name="fullname" 
                    key="register-fullname"
                    required
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-brand-900 bg-brand-50" 
                    placeholder=""
                    autoComplete="name" 
                />
            </div>

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-semibold text-brand-900 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-brand-900 bg-brand-50"
                            placeholder=""
                            autoComplete="off"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                <label className="block text-sm font-semibold text-brand-900 mb-2">Password</label>
                <input
                    type="password"
                    name="password"
                    key="register-password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-brand-900 bg-brand-50"
                    placeholder=""
                    autoComplete="new-password" 
                />
            </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-500 text-white py-3 rounded-xl font-bold hover:bg-brand-600 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/30"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-brand-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-brand-500 hover:text-brand-600 font-semibold">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}