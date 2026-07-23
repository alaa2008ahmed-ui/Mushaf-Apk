
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { OTP } from 'otplib';

const authenticator = new OTP({ strategy: 'totp' });

interface LoginProps {
    users: User[];
    onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState<'login' | 'totp'>('login');
    const [pendingUser, setPendingUser] = useState<User | null>(null);
    const [totpCode, setTotpCode] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (user) {
            if (user.isActive === false) {
                setError('This account has been deactivated. Please contact an administrator.');
            } else if (user.totpEnabled && user.totpSecret) {
                setPendingUser(user);
                setStep('totp');
                setError('');
            } else {
                onLogin(user);
            }
        } else {
            setError('Invalid username or password');
        }
    };

    const handleTotpSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (pendingUser && pendingUser.totpSecret) {
            const result = authenticator.verifySync({ token: totpCode, secret: pendingUser.totpSecret });
            if (result.valid) {
                onLogin(pendingUser);
            } else {
                setError('Invalid Authenticator code.');
            }
        }
    };

    useEffect(() => {
        if (step === 'totp' && totpCode.length === 6) {
            handleTotpSubmit();
        }
    }, [totpCode, step, pendingUser]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-900">
            {/* وعاء الخلفية المحسن لضمان أعلى جودة ووضوح وتجاوب كامل مع كافة الشاشات */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat select-none pointer-events-none"
                style={{ 
                    backgroundImage: "url('/1784786131733.png')",
                    imageRendering: 'auto'
                }}
            />
            {/* طبقة تظليل خفيفة لحماية تباين الألوان وقراءة النصوص دون التأثير على وضوح الخلفية */}
            <div className="absolute inset-0 bg-black/30" />

            <div className="max-w-[320px] sm:max-w-md w-full bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden relative z-10 border border-white/20">
                <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 p-4 sm:p-6 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">Sweet Water Company Ltd</h2>
                    <p className="text-blue-100 opacity-90 text-sm sm:text-base mt-1">Daily Sales Report</p>
                </div>
                
                {step === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-4 sm:space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 text-red-700 text-xs sm:text-sm">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg transform active:scale-95 transition-all duration-150 mt-2"
                        >
                            Sign In
                        </button>
                        
                        <div className="text-center text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4">
                            <p>&copy; 2026 Sweet Water Company LTD. All rights reserved.</p>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleTotpSubmit} className="p-6 sm:p-8 space-y-4 sm:space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 text-red-700 text-xs sm:text-sm">
                                {error}
                            </div>
                        )}
                        <p className="text-sm text-gray-600 text-center mb-4">
                            Please open your Google Authenticator app and enter the 6-digit code for your account.
                        </p>
                        
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Authenticator Code</label>
                            <input
                                type="text"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center tracking-widest text-lg"
                                placeholder="000000"
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg transform active:scale-95 transition-all duration-150 mt-2"
                        >
                            Verify
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep('login');
                                setPendingUser(null);
                                setTotpCode('');
                                setError('');
                            }}
                            className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                        >
                            Back to Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
