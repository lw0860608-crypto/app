import React, { useState } from 'react';
import { setSupabaseCredentials } from '../services/supabase';
import { SqlSchemaSetup } from './ui/SqlSchemaSetup';
import { SupabaseGuide } from './ui/SupabaseGuide';

interface DatabaseProps {
    onConnectionSuccess: () => void;
}

export const Database: React.FC<DatabaseProps> = ({ onConnectionSuccess }) => {
    const [url, setUrl] = useState('');
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        setError('');
        
        if (!url || !key) {
            setError('URL和密钥都是必填项。');
            setIsConnecting(false);
            return;
        }

        const success = await setSupabaseCredentials(url, key);
        if (success) {
            onConnectionSuccess();
        } else {
            setError('连接失败。请检查您的凭据，并确保数据库可访问。');
        }

        setIsConnecting(false);
    };

    return (
        <div className="bg-dark-bg min-h-screen flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <div className="bg-dark-card border border-dark-border rounded-lg shadow-2xl p-6 md:p-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white">连接到您的数据库</h1>
                        <p className="text-gray-400 mt-2">输入您的Supabase凭据以启动AIVideoMatrix控制中心。</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        {/* Left Side: Input Form */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-2">步骤 1: 输入凭据</h2>
                                <div className="space-y-4">
                                     <div>
                                        <label htmlFor="supabase-url" className="block text-sm font-medium text-gray-300">Supabase 项目 URL</label>
                                        <input 
                                            type="text" 
                                            id="supabase-url" 
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://xxxxxxxx.supabase.co" 
                                            className="mt-1 block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" 
                                        />
                                    </div>
                                     <div>
                                        <label htmlFor="supabase-key" className="block text-sm font-medium text-gray-300">Supabase Anon (public) Key</label>
                                        <input 
                                            type="password" 
                                            id="supabase-key" 
                                            value={key}
                                            onChange={(e) => setKey(e.target.value)}
                                            placeholder="ey..." 
                                            className="mt-1 block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm" 
                                        />
                                    </div>
                                    <button 
                                        onClick={handleConnect}
                                        disabled={isConnecting}
                                        className="w-full px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition disabled:bg-gray-500"
                                    >
                                        {isConnecting ? '连接中...' : '连接并初始化'}
                                    </button>
                                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                                </div>
                                <SupabaseGuide />
                            </div>
                        </div>

                        {/* Right Side: SQL Schema */}
                        <div>
                             <h2 className="text-lg font-semibold text-white mb-2">步骤 2: 设置数据库结构</h2>
                             <p className="text-sm text-gray-400 mb-4">
                                复制下方的SQL代码，并在您的Supabase项目的SQL编辑器中运行它。此操作只需执行一次。
                            </p>
                            <SqlSchemaSetup />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
