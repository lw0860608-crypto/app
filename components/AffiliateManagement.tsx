// components/AffiliateManagement.tsx
import React, { useState, useEffect } from 'react';
import type { AffiliateRule } from '../types';
import { Card } from './ui/Card';
import { PlusIcon, PencilIcon, TrashIcon, LinkIcon } from './ui/Icons';
import { supabase } from '../services/supabase';

const RuleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    ruleToEdit: AffiliateRule | null;
}> = ({ isOpen, onClose, onSave, ruleToEdit }) => {
    const [keyword, setKeyword] = useState('');
    const [affiliateLink, setAffiliateLink] = useState('');
    const [isActive, setIsActive] = useState(true);
    const isEditing = !!ruleToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && ruleToEdit) {
                setKeyword(ruleToEdit.keyword);
                setAffiliateLink(ruleToEdit.affiliate_link);
                setIsActive(ruleToEdit.is_active);
            } else {
                setKeyword('');
                setAffiliateLink('');
                setIsActive(true);
            }
        }
    }, [isOpen, ruleToEdit, isEditing]);

    const handleSave = async () => {
        if (!supabase || !keyword || !affiliateLink) {
            alert('关键词和联盟链接均为必填项。');
            return;
        }

        const ruleData = { keyword, affiliate_link: affiliateLink, is_active: isActive };
        let error;

        if (isEditing) {
            ({ error } = await supabase.from('affiliate_rules').update(ruleData).eq('id', ruleToEdit.id));
        } else {
            ({ error } = await supabase.from('affiliate_rules').insert([ruleData]));
        }

        if (error) {
            alert(`保存规则时出错: ${error.message}`);
        } else {
            onSave();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-lg p-6 border border-dark-border" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{isEditing ? '编辑规则' : '添加新规则'}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">关键词</label>
                        <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="例如：游戏鼠标" className="w-full bg-gray-900 border-dark-border rounded-md py-2 px-3 text-white"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">联盟链接</label>
                        <input type="url" value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} placeholder="https://..." className="w-full bg-gray-900 border-dark-border rounded-md py-2 px-3 text-white"/>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">规则状态</span>
                        <div className="flex items-center">
                            <span className={`mr-3 text-sm font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>{isActive ? '激活' : '禁用'}</span>
                            <button type="button" onClick={() => setIsActive(!isActive)} className={`${isActive ? 'bg-brand-blue' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`} role="switch" aria-checked={isActive}>
                                <span className={`${isActive ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition">保存规则</button>
                </div>
            </div>
        </div>
    );
};

export const AffiliateManagement: React.FC<{ affiliateRules: AffiliateRule[], refreshRules: () => void }> = ({ affiliateRules, refreshRules }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<AffiliateRule | null>(null);

    const handleAdd = () => {
        setEditingRule(null);
        setIsModalOpen(true);
    };

    const handleEdit = (rule: AffiliateRule) => {
        setEditingRule(rule);
        setIsModalOpen(true);
    };

    const handleDelete = async (ruleId: string) => {
        if (!supabase) return;
        if (window.confirm('您确定要删除此规则吗？')) {
            const { error } = await supabase.from('affiliate_rules').delete().eq('id', ruleId);
            if (error) alert(`删除规则时出错: ${error.message}`);
            else refreshRules();
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">联盟链接规则</h1>
                    <p className="text-gray-400 mt-1">管理关键词与联盟链接的对应关系，以实现自动化植入。</p>
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    添加新规则
                </button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                             <tr>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">状态</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">关键词</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">联盟链接</th>
                                <th className="py-3 px-6 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {affiliateRules.length > 0 ? affiliateRules.map(rule => (
                                <tr key={rule.id} className="hover:bg-gray-700/50">
                                    <td className="py-4 px-6">
                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rule.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {rule.is_active ? '激活' : '禁用'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-mono text-white">{rule.keyword}</td>
                                    <td className="py-4 px-6 text-sm text-gray-300 truncate max-w-xs">
                                        <a href={rule.affiliate_link} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue">{rule.affiliate_link}</a>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex items-center justify-center space-x-4">
                                            <button onClick={() => handleEdit(rule)} className="text-blue-400 hover:text-blue-300"><PencilIcon className="h-5 w-5" /></button>
                                            <button onClick={() => handleDelete(rule.id)} className="text-red-500 hover:text-red-400"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">
                                        没有找到任何规则。点击“添加新规则”开始。
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
             <RuleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={refreshRules}
                ruleToEdit={editingRule}
            />
        </div>
    );
};
