// components/RepostTaskModal.tsx
import React, { useState, useEffect } from 'react';
import type { Account, GenerationTask } from '../types';

interface RepostTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (originalTask: GenerationTask, targetAccountIds: string[]) => void;
    originalTask: GenerationTask | null;
    accounts: Account[];
}

export const RepostTaskModal: React.FC<RepostTaskModalProps> = ({ isOpen, onClose, onSave, originalTask, accounts }) => {
    const [targetAccountIds, setTargetAccountIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setTargetAccountIds([]); // Reset selection when modal opens
        }
    }, [isOpen]);

    const handleAccountSelection = (accountId: string) => {
        setTargetAccountIds(prev =>
            prev.includes(accountId)
                ? prev.filter(id => id !== accountId)
                : [...prev, accountId]
        );
    };

    const handleSave = () => {
        if (!originalTask || targetAccountIds.length === 0) {
             alert('请至少选择一个要重发的目标账号。');
            return;
        }
        onSave(originalTask, targetAccountIds);
    };

    if (!isOpen || !originalTask) return null;

    const originalAccount = accounts.find(a => a.id === originalTask.account_id);
    const availableAccounts = accounts.filter(a => a.id !== originalTask.account_id);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-xl p-6 border border-dark-border" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">重发爆款内容</h2>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    <div className="bg-gray-900/50 p-3 rounded-md">
                        <p className="text-sm text-gray-400">原始任务 (发布于 {originalAccount?.username}):</p>
                        <p className="font-semibold text-white truncate" title={originalTask.prompt}>{originalTask.prompt}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">选择重发到的账号 (可多选)</label>
                        {availableAccounts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2 p-2 border border-dark-border rounded-md max-h-40 overflow-y-auto">
                                {availableAccounts.map(acc => (
                                    <label key={acc.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700/50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={targetAccountIds.includes(acc.id)}
                                            onChange={() => handleAccountSelection(acc.id)}
                                            className="h-4 w-4 rounded bg-gray-800 border-gray-600 text-brand-blue focus:ring-brand-blue"
                                        />
                                        <span className="text-sm text-white">{acc.username} ({acc.platform})</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-center text-gray-500 p-4 bg-gray-900/50 rounded-md">没有其他可用的账号。</p>
                        )}
                    </div>
                    <p className="text-xs text-gray-400">系统将为每个选定的账号创建一个新的发布任务，使用与原始视频完全相同的主题和设置。</p>
                </div>
                 <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition">取消</button>
                    <button 
                        onClick={handleSave} 
                        disabled={targetAccountIds.length === 0}
                        className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition disabled:bg-gray-500"
                    >
                        确认重发
                    </button>
                </div>
            </div>
        </div>
    );
};
