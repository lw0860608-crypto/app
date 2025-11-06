// components/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { supabase } from '../services/supabase';
import type { SuperAdminUser } from '../types';
import { ShieldCheckIcon } from './ui/Icons';

interface UserManagementProps {
    onImpersonate: (user: SuperAdminUser) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onImpersonate }) => {
    const [users, setUsers] = useState<SuperAdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError('');
            // IMPORTANT: Fetching all users requires special permissions.
            // We use an RPC function that can only be called by the super admin.
            const { data, error } = await supabase.rpc('get_all_users');

            if (error) {
                console.error("Error fetching users:", error);
                setError('无法获取用户列表。请确保您是超级管理员，并且 "get_all_users" RPC 函数已在数据库中正确设置。');
            } else {
                setUsers(data);
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                 <ShieldCheckIcon className="h-8 w-8 text-red-400"/>
                 <div>
                    <h1 className="text-3xl font-bold text-white">用户管理</h1>
                    <p className="text-gray-400 mt-1">作为超级管理员，您可以在此查看并管理平台上的所有用户。</p>
                </div>
            </div>
            
            <Card>
                {loading && <p>正在加载用户列表...</p>}
                {error && <p className="text-red-400">{error}</p>}
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-border">
                            <thead className="bg-dark-card">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">用户邮箱</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">注册时间</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">最后登录</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-dark-card divide-y divide-dark-border">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(user.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '从未'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => onImpersonate(user)}
                                                className="px-3 py-1 bg-brand-blue text-white text-xs font-semibold rounded-md hover:bg-brand-blue/80"
                                            >
                                                进入后台
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};
