// components/AddAccountModal.tsx
import React, { useState, useEffect } from 'react';
import type { Account } from '../types';
import { Platform } from '../types';

interface AddAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (accountData: Omit<Account, 'id' | 'created_at'> | Account) => void;
    accountToEdit?: Account | null;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onSave, accountToEdit }) => {
    // Basic Info
    const [username, setUsername] = useState('');
    const [platform, setPlatform] = useState<Platform>(Platform.YouTube);
    const [contentStyle, setContentStyle] = useState('');
    
    // Publishing Strategy
    const [dailyPostLimit, setDailyPostLimit] = useState<number | ''>(3);
    const [preferredPostTimes, setPreferredPostTimes] = useState('');
    
    // Autonomy Engine
    const [isAutonomous, setIsAutonomous] = useState(false);
    const [dailySpendLimit, setDailySpendLimit] = useState<number | ''>('');
    const [approvalThreshold, setApprovalThreshold] = useState<number | ''>('');
    const [creativeMandate, setCreativeMandate] = useState('');

    // Monetization 2.0
    const [estimatedEcpm, setEstimatedEcpm] = useState<number | ''>('');
    const [enableWatermark, setEnableWatermark] = useState(false);

    const isEditing = !!accountToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && accountToEdit) {
                setUsername(accountToEdit.username);
                setPlatform(accountToEdit.platform);
                setContentStyle(accountToEdit.content_style || '');
                setDailyPostLimit(accountToEdit.daily_post_limit ?? '');
                setPreferredPostTimes(accountToEdit.preferred_post_times || '');
                setIsAutonomous(accountToEdit.is_autonomous || false);
                setDailySpendLimit(accountToEdit.daily_spend_limit ?? '');
                setApprovalThreshold(accountToEdit.approval_threshold ?? '');
                setCreativeMandate(accountToEdit.creative_mandate || '');
                setEstimatedEcpm(accountToEdit.estimated_ecpm_cny ?? '');
                setEnableWatermark(accountToEdit.enable_saas_watermark || false);
            } else {
                // Reset form for new account
                setUsername('');
                setPlatform(Platform.YouTube);
                setContentStyle('');
                setDailyPostLimit(3);
                setPreferredPostTimes('10:00,18:00,21:00');
                setIsAutonomous(false);
                setDailySpendLimit(35);
                setApprovalThreshold(3.5);
                setCreativeMandate('');
                setEstimatedEcpm(15);
                setEnableWatermark(false);
            }
        }
    }, [isOpen, accountToEdit, isEditing]);


    const handleSave = () => {
        if (!username || !platform) return;

        const accountData = {
            username,
            platform,
            content_style: contentStyle,
            daily_post_limit: dailyPostLimit === '' ? null : Number(dailyPostLimit),
            preferred_post_times: preferredPostTimes,
            is_autonomous: isAutonomous,
            daily_spend_limit: dailySpendLimit === '' ? null : Number(dailySpendLimit),
            approval_threshold: approvalThreshold === '' ? null : Number(approvalThreshold),
            creative_mandate: creativeMandate,
            estimated_ecpm_cny: estimatedEcpm === '' ? null : Number(estimatedEcpm),
            enable_saas_watermark: enableWatermark,
        };
        
        if (isEditing && accountToEdit) {
            onSave({ ...accountToEdit, ...accountData });
        } else {
            onSave(accountData as Omit<Account, 'id' | 'created_at'>);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-2xl p-6 border border-dark-border" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{isEditing ? '编辑账号' : '添加新账号'}</h2>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">用户名 / Handle</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="例如：@MyCoolChannel" className="w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">平台</label>
                            <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue">
                                {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">内容风格</label>
                        <input type="text" value={contentStyle} onChange={(e) => setContentStyle(e.target.value)} placeholder="例如：快节奏科普、深度电影解析、AI工具教程" className="w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue" />
                    </div>
                    
                    {/* Monetization */}
                    <div className="border-t border-dark-border pt-4">
                        <h3 className="text-lg font-semibold text-white">盈利与增长</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">千次观看预估收入 (eCPM / ¥)</label>
                                <input type="number" value={estimatedEcpm} onChange={(e) => setEstimatedEcpm(e.target.value === '' ? '' : Number(e.target.value))} placeholder="例如：15" className="w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <label className="block text-sm font-medium text-gray-300 mb-1">启用推广水印</label>
                                <div className="flex items-center mt-1">
                                    <button type="button" onClick={() => setEnableWatermark(!enableWatermark)} className={`${enableWatermark ? 'bg-brand-blue' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`} role="switch" aria-checked={enableWatermark}>
                                        <span className={`${enableWatermark ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                    </button>
                                     <span className={`ml-3 text-sm font-medium ${enableWatermark ? 'text-white' : 'text-gray-500'}`}>{enableWatermark ? '已启用' : '已禁用'}</span>
                                </div>
                            </div>
                        </div>
                         <p className="text-xs text-gray-400 mt-1">开启水印会在视频右下角和简介中添加品牌信息以推广SaaS服务。</p>
                    </div>


                    {/* Publishing Strategy */}
                    <div className="border-t border-dark-border pt-4">
                        <h3 className="text-lg font-semibold text-white">发布策略</h3>
                        <p className="text-xs text-gray-400 mb-3">配置AI应如何为该账号安排发布计划。在AI总监模式下，这些将作为指导方针。</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">每日发布上限</label>
                                <input type="number" value={dailyPostLimit} onChange={(e) => setDailyPostLimit(e.target.value === '' ? '' : Number(e.target.value))} placeholder="例如：3" className="w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">首选发布时间 (UTC)</label>
                                <input type="text" value={preferredPostTimes} onChange={(e) => setPreferredPostTimes(e.target.value)} placeholder="例如: 10:00,18:00,21:00" className="w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                        </div>
                    </div>

                    {/* Autonomy Engine */}
                    <div className="border-t border-dark-border pt-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-white">AI总监模式</h3>
                                <p className="text-xs text-gray-400 mb-3">让AI为您自主管理此账号。</p>
                            </div>
                            <div className="flex items-center">
                                <span className={`mr-3 text-sm font-medium ${isAutonomous ? 'text-white' : 'text-gray-500'}`}>{isAutonomous ? '已激活' : '已禁用'}</span>
                                <button type="button" onClick={() => setIsAutonomous(!isAutonomous)} className={`${isAutonomous ? 'bg-brand-blue' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-dark-card`} role="switch" aria-checked={isAutonomous}>
                                    <span className={`${isAutonomous ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                </button>
                            </div>
                        </div>
                        {isAutonomous && (
                            <div className="space-y-4 mt-2 p-4 bg-gray-900/50 rounded-lg border border-dark-border">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">每日消费上限 (¥)</label>
                                        <input type="number" value={dailySpendLimit} onChange={(e) => setDailySpendLimit(e.target.value === '' ? '' : Number(e.target.value))} placeholder="例如：35" className="w-full bg-gray-800 border-dark-border rounded-md py-2 px-3 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">自动审批阈值 (¥)</label>
                                        <input type="number" value={approvalThreshold} onChange={(e) => setApprovalThreshold(e.target.value === '' ? '' : Number(e.target.value))} placeholder="例如：3.5" className="w-full bg-gray-800 border-dark-border rounded-md py-2 px-3 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 -mt-2">预估成本低于此阈值的任务将被AI自动批准。</p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">AI创作指令 (Creative Mandate)</label>
                                    <textarea value={creativeMandate} onChange={(e) => setCreativeMandate(e.target.value)} placeholder="例如：为抖音平台创作关于'古代神话'的快节奏、强反转的60秒短视频，强调视觉冲击力。" rows={3} className="w-full bg-gray-800 border-dark-border rounded-md py-2 px-3 text-white"></textarea>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition">保存账号</button>
                </div>
            </div>
        </div>
    );
};