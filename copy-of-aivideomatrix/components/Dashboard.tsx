
import React, { useMemo, useState } from 'react';
import { Card } from './ui/Card.tsx';
// FIX: Import TaskStatus enum directly, not just its type.
// FIX: Added .ts extension to resolve module not found error.
import { Platform, TaskStatus, type Account, type GenerationTask, type ExecutionNode, type PerformanceMetric } from '../types.ts';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PlatformIcon } from './ui/PlatformIcons.tsx';
// FIX: Added .tsx extension to resolve module not found error.
import { CheckCircleIcon, ClockIcon, ExclamationIcon, PlayIcon, TerminalIcon, BanIcon, CurrencyDollarIcon, CheckIcon as CheckIconPlain, SparklesIcon, EyeIcon, VideoCameraIcon, ChipIcon } from './ui/Icons.tsx';

interface DashboardProps {
    accounts: Account[];
    tasks: GenerationTask[];
    nodes: ExecutionNode[];
    performanceMetrics: PerformanceMetric[];
    onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
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

const getActivityIcon = (status: GenerationTask['status']) => {
    switch (status) {
        case 'Published': return CheckCircleIcon;
        case 'Generating': return PlayIcon;
        case 'Failed': return ExclamationIcon;
        case 'Scheduled': return ClockIcon;
        default: return TerminalIcon;
    }
};

const KpiCard: React.FC<{title: string, value: string | number, icon: React.ReactNode}> = ({ title, value, icon }) => (
    <Card className="flex items-center space-x-4">
        {icon}
        <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="mt-1 text-3xl font-semibold text-white">{value}</p>
        </div>
    </Card>
);

const PIE_CHART_COLORS = {
    [TaskStatus.Published]: '#10B981',
    [TaskStatus.Generating]: '#06B6D4',
    [TaskStatus.Assembling]: '#6366F1',
    [TaskStatus.Uploading]: '#3B82F6',
    [TaskStatus.Pending]: '#F59E0B',
    [TaskStatus['Pending Approval']]: '#F97316',
    [TaskStatus.Failed]: '#EF4444',
    [TaskStatus.Scheduled]: '#8B5CF6',
    [TaskStatus.Approved]: '#14B8A6',
    [TaskStatus.Rejected]: '#6B7280',
    [TaskStatus['Takedown Pending']]: '#F87171',
    [TaskStatus['Takedown Complete']]: '#4B5563'
};


export const Dashboard: React.FC<DashboardProps> = ({ accounts, tasks, nodes, performanceMetrics, onUpdateTaskStatus }) => {
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    
    const uniqueStyles = useMemo(() => [...new Set(accounts.map(a => a.content_style).filter(Boolean))], [accounts]);

    const filteredData = useMemo(() => {
        let filteredAccounts = accounts;
        if (selectedPlatforms.length > 0) {
            filteredAccounts = filteredAccounts.filter(acc => selectedPlatforms.includes(acc.platform));
        }
        if (selectedStyles.length > 0) {
            filteredAccounts = filteredAccounts.filter(acc => acc.content_style && selectedStyles.includes(acc.content_style));
        }
        if (selectedAccounts.length > 0) {
            filteredAccounts = filteredAccounts.filter(acc => selectedAccounts.includes(acc.id));
        }

        const filteredAccountIds = new Set(filteredAccounts.map(acc => acc.id));
        
        const filteredTasks = tasks.filter(task => filteredAccountIds.has(task.account_id));
        const filteredTaskIds = new Set(filteredTasks.map(task => task.id));
        
        const filteredMetrics = performanceMetrics.filter(metric => filteredTaskIds.has(metric.task_id));

        return { accounts: filteredAccounts, tasks: filteredTasks, performanceMetrics: filteredMetrics };
    }, [accounts, tasks, performanceMetrics, selectedPlatforms, selectedAccounts, selectedStyles]);
    
    const { tasks: filteredTasks, performanceMetrics: filteredMetrics, accounts: filteredAccountsForFilter } = filteredData;

    const approvalTasks = useMemo(() => filteredTasks.filter(task => task.status === 'Pending Approval'), [filteredTasks]);
    const onlineNodes = getOnlineNodesCount(nodes);
    
    const totalCostLast30Days = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return filteredTasks
            .filter(task => new Date(task.created_at) > thirtyDaysAgo && task.estimated_cost)
            .reduce((sum, task) => sum + (task.estimated_cost || 0), 0);
    }, [filteredTasks]);

    const kpiData = useMemo(() => {
        const totalViews = filteredMetrics.reduce((sum, metric) => sum + metric.views, 0);
        const totalPublished = filteredTasks.filter(task => task.status === 'Published').length;
        
        const formatLargeNumber = (num: number) => {
            if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
            if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
            return num;
        };

        return {
            totalViews: formatLargeNumber(totalViews),
            totalPublished: totalPublished.toLocaleString(),
            onlineNodes: `${onlineNodes}/${nodes.length}`,
            monthlyCost: `¥${totalCostLast30Days.toFixed(2)}`
        };
    }, [filteredMetrics, filteredTasks, onlineNodes, nodes.length, totalCostLast30Days]);

    const taskStatusDistribution: { name: TaskStatus; value: number }[] = useMemo(() => {
        const statusCounts = filteredTasks.reduce((acc, task) => {
            const status = task.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<TaskStatus, number>);
        
        // FIX: Explicitly cast value to number to resolve type inference issue.
        return Object.entries(statusCounts).map(([name, value]) => ({ name: name as TaskStatus, value: value as number }));
    }, [filteredTasks]);
    
    const recentActivity = useMemo(() => {
        const accountMap = new Map(accounts.map(acc => [acc.id, acc]));
        return [...filteredTasks]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map(task => ({
                ...task,
                account: accountMap.get(task.account_id)
            }));
    }, [filteredTasks, accounts]);

    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        const values = Array.from(e.target.selectedOptions, option => option.value);
        setter(values);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">数据监控中心</h1>
            
            <Card className="!p-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-400">平台筛选</label>
                        <select multiple onChange={handleFilterChange(setSelectedPlatforms)} value={selectedPlatforms} className="w-full mt-1 bg-gray-900 border-dark-border rounded-md text-sm h-24">
                            {Object.values(Platform).map((p: Platform) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-400">账号筛选</label>
                        <select multiple onChange={handleFilterChange(setSelectedAccounts)} value={selectedAccounts} className="w-full mt-1 bg-gray-900 border-dark-border rounded-md text-sm h-24">
                           {accounts.map((a: Account) => <option key={a.id} value={a.id}>{a.username}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-400">内容风格筛选</label>
                        <select multiple onChange={handleFilterChange(setSelectedStyles)} value={selectedStyles} className="w-full mt-1 bg-gray-900 border-dark-border rounded-md text-sm h-24">
                            {uniqueStyles.map((s: string) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="总观看数 (筛选后)" value={kpiData.totalViews} icon={<EyeIcon className="h-8 w-8 text-brand-blue"/>} />
                <KpiCard title="已发布视频 (筛选后)" value={kpiData.totalPublished} icon={<VideoCameraIcon className="h-8 w-8 text-brand-purple"/>} />
                <KpiCard title="节点在线状态" value={kpiData.onlineNodes} icon={<ChipIcon className={`h-8 w-8 ${onlineNodes > 0 ? 'text-green-400' : 'text-red-400'}`}/>} />
                <KpiCard title="预估月成本 (筛选后)" value={kpiData.monthlyCost} icon={<CurrencyDollarIcon className="h-8 w-8 text-green-400"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4">任务状态分布 (筛选后)</h3>
                    {taskStatusDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={taskStatusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }: any) => `${name} (${(Number(percent || 0) * 100).toFixed(0)}%)`}>
                                    {taskStatusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[entry.name as keyof typeof PIE_CHART_COLORS] || '#8884d8'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }} formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-center text-gray-500 py-12">无任务数据以显示图表。</p>}
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">最近活动</h3>
                    {recentActivity.length > 0 ? (
                        <ul className="space-y-3">
                            {recentActivity.map(task => {
                                const Icon = getActivityIcon(task.status);
                                return (
                                <li key={task.id} className="flex items-start space-x-3">
                                    <Icon className="h-5 w-5 mt-0.5 text-gray-500 flex-shrink-0" />
                                    <div className="flex-grow overflow-hidden">
                                        <p className="text-sm text-gray-300">
                                            <span className="font-semibold text-white">{task.status}</span> on <span className="font-semibold text-white">{task.account?.username || '...'}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 truncate" title={task.prompt}>{task.prompt}</p>
                                    </div>
                                </li>
                            )})}
                        </ul>
                    ) : <p className="text-center text-gray-500 py-12">无最近活动。</p>}
                </Card>
            </div>
            
            {approvalTasks.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <SparklesIcon className="h-6 w-6 text-yellow-400" />
                        <span>待您审批 ({approvalTasks.length})</span>
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <tbody className="divide-y divide-dark-border">
                                {approvalTasks.map(task => {
                                    const account = accounts.find(a => a.id === task.account_id);
                                    return (
                                        <tr key={task.id} className="hover:bg-gray-700/50">
                                            <td className="p-3 whitespace-nowrap">
                                                {account && <div className="flex items-center space-x-2"><PlatformIcon platform={account.platform} className="h-5 w-5" /><span className="text-sm text-white">{account.username}</span></div>}
                                            </td>
                                            <td className="p-3">
                                                <p className="text-sm text-gray-300 truncate max-w-lg" title={task.prompt}>{task.prompt}</p>
                                            </td>
                                            <td className="p-3 whitespace-nowrap text-sm font-mono text-white">¥{task.estimated_cost?.toFixed(2) ?? 'N/A'}</td>
                                            <td className="p-3 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button onClick={() => onUpdateTaskStatus(task.id, TaskStatus.Approved)} className="p-1.5 rounded-md text-green-400 hover:bg-green-400/20" title="批准"><CheckIconPlain className="h-5 w-5"/></button>
                                                    <button onClick={() => onUpdateTaskStatus(task.id, TaskStatus.Rejected)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/20" title="拒绝"><BanIcon className="h-5 w-5"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

        </div>
    );
};
