

import React, { useMemo, useState } from 'react';
import { Card } from './ui/Card';
import type { Account, GenerationTask, PerformanceMetric } from '../types';
import { Platform } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { CurrencyDollarIcon, SparklesIcon, ChartBarIcon, ScaleIcon } from './ui/Icons';
import { PlatformIcon } from './ui/PlatformIcons';

const COLORS = ['#00B2FF', '#8E44AD', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface AnalyticsProps {
    accounts: Account[];
    tasks: GenerationTask[];
    performanceMetrics: PerformanceMetric[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ accounts, tasks, performanceMetrics }) => {
    
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
            filteredAccounts = filteredAccounts.filter(acc => selectedStyles.includes(acc.content_style));
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
    
    const { tasks: filteredTasks, performanceMetrics: filteredMetrics } = filteredData;


    const accountMap = useMemo(() => new Map(accounts.map((acc: Account) => [acc.id, acc])), [accounts]);
    const taskMap = useMemo(() => new Map(tasks.map(task => [task.id, task])), [tasks]);
    const performanceMap = useMemo(() => {
        const map = new Map<string, PerformanceMetric>();
        performanceMetrics.forEach(p => map.set(p.task_id, p));
        return map;
    }, [performanceMetrics]);

    const performanceOverTime = useMemo(() => {
        if (!filteredMetrics || filteredMetrics.length === 0) return [];
        const dataByDay: { [key: string]: { views: number, likes: number, comments: number } } = {};
        filteredMetrics.forEach(metric => {
            const day = new Date(metric.fetched_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (!dataByDay[day]) dataByDay[day] = { views: 0, likes: 0, comments: 0 };
            dataByDay[day].views += metric.views;
            dataByDay[day].likes += metric.likes;
            dataByDay[day].comments += metric.comments;
        });
        return Object.entries(dataByDay).map(([date, values]) => ({ name: date, ...values }))
            .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime()).slice(-30);
    }, [filteredMetrics]);

    const viewsByPlatform: { name: string; value: number }[] = useMemo(() => {
        if (!filteredMetrics.length) return [];
        const views: { [platform: string]: number } = {};
        filteredMetrics.forEach(metric => {
            const task = taskMap.get(metric.task_id);
            if(task) {
                const account = accountMap.get(task.account_id);
                if (account) {
                    if (!views[account.platform]) views[account.platform] = 0;
                    views[account.platform] += metric.views;
                }
            }
        });
        return Object.entries(views).map(([name, value]) => ({ name, value }));
    }, [filteredMetrics, taskMap, accountMap]);
    
    const performanceByStyle = useMemo(() => {
        if (!filteredMetrics.length || !filteredTasks.length) return [];
        const styles: { [style: string]: { views: number, cost: number, count: number } } = {};

        filteredMetrics.forEach(metric => {
            const task = taskMap.get(metric.task_id);
            if (task) {
                const account = accountMap.get(task.account_id);
                if (account && account.content_style) {
                    const style = account.content_style;
                    if (!styles[style]) styles[style] = { views: 0, cost: 0, count: 0 };
                    styles[style].views += metric.views;
                    styles[style].cost += task.estimated_cost || 0;
                    styles[style].count += 1;
                }
            }
        });

        return Object.entries(styles).map(([name, data]) => ({
            name,
            avgViews: data.count > 0 ? Math.round(data.views / data.count) : 0,
            costPer1kViews: data.views > 0 ? (data.cost / data.views) * 1000 : 0,
        }));
    }, [filteredMetrics, filteredTasks, taskMap, accountMap]);

    const { totalCost, avgCostPerVideo, mostCostEffectiveStyle } = useMemo(() => {
        const publishedTasksWithCost = filteredTasks.filter(t => t.status === 'Published' && t.estimated_cost);
        const totalCost = publishedTasksWithCost.reduce((sum, task) => sum + (task.estimated_cost || 0), 0);
        const avgCostPerVideo = publishedTasksWithCost.length > 0 ? totalCost / publishedTasksWithCost.length : 0;
        
        const mostEffective = performanceByStyle.length > 0 
            ? performanceByStyle.filter(s => s.costPer1kViews > 0).reduce((min, style) => style.costPer1kViews < min.costPer1kViews ? style : min, { name: 'N/A', costPer1kViews: Infinity })
            : { name: 'N/A' };

        return { totalCost, avgCostPerVideo, mostCostEffectiveStyle: mostEffective.name };
    }, [filteredTasks, performanceByStyle]);

    const abTests = useMemo(() => {
        const tests = new Map<string, GenerationTask[]>();
        filteredTasks.forEach(task => {
            if (task.variant_of_task_id) {
                if (!tests.has(task.variant_of_task_id)) {
                    const originalTask = taskMap.get(task.variant_of_task_id);
                    if (originalTask) tests.set(task.variant_of_task_id, [originalTask]);
                }
                tests.get(task.variant_of_task_id)?.push(task);
            }
        });
        return Array.from(tests.values());
    }, [filteredTasks, taskMap]);


    const renderABTestCard = (testTasks: GenerationTask[]) => {
        if (testTasks.length < 2) return null;
        const originalTask = testTasks[0];
        const variants = testTasks.slice(1);
        const originalMetrics = performanceMap.get(originalTask.id);
        const account = accounts.find(a => a.id === originalTask.account_id);

        return (
            <div className="bg-gray-900/50 p-4 rounded-lg border border-dark-border">
                <p className="text-sm text-gray-400">测试主题:</p>
                <p className="text-white font-semibold truncate mb-3" title={originalTask.prompt}>{originalTask.prompt}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[originalTask, ...variants].map(task => {
                        const metrics = performanceMap.get(task.id);
                        const costPer1k = (metrics && metrics.views > 0) ? ((task.estimated_cost || 0) / metrics.views) * 1000 : 0;
                        return (
                            <div key={task.id} className="bg-dark-card p-3 rounded-md">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-lg text-brand-blue">{task.ab_test_group ? `变体 ${task.ab_test_group}` : '对照组'}</span>
                                    {account && <PlatformIcon platform={account.platform} className="h-5 w-5"/>}
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p><span className="text-gray-400">观看数:</span> <span className="font-mono text-white">{metrics?.views.toLocaleString() || 'N/A'}</span></p>
                                    <p><span className="text-gray-400">点赞数:</span> <span className="font-mono text-white">{metrics?.likes.toLocaleString() || 'N/A'}</span></p>
                                    <p><span className="text-gray-400">千次观看成本:</span> <span className="font-mono text-white">¥{costPer1k.toFixed(4)}</span></p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        const values = Array.from(e.target.selectedOptions, option => option.value);
        setter(values);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">ROI与性能分析</h1>
            <p className="text-gray-400">通过对比成本与表现，识别出最具盈利能力的增长策略。</p>
            
            <Card className="!p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-400">平台筛选</label>
                        <select multiple onChange={handleFilterChange(setSelectedPlatforms)} className="w-full mt-1 bg-gray-900 border-dark-border rounded-md text-sm">
                            {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-400">账号筛选</label>
                        <select multiple onChange={handleFilterChange(setSelectedAccounts)} className="w-full mt-1 bg-gray-900 border-dark-border rounded-md text-sm">
                           {accounts.map(a => <option key={a.id} value={a.id}>{a.username}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-400">内容风格筛选</label>
                        <select multiple onChange={handleFilterChange(setSelectedStyles)} className="w-full mt-1 bg-gray-900 border-dark-border rounded-md text-sm">
                            {uniqueStyles.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center space-x-4">
                    <CurrencyDollarIcon className="h-10 w-10 text-green-400"/>
                    <div>
                        <h3 className="text-sm font-medium text-gray-400">总预估成本 (筛选后)</h3>
                        <p className="mt-1 text-3xl font-semibold text-white">¥{totalCost.toFixed(2)}</p>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4">
                     <CurrencyDollarIcon className="h-10 w-10 text-green-400"/>
                    <div>
                        <h3 className="text-sm font-medium text-gray-400">平均视频成本</h3>
                        <p className="mt-1 text-3xl font-semibold text-white">¥{avgCostPerVideo.toFixed(4)}</p>
                    </div>
                </Card>
                 <Card className="flex items-center space-x-4">
                    <SparklesIcon className="h-10 w-10 text-brand-purple"/>
                    <div>
                        <h3 className="text-sm font-medium text-gray-400">最高ROI内容风格</h3>
                        <p className="mt-1 text-2xl font-semibold text-white truncate">{mostCostEffectiveStyle}</p>
                    </div>
                </Card>
            </div>
            
            <Card>
                <div className="flex items-center space-x-3 mb-4">
                     <ScaleIcon className="h-6 w-6 text-brand-blue" />
                     <h2 className="text-xl font-semibold text-white">A/B测试：冠军 vs. 挑战者</h2>
                </div>
                {abTests.length > 0 ? (
                    <div className="space-y-4">
                        {abTests.map(test => renderABTestCard(test))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">尚未完成任何A/B测试。创建任务变体以在此处查看结果。</p>
                )}
            </Card>

            <Card className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4">整体表现 (30天内, 筛选后)</h3>
                 {performanceOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={performanceOverTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                            {/* FIX: Explicitly type the 'value' argument in tickFormatter to prevent type errors. */}
                            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value: number) => `${value / 1000}k`} />
                            {/* FIX: Safely handle 'unknown' type from recharts formatter by checking if value is a number. */}
                            {/* FIX: Change `unknown` to `any` to resolve recharts type error. */}
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }} formatter={(value: any) => (typeof value === 'number' ? value.toLocaleString() : value)} />
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Line type="monotone" dataKey="views" name="总观看数" stroke="#00B2FF" strokeWidth={2} />
                            <Line type="monotone" dataKey="likes" name="总点赞数" stroke="#00C49F" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                 ) : <p className="text-gray-500 text-center py-16">无足够性能数据以显示图表。</p>}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">各平台观看数占比 (筛选后)</h3>
                    {viewsByPlatform.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={viewsByPlatform} cx="50%" cy="50%" labelLine={false} outerRadius={110} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }: any) => `${name} (${(Number(percent || 0) * 100).toFixed(0)}%)`}>
                                    {viewsByPlatform.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                </Pie>
                                {/* FIX: Made the formatter more robust by handling cases where the value might not be a number, preventing potential type errors. */}
                                {/* FIX: Change `unknown` to `any` to resolve recharts type error. */}
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500 text-center py-12">无数据显示。</p>}
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">各内容风格ROI (筛选后)</h3>
                    {performanceByStyle.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={performanceByStyle}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                                {/* FIX: Explicitly typed the 'v' argument in tickFormatters to prevent type errors. */}
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={12} tickFormatter={(v: number) => `¥${v.toFixed(3)}`} />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={12} tickFormatter={(v: number) => `${v/1000}k`} />
                                {/* FIX: Explicitly typed 'value' and 'name' arguments in the Tooltip formatter for type safety. */}
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} formatter={(value: number, name: string) => name === '千次观看成本' ? `¥${value.toFixed(4)}` : value.toLocaleString()}/>
                                <Legend />
                                <Bar yAxisId="left" dataKey="costPer1kViews" name="千次观看成本" fill="#8884d8" />
                                <Bar yAxisId="right" dataKey="avgViews" name="平均观看数" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                     ) : <p className="text-gray-500 text-center py-12">无数据显示。请为账号添加“内容风格”并确保任务有成本数据。</p>}
                </Card>
            </div>
        </div>
    );
};
