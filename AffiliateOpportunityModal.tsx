import React, { useState, useEffect } from 'react';
import type { GenerationTask, AffiliateRule } from '../types';
import { SparklesIcon } from './ui/Icons';
import { GoogleGenAI } from '@google/genai';

interface AffiliateOpportunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: GenerationTask | null;
    // FIX: Corrected the type for onSaveRule to match the parent component's prop, which does not expect user_id.
    onSaveRule: (rule: Omit<AffiliateRule, 'id' | 'created_at' | 'user_id'>) => void;
}

export const AffiliateOpportunityModal: React.FC<AffiliateOpportunityModalProps> = ({ isOpen, onClose, task, onSaveRule }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [opportunities, setOpportunities] = useState<string[]>([]);
    const [error, setError] = useState('');
    
    // Form state
    const [keyword, setKeyword] = useState('');
    const [affiliateLink, setAffiliateLink] = useState('');

    useEffect(() => {
        // Reset state when modal is opened for a new task
        if (isOpen) {
            setIsLoading(false);
            setOpportunities([]);
            setError('');
            setKeyword('');
            setAffiliateLink('');
        }
    }, [isOpen]);

    const findOpportunities = async () => {
        if (!task) return;
        setIsLoading(true);
        setError('');
        setOpportunities([]);
        
        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                 throw new Error("API Key (process.env.API_KEY) is not configured for the AI Opportunity Analyst.");
            }

            const ai = new GoogleGenAI({ apiKey });
            
            const fullPrompt = `分析以下视频主题：“${task.prompt}”。识别出3个最相关、最具商业价值的联盟营销关键词。以JSON数组的形式回复，数组中只包含字符串。例如：["游戏鼠标", "机械键盘", "4K网络摄像头"]`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: { responseMimeType: "application/json" }
            });
            const text = response.text.trim();
            const parsedOpportunities = JSON.parse(text);

            if (Array.isArray(parsedOpportunities)) {
                setOpportunities(parsedOpportunities);
            } else {
                throw new Error("AI返回了非数组格式的数据。");
            }
        } catch (e: any) {
            console.error("Error finding opportunities:", e);
            setError('AI分析失败: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (!keyword || !affiliateLink) {
            alert("关键词和联盟链接都不能为空。");
            return;
        }
        onSaveRule({
            keyword: keyword,
            affiliate_link: affiliateLink,
            is_active: true
        });
    };

    if (!isOpen || !task) return null;
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity p-4" onClick={onClose}>
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-2xl p-6 border border-dark-border" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">AI 商机分析</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                
                <div className="bg-gray-900/50 p-3 rounded-md mb-4">
                    <p className="text-sm text-gray-400">分析视频主题:</p>
                    <p className="font-semibold text-white">{task.prompt}</p>
                </div>

                <button 
                    onClick={findOpportunities}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-brand-purple text-white font-semibold rounded-lg hover:bg-brand-purple/80 transition disabled:bg-gray-600"
                >
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    {isLoading ? 'AI分析中...' : '分析商机'}
                </button>

                <div className="mt-4 min-h-[120px]">
                    {isLoading && <div className="text-center text-gray-400 animate-pulse">AI 正在思考...</div>}
                    {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
                    {opportunities.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-white mb-2">AI 建议的关键词:</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {opportunities.map((opp, index) => (
                                    <button key={index} onClick={() => setKeyword(opp)} className="px-3 py-1 bg-gray-700 text-sm text-gray-200 rounded-full hover:bg-brand-blue hover:text-white transition">
                                        {opp}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-400">关键词</label>
                                    <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} className="w-full mt-1 bg-gray-900 border-dark-border rounded-md py-1.5 px-3 text-white"/>
                                </div>
                                 <div>
                                    <label className="text-xs font-medium text-gray-400">联盟链接</label>
                                    <input type="url" value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} placeholder="https://..." className="w-full mt-1 bg-gray-900 border-dark-border rounded-md py-1.5 px-3 text-white"/>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs mt-2">
                                <span className="text-gray-400">快速查找:</span>
                                <a href={`https://pub.alimama.com/promo/search/index.htm?q=${encodeURIComponent(keyword)}`} target="_blank" className="text-blue-400 hover:underline">淘宝联盟</a>
                                <a href={`https://union.jd.com/search?keyword=${encodeURIComponent(keyword)}`} target="_blank" className="text-blue-400 hover:underline">京东联盟</a>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={!keyword || !affiliateLink}
                        className="px-5 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition disabled:bg-gray-500 disabled:cursor-not-allowed">
                        一键创建规则
                    </button>
                </div>
            </div>
        </div>
    );
};
