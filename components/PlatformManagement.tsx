import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { PlusIcon, PencilIcon, TrashIcon } from './ui/Icons';
import { PlatformIcon } from './ui/PlatformIcons';
import { Platform, ManagedPlatform } from '../types';
import { supabase } from '../services/supabase';

// Modal for Adding/Editing Platforms
const PlatformModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    platformToEdit: ManagedPlatform | null;
}> = ({ isOpen, onClose, onSave, platformToEdit }) => {

    const [platformName, setPlatformName] = useState<Platform>(Platform.YouTube);
    const [publisherScript, setPublisherScript] = useState('');
    const [isActive, setIsActive] = useState(true);

    const isEditing = !!platformToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && platformToEdit) {
                setPlatformName(platformToEdit.platform_name);
                setPublisherScript(platformToEdit.publisher_script);
                setIsActive(platformToEdit.is_active);
            } else {
                // Reset/Default for new
                setPlatformName(Platform.TikTok); // Default to a new one
                setPublisherScript(`// 适用于TikTok的Node.js aivideomatrix-publisher脚本
// 'publish'函数将接收: (filePath, account, title, description, tags)
// 它必须返回最终的视频URL作为字符串。

const publish = async (filePath, account, title, description, tags) => {
    console.log('正在发布到TikTok...');
    // 在此处添加您的TikTok API上传逻辑。
    // 这是一个占位符，在实现之前将会失败。
    console.log({ filePath, account, title, description, tags });
    
    // 模拟上传延迟
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 您必须返回已发布视频的URL。
    const fakeUrl = \`https://www.tiktok.com/@\${account.username}/video/\${Date.now()}\`;
    console.log(\`假装上传到 \${fakeUrl}\`);
    return fakeUrl;
};

module.exports = { publish };
`);
                setIsActive(true);
            }
        }
    }, [isOpen, platformToEdit, isEditing]);

    const handleSave = async () => {
        if (!supabase) return;

        const platformData = {
            platform_name: platformName,
            publisher_script: publisherScript,
            is_active: isActive,
            // Schema is not editable from UI for now for simplicity
        };

        let error;
        if (isEditing && platformToEdit) {
            ({ error } = await supabase.from('managed_platforms').update(platformData).eq('id', platformToEdit.id));
        } else {
            ({ error } = await supabase.from('managed_platforms').insert([platformData]));
        }

        if (error) {
            alert(`保存平台时出错: ${error.message}`);
        } else {
            onSave(); // This will trigger a refresh on the parent
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-3xl p-6 border border-dark-border" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{isEditing ? '编辑平台适配器' : '添加新平台'}</h2>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">平台</label>
                            <select value={platformName} onChange={(e) => setPlatformName(e.target.value as Platform)} className="w-full bg-gray-900 border border-dark-border rounded-md py-2 px-3 text-white">
                                {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">状态</label>
                            <select value={String(isActive)} onChange={(e) => setIsActive(e.target.value === 'true')} className="w-full bg-gray-900 border border-dark-border rounded-md py-2 px-3 text-white">
                                <option value="true">激活</option>
                                <option value="false">禁用</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">发布器脚本 (Node.js)</label>
                        <p className="text-xs text-gray-400 mb-2">这是在执行节点上运行的代码。它必须导出一个名为 `publish` 的异步函数。</p>
                        <textarea
                            value={publisherScript}
                            onChange={(e) => setPublisherScript(e.target.value)}
                            rows={15}
                            className="w-full font-mono text-xs bg-gray-900 border border-dark-border rounded-md py-2 px-3 text-white"
                            placeholder="module.exports = { publish: async (filePath, account, title, description, tags) => { /* ... */ } };"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition">保存平台</button>
                </div>
            </div>
        </div>
    )
}


export const PlatformManagement: React.FC = () => {
    const [platforms, setPlatforms] = useState<ManagedPlatform[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlatform, setEditingPlatform] = useState<ManagedPlatform | null>(null);

    const fetchPlatforms = async () => {
        if (!supabase) return;
        const { data, error } = await supabase.from('managed_platforms').select('*').order('platform_name');
        if (error) console.error("Error fetching platforms:", error);
        else setPlatforms(data as ManagedPlatform[] || []);
    };

    useEffect(() => {
        fetchPlatforms();
    }, []);
    
    const handleAdd = () => {
        setEditingPlatform(null);
        setIsModalOpen(true);
    };

    const handleEdit = (platform: ManagedPlatform) => {
        setEditingPlatform(platform);
        setIsModalOpen(true);
    };

    const handleDelete = async (platformId: string) => {
        if (!supabase) return;
        if (window.confirm('您确定要删除这个平台适配器吗？')) {
            const { error } = await supabase.from('managed_platforms').delete().eq('id', platformId);
            if (error) alert(`删除平台时出错: ${error.message}`);
            else fetchPlatforms();
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">平台管理中心</h1>
                    <p className="text-gray-400 mt-1">为您的执行节点添加、配置并管理可用的发布平台。</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center justify-center px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition-transform duration-200 hover:scale-105"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    添加新平台
                </button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">平台</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">状态</th>
                                <th className="py-3 px-6 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-dark-border">
                            {platforms.map(platform => (
                                <tr key={platform.id} className="hover:bg-gray-700/50">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <PlatformIcon platform={platform.platform_name} className="h-6 w-6"/>
                                            <span className="font-semibold text-white">{platform.platform_name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${platform.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {platform.is_active ? '已激活' : '已禁用'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex items-center justify-center space-x-4">
                                            <button onClick={() => handleEdit(platform)} className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"><PencilIcon className="h-4 w-4"/><span>编辑</span></button>
                                            <button onClick={() => handleDelete(platform.id)} className="text-red-500 hover:text-red-400 flex items-center space-x-1"><TrashIcon className="h-4 w-4"/><span>删除</span></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <PlatformModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchPlatforms}
                platformToEdit={editingPlatform}
            />
        </div>
    );
};
