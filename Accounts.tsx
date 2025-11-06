// components/Accounts.tsx
import React from 'react';
import type { Account } from '../types';
import { Card } from './ui/Card';
import { PlusIcon, PencilIcon, TrashIcon, LinkIcon, CheckCircleIcon, SparklesIcon } from './ui/Icons';
import { PlatformIcon } from './ui/PlatformIcons';

interface AccountsProps {
    accounts: Account[];
    onAddAccount: () => void;
    onEditAccount: (account: Account) => void;
    onDeleteAccount: (accountId: string) => void;
}

const getCredentialStatus = (account: Account) => {
    // A more generic check for any credentials
    if (account.credentials) {
         return {
            text: '已连接',
            icon: <CheckCircleIcon className="h-4 w-4 mr-1 text-green-400" />,
            buttonClass: 'text-green-400',
            isConnected: true,
        };
    }
    return {
        text: '连接平台',
        icon: <LinkIcon className="h-4 w-4 mr-1" />,
        buttonClass: 'text-brand-blue hover:text-brand-blue/80',
        isConnected: false,
    };
};


export const Accounts: React.FC<AccountsProps> = ({ accounts, onAddAccount, onEditAccount, onDeleteAccount }) => {
    
    const handleConnect = (account: Account) => {
        const redirectUri = window.location.origin;
        let oauthUrl = '';

        switch (account.platform) {
            case 'YouTube':
                const scopes = [
                    'https://www.googleapis.com/auth/youtube.upload',
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/userinfo.email'
                ].join(' ');
                
                // ==============================================================================
                // OPTIMIZATION: Using environment variables for security and flexibility.
                // The Client ID is now loaded from your .env.local file.
                // ==============================================================================
                // FIX: Safely access import.meta.env to prevent crashes when not in a Vite environment.
                const env = (import.meta as any).env;
                const clientId = env?.VITE_GOOGLE_CLIENT_ID;


                if (!clientId || clientId === "YOUR_GOOGLE_CLOUD_CLIENT_ID") {
                    console.error("CRITICAL: Google Client ID is not configured. This is an admin-level setup. Please create a .env.local file in the project root and add VITE_GOOGLE_CLIENT_ID='your-client-id-here'.");
                    alert("【重要配置】: Google Client ID 未设置! 这是一个管理员级别的配置，请联系平台管理员。");
                    return;
                }

                oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&state=${account.id}&access_type=offline&prompt=consent`;
                break;
            default:
                alert(`平台 ${account.platform} 的连接流程尚未实现。`);
                return;
        }
        
        window.location.href = oauthUrl;
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">账号管理</h1>
                <button 
                    onClick={onAddAccount}
                    className="flex items-center px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition-transform duration-200 hover:scale-105"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    添加账号
                </button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-border">
                        <thead className="bg-dark-card">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">账号</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">AI总监模式</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">每日预算/审批阈值 (¥)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">连接状态</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-dark-card divide-y divide-dark-border">
                            {accounts.length > 0 ? (
                                accounts.map(account => {
                                    const credentialStatus = getCredentialStatus(account);
                                    return (
                                    <tr key={account.id} className="hover:bg-gray-700/50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <PlatformIcon platform={account.platform} className="h-6 w-6" />
                                                <div>
                                                    <div className="text-sm font-medium text-white">{account.username}</div>
                                                    <div className="text-xs text-gray-400">{account.content_style}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {account.is_autonomous ? (
                                                <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-purple-500/20 text-purple-300">
                                                    <SparklesIcon className="h-4 w-4 mr-1.5"/>
                                                    已激活
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-500/20 text-gray-400">
                                                    手动
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">
                                            ¥{account.daily_spend_limit?.toFixed(2) ?? 'N/A'} / ¥{account.approval_threshold?.toFixed(2) ?? 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            <button 
                                                onClick={() => handleConnect(account)}
                                                className={`flex items-center text-xs font-semibold transition-colors ${credentialStatus.buttonClass}`}
                                                disabled={credentialStatus.isConnected}
                                            >
                                                {credentialStatus.icon}
                                                {credentialStatus.text}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center space-x-3">
                                                <button onClick={() => onEditAccount(account)} className="text-blue-400 hover:text-blue-300 transition-colors">
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => onDeleteAccount(account.id)} className="text-red-500 hover:text-red-400 transition-colors">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )})
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 px-6">
                                        <h3 className="text-lg font-semibold text-white">未找到任何账号</h3>
                                        <p className="text-gray-400 mt-1">点击“添加账号”按钮开始。</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};