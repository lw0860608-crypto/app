import React, { useState } from 'react';
import { Card } from './ui/Card';
import { LightBulbIcon, SparklesIcon, SearchCircleIcon, BeakerIcon } from './ui/Icons';
import { Platform, type TrendingVideo, type StrategyLog } from '../types';
import { PlatformIcon } from './ui/PlatformIcons';

interface StrategyBrainProps {
    trendingVideos: TrendingVideo[];
    onAnalyzeUrl: (url: string, platform: Platform) => void;
    strategyLogs: StrategyLog[];
}

const getStatusColor = (status: TrendingVideo['analysis_status']) => {
    switch (status) {
        case 'Completed': return 'text-green-400';
        case 'Processing': return 'text-cyan-400 animate-pulse';
        case 'Failed': return 'text-red-500';
        case 'Pending':
        default: return 'text-yellow-400';
    }
};

export const StrategyBrain: React.FC<StrategyBrainProps> = ({ trendingVideos, onAnalyzeUrl, strategyLogs }) => {
    const [url, setUrl] = useState('');
    const [platform, setPlatform] = useState<Platform>(Platform.YouTube);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) {
            alert('请输入一个视频URL。');
            return;
        }
        try {
            // Basic URL validation
            new URL(url);
            onAnalyzeUrl(url, platform);
            setUrl('');
        } catch (_) {
            alert('请输入一个有效的URL。');
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">AI战略大脑</h1>
                <p className="text-gray-400 mt-1">系统的自主和交互式核心，用于战略性内容决策。</p>
            </div>
            
            <Card>
                <div className="flex items-center space-x-3 mb-4">
                    <SearchCircleIcon className="h-6 w-6 text-brand-blue" />
                    <h2 className="text-xl font-semibold text-white">AI总监决策日志</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                   此日志显示AI总监自主执行的全网趋势分析和任务创建。执行节点会周期性地自动运行此逻辑，无需手动操作。
                </p>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-dark-border max-h-96 overflow-y-auto">
                    {strategyLogs.length > 0 ? (
                        <ul className="space-y-4">
                            {strategyLogs.map(log => (
                                <li key={log.id} className="text-sm border-b border-dark-border pb-3 last:border-b-0">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            <SparklesIcon className="h-5 w-5 text-purple-400" />
                                            <span className="font-semibold text-white">自主趋势分析</span>
                                            {log.accounts && (
                                                <span className="text-xs text-gray-400">({log.accounts.username})</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="pl-7 mt-1">
                                        {log.details.error ? (
                                             <p className="text-red-400 text-xs">执行失败: {log.details.error}</p>
                                        ) : (
                                            <>
                                                <p className="text-gray-300">基于对 <span className="font-semibold text-cyan-300">"{log.details.source_query}"</span> 的分析，新创建了 <span className="font-bold text-white">{log.details.tasks_created}</span> 个任务。</p>
                                                <p className="text-xs text-gray-400 mt-1">发现的主题: {log.details.found_topics?.join(', ')}</p>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-8">AI总监尚未做出任何决策。请确保至少有一个账号开启了“AI总监模式”并且执行节点正在运行。</p>
                    )}
                </div>
            </Card>

            <Card>
                 <div className="flex items-center space-x-3 mb-4">
                    <BeakerIcon className="h-6 w-6 text-cyan-300" />
                    <h2 className="text-xl font-semibold text-white">手动趋势分析</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    通过提供热门视频的链接来注入您自己的见解。AI将分析它们以学习新的风格、主题和格式，从而增强其自身的创作过程。这是引导AI学习的强大方式。
                </p>
                
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-gray-900/50 rounded-lg border border-dark-border">
                    <div className="w-full sm:w-2/5">
                        <label className="block text-xs font-medium text-gray-300 mb-1">平台</label>
                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value as Platform)}
                            className="w-full bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                        >
                           {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="flex-grow w-full">
                         <label className="block text-xs font-medium text-gray-300 mb-1">视频 URL</label>
                        <input 
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full bg-gray-800 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                        />
                    </div>
                    <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition">
                        提交分析
                    </button>
                </form>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-2">分析历史</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-border">
                            <thead className="bg-dark-card">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">平台</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">源 URL</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">提交于</th>
                                </tr>
                            </thead>
                            <tbody className="bg-dark-card divide-y divide-dark-border">
                                {trendingVideos.length > 0 ? trendingVideos.map(video => (
                                    <tr key={video.id} className="hover:bg-gray-700/50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <PlatformIcon platform={video.platform} className="h-5 w-5" />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            <a href={video.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue truncate max-w-xs block">{video.source_url}</a>
                                        </td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${getStatusColor(video.analysis_status)}`}>
                                            {video.analysis_status}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                                            {new Date(video.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-gray-500">
                                            尚未提交任何视频进行分析。
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>
        </div>
    );
};