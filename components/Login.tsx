import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { MindSparkIcon } from './ui/Icons';

export const Login: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (isLoginView) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage('注册成功！请检查您的邮箱以完成验证。');
            }
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-dark-bg min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm mx-auto">
                <div className="text-center mb-8">
                     <div className="flex items-center justify-center space-x-3">
                        <div className="bg-gradient-to-tr from-brand-blue to-brand-purple p-3 rounded-lg inline-block">
                            <MindSparkIcon className="h-8 w-8 text-white"/>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mt-4">一青里AI工作室</h1>
                     <p className="text-gray-400 mt-1">v6.0 (多租户指挥中心)</p>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-lg shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-white text-center mb-6">
                        {isLoginView ? '登录' : '注册新账号'}
                    </h2>
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">邮箱地址</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">密码</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="mt-1 block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition disabled:bg-gray-500"
                        >
                            {loading ? '处理中...' : (isLoginView ? '登录' : '注册')}
                        </button>
                        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                        {message && <p className="text-sm text-green-400 text-center">{message}</p>}
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-gray-400 hover:text-brand-blue">
                            {isLoginView ? '还没有账号？去注册' : '已有账号？去登录'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
