
import React, { useMemo, useState, useEffect } from 'react';
import { Card } from './ui/Card';
import type { GenerationTask, ExecutionNode, PerformanceMetric } from '../types';
import { EyeIcon, VideoCameraIcon, ChipIcon, CurrencyDollarIcon, RssIcon, CheckCircleIcon, PlayIcon, ExclamationIcon, ClockIcon, TerminalIcon, ArrowLeftIcon } from './ui/Icons';
import { supabase } from '../services/supabase';

interface DesktopCompanionProps {
    tasks: GenerationTask[];
    nodes: ExecutionNode[];
    performanceMetrics: PerformanceMetric[];
    onNavigate: (view: string) => void;
}

const getOnlineNodesCount = (nodes: ExecutionNode[]) => {
    if (!nodes) return 0;
    return nodes.filter(node => {
        if (!node.last_heartbeat) return false;
        const lastHeartbeat = new Date(node.last_heartbeat).getTime();
        const now = new Date().getTime();
        return (now - lastHeartbeat) / (1000 * 60) <= 5;
    }).length;
};

const KpiCard: React.FC<{title: string, value: string | number, icon: React.ReactNode}> = ({ title, value, icon }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg flex items-center space-x-4">
        {icon}
        <div>
            <h3 className="text-xs font-medium text-gray-400">{title}</h3>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
    </div>
);

const getActivityIcon = (status: GenerationTask['status']) => {
    switch (status) {
        case 'Published': return CheckCircleIcon;
        case 'Generating': return PlayIcon;
        case 'Failed': return ExclamationIcon;
        case 'Scheduled': return ClockIcon;
        default: return TerminalIcon;
    }
};

export const DesktopCompanion: React.FC<DesktopCompanionProps> = ({ tasks, nodes, performanceMetrics, onNavigate }) => {
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        setLastUpdated(new Date());
    }, [tasks, nodes, performanceMetrics]);

    const onlineNodes = getOnlineNodesCount(nodes);
    
    const totalCostLast30Days = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return tasks
            .filter(task => new Date(task.created_at) > thirtyDaysAgo && task.estimated_cost)
            .reduce((sum, task) => sum + (task.estimated_cost || 0), 0);
    }, [tasks]);

    const kpiData = useMemo(() => {
        const totalViews = performanceMetrics.reduce((sum, metric) => sum + metric.views, 0);
        const totalPublished = tasks.filter(task => task.status === 'Published').length;
        
        const formatLargeNumber = (num: number) => {
            if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
            if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
            return num;
        };

        return {
            totalViews: formatLargeNumber(totalViews),
            totalPublished: totalPublished.toLocaleString(),
            onlineNodes: `${onlineNodes}/${nodes.length}`,
            monthlyCost: `$${totalCostLast30Days.toFixed(2)}`
        };
    }, [performanceMetrics, tasks, onlineNodes, nodes.length, totalCostLast30Days]);

    const recentActivity = useMemo(() => {
        return [...tasks]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
    }, [tasks]);

    const [accountMap, setAccountMap] = useState<Map<string, { username: string; platform: string }>>(new Map());

    useEffect(() => {
        const fetchAccountsForRecentActivity = async () => {
            if (!supabase || recentActivity.length === 0) return;
            const accountIds = [...new Set(recentActivity.map(t => t.account_id))];
            const { data: accountsData, error } = await supabase
                .from('accounts')
                .select('id, username, platform')
                .in('id', accountIds);
            
            if (error) {
                console.error("Error fetching accounts for companion:", error);
                return;
            }

            const newMap = new Map();
            accountsData.forEach(acc => newMap.set(acc.id, { username: acc.username, platform: acc.platform }));
            setAccountMap(newMap);
        };
        
        fetchAccountsForRecentActivity();
    }, [recentActivity]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">实时监控面板</h1>
                <p className="text-gray-400 mt-1">这是一个专为桌面小窗口或第二屏幕设计的紧凑视图。</p>
            </div>
            <Card className="!p-0 max-w-2xl mx-auto">
                <div className="p-4 border-b border-dark-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">系统状态</h2>
                    <div className="flex items-center space-x-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-green-400">实时</span>
                    </div>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard title="总观看数" value={kpiData.totalViews} icon={<EyeIcon className="h-6 w-6 text-brand-blue"/>} />
                        <KpiCard title="已发布" value={kpiData.totalPublished} icon={<VideoCameraIcon className="h-6 w-6 text-brand-purple"/>} />
                        <KpiCard title="节点状态" value={kpiData.onlineNodes} icon={<ChipIcon className={`h-6 w-6 ${onlineNodes > 0 ? 'text-green-400' : 'text-red-400'}`}/>} />
                        <KpiCard title="成本 (30天)" value={kpiData.monthlyCost} icon={<CurrencyDollarIcon className="h-6 w-6 text-green-400"/>} />
                    </div>
                </div>
                <div className="p-4 border-t border-dark-border">
                    <div className="flex items-center space-x-2 mb-3">
                        <RssIcon className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-white">最近活动</h3>
                    </div>
                    <ul className="space-y-2">
                        {recentActivity.map(task => {
                            const account = accountMap.get(task.account_id);
                            const Icon = getActivityIcon(task.status);
                            return (
                                <li key={task.id} className="flex items-start space-x-3 p-2 bg-gray-900/50 rounded-md text-xs">
                                    <Icon className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                                    <div className="flex-grow overflow-hidden">
                                        <p className="text-gray-300">
                                            <span className="font-semibold text-white">{`任务 ${task.status}`}</span> 为 <span className="font-semibold text-white">{account?.username || '...'}</span>
                                        </p>
                                        <p className="text-gray-500 truncate" title={task.prompt}>{task.prompt}</p>
                                    </div>
                                    <div className="text-gray-500 flex-shrink-0">{new Date(task.created_at).toLocaleTimeString()}</div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                 <div className="p-2 border-t border-dark-border text-center">
                    <p className="text-xs text-gray-500">最后更新于: {lastUpdated.toLocaleString()}</p>
                </div>
            </Card>
            <div className="mt-6 text-center">
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="inline-flex items-center px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    返回主仪表盘
                </button>
            </div>
        </div>
    );
};
