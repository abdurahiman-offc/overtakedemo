import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(password);
        if (success) {
            setError(false);
            // On successful login, go to the dashboard or admin portal
            navigate('/admin', { replace: true });
        } else {
            setError(true);
            setPassword('');
        }
    };

    return (
        <div className="flex h-full w-full items-center justify-center p-6 bg-gray-50/50">
            <div className="w-full max-w-md flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-xl border border-indigo-50/50 animate-fadeIn">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 mb-8 border border-indigo-100 shadow-sm">
                    <Shield size={36} strokeWidth={2.5} />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
                <p className="text-gray-500 text-center mb-10 text-sm">Please authenticate to access system settings and reports.</p>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            placeholder="Enter admin password (hint: admin)"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            className={`w-full pl-12 pr-4 py-4 rounded-xl border ${error ? 'border-red-300 ring-2 ring-red-100 bg-red-50/30' : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'} bg-white text-gray-900 transition-all font-medium`}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm font-semibold justify-center bg-red-50 py-2 rounded-lg border border-red-100">
                            <AlertCircle size={16} />
                            Incorrect password
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-px hover:shadow-xl hover:bg-indigo-700 active:translate-y-px"
                    >
                        Authenticate
                        <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
