import React, { useState, useEffect, useMemo } from 'react';
import type { Account, GenerationTask, ExecutionNode } from '../types';
import { NodeType } from '../types';

interface CreateEditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskData: (Omit<GenerationTask, 'id' | 'created_at' | 'status'> & { account_ids: string[] }) | GenerationTask) => void;
    taskToEdit?: GenerationTask | null;
    accounts: Account[];
    nodes: ExecutionNode[]; // Pass nodes to determine their types
}

export const CreateEditTaskModal: React.FC<CreateEditTaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit, accounts, nodes }) => {
    const [prompt, setPrompt] = useState('');
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [scheduledFor, setScheduledFor] = useState('');
    const [targetNodeLocation, setTargetNodeLocation] = useState<string>('any_server');
    const [expiryHours, setExpiryHours] = useState<number | ''>(24);

    const isEditing = !!taskToEdit;

    const uniqueNodeLocations = useMemo(() => {
        const locations = new Set(nodes.map(n => n.location));
        return Array.from(locations);
    }, [nodes]);
    
    const nodeMap = useMemo(() => new Map(nodes.map(n => [n.location, n.node_type])), [nodes]);

    const isTargetNodeNonServer = useMemo(() => {
        if (targetNodeLocation === 'any_server') return false;
        const nodeType = nodeMap.get(targetNodeLocation);
        return nodeType === NodeType.DesktopCompanion || nodeType === NodeType.MobileProxy;
    }, [targetNodeLocation, nodeMap]);

    useEffect(() => {
        if (isOpen) {
            if (isEditing && taskToEdit) {
                setPrompt(taskToEdit.prompt);
                setSelectedAccountIds([taskToEdit.account_id]);
                setScheduledFor(taskToEdit.scheduled_for ? taskToEdit.scheduled_for.slice(0, 16) : '');
                setTargetNodeLocation(taskToEdit.target_node_location || 'any_server');
                // Logic to calculate expiry hours from expires_at would be complex, so we reset for simplicity in edit mode.
                setExpiryHours(24);
            } else {
                setPrompt('');
                setSelectedAccountIds([]);
                setScheduledFor('');
                setTargetNodeLocation('any_server');
                setExpiryHours(24);
            }
        }
    }, [isOpen, taskToEdit, isEditing]);

    const handleSave = () => {
        if (!prompt || selectedAccountIds.length === 0) {
            alert('任务指令和目标账号为必填项。');
            return;
        }

        let expiresAt = null;
        if (isTargetNodeNonServer && expiryHours !== '') {
            const startDate = scheduledFor ? new Date(scheduledFor) : new Date();
            startDate.setHours(startDate.getHours() + Number(expiryHours));
            expiresAt = startDate.toISOString();
        }

        const commonData = {
            prompt,
            scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
            target_node_location: targetNodeLocation === 'any_server' ? null : targetNodeLocation,
            expires_at: expiresAt
        };

        if (isEditing && taskToEdit) {
            const taskData: GenerationTask = {
                ...taskToEdit,
                ...commonData,
                account_id: selectedAccountIds[0], // Editing only supports one account
            };
            onSave(taskData);
        } else {
            const taskData = {
                ...commonData,
                account_ids: selectedAccountIds,
            };
            onSave(taskData as (Omit<GenerationTask, 'id' | 'created_at' | 'status'> & { account_ids: string[] }));
        }
    };
    
    const handleAccountSelection = (accountId: string) => {
        if (isEditing) {
            setSelectedAccountIds([accountId]);
        } else {
            setSelectedAccountIds(prev =>
                prev.includes(accountId)
                    ? prev.filter(id => id !== accountId)
                    : [...prev, accountId]
            );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-2xl p-6 border border-dark-border" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{isEditing ? '编辑任务' : '创建新任务'}</h2>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">任务指令</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={3}
                            placeholder="例如：创建一个关于“古代罗马斗兽场”的60秒短视频..."
                            className="w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                           {isEditing ? '目标账号' : '目标账号 (可多选)'}
                        </label>
                         {accounts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2 p-2 border border-dark-border rounded-md max-h-32 overflow-y-auto">
                                {accounts.map(acc => (
                                    <label key={acc.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700/50 cursor-pointer">
                                        <input
                                            type={isEditing ? 'radio' : 'checkbox'}
                                            name="account"
                                            checked={selectedAccountIds.includes(acc.id)}
                                            onChange={() => handleAccountSelection(acc.id)}
                                            className="h-4 w-4 rounded-full bg-gray-800 border-gray-600 text-brand-blue focus:ring-brand-blue"
                                        />
                                        <span className="text-sm text-white">{acc.username} ({acc.platform})</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                             <p className="text-sm text-center text-gray-500 p-4 bg-gray-900/50 rounded-md">请先在“账号管理”页面添加账号。</p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">定时发布 (可选)</label>
                            <input
                                type="datetime-local"
                                value={scheduledFor}
                                onChange={(e) => setScheduledFor(e.target.value)}
                                className="w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">指定节点位置</label>
                            <select
                                value={targetNodeLocation}
                                onChange={e => setTargetNodeLocation(e.target.value)}
                                className="w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white"
                            >
                                <option value="any_server">任意服务器节点</option>
                                {uniqueNodeLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                    </div>

                    {isTargetNodeNonServer && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <label className="block text-sm font-medium text-yellow-200 mb-1">任务时效保险</label>
                            <p className="text-xs text-yellow-300/80 mb-2">您已选择一个非服务器节点。为防止因设备离线导致任务失败，请设置一个最长等待时间。超时后，任务将自动改派给在线的服务器节点执行。</p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white">等待</span>
                                <input
                                    type="number"
                                    value={expiryHours}
                                    onChange={(e) => setExpiryHours(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-20 bg-gray-900 border-dark-border rounded-md py-1 px-2 text-white"
                                />
                                <span className="text-sm text-white">小时后改派</span>
                            </div>
                        </div>
                    )}

                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition">保存任务</button>
                </div>
            </div>
        </div>
    );
};
