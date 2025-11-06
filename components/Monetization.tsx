
import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { CashIcon, LinkIcon, UsersIcon, VideoCameraIcon } from './ui/Icons';
import type { Account, PerformanceMetric, GenerationTask } from '../types';

interface MonetizationProps {
    accounts: Account[];
    performanceMetrics: PerformanceMetric[];
    tasks: GenerationTask[];
    onNavigate: (view: string) => void;
}


export const Monetization: React.FC<MonetizationProps> = ({ accounts, performanceMetrics, tasks, onNavigate }) => {

    const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc])), [accounts]);
    const taskMap = useMemo(() => new Map(tasks.map(task => [task.id, task])), [tasks]);

    const videoRevenueData = useMemo(() => {
        let totalRevenue = 0;
        const revenueByAccount: { [key: string]: { name: string, revenue: number } } = {};

        performanceMetrics.forEach(metric => {
            const task = taskMap.get(metric.task_id);
            if (!task) return;

            const account = accountMap.get(task.account_id);
            if (account && account.estimated_ecpm_cny && account.estimated_ecpm_cny > 0) {
                const revenue = (metric.views / 1000) * account.estimated_ecpm_cny;
                totalRevenue += revenue;

                if (!revenueByAccount[account.id]) {
                    revenueByAccount[account.id] = { name: account.username, revenue: 0 };
                }
                revenueByAccount[account.id].revenue += revenue;
            }
        });

        return {
            totalRevenue,
            topAccount: Object.values(revenueByAccount).sort((a, b) => b.revenue - a.revenue)[0] || { name: 'N/A', revenue: 0 }
        };
    }, [accounts, performanceMetrics, tasks, accountMap, taskMap]);

    const affiliateData = {
        totalRevenue: 4782.59,
        clicks: 12450,
        topPerformer: 'Tech Gadget Pro',
        conversionRate: 0.035
    };

    const saasData = useMemo(() => {
        const watermarkedAccountIds = new Set(accounts.filter(a => a.enable_saas_watermark).map(a => a.id));
        const watermarkedTaskIds = new Set(tasks.filter(t => watermarkedAccountIds.has(t.account_id)).map(t => t.id));
        const totalPromotionalViews = performanceMetrics
            .filter(p => watermarkedTaskIds.has(p.task_id))
            .reduce((sum, p) => sum + p.views, 0);

        return {
            promotionalReach: totalPromotionalViews,
        };
    }, [accounts, tasks, performanceMetrics]);
    
    const formatLargeNumber = (num: number) => {
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
        if (num >= 10000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">盈利引擎</h1>
                <p className="text-gray-400 mt-1">将内容自动转化为收入流。</p>
            </div>

            <Card>
                <div className="flex items-center space-x-3 mb-4">
                    <VideoCameraIcon className="h-6 w-6 text-brand-blue" />
                    <h2 className="text-xl font-semibold text-white">视频内容收入 (预估)</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    基于您在“账号管理”中为每个账户设置的“千次观看预估收入(eCPM)”自动计算。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-xs text-gray-400">预估总收入 (全周期)</p>
                        <p className="text-2xl font-bold text-green-400">¥{videoRevenueData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-xs text-gray-400">收入最高账号</p>
                        <p className="text-lg font-bold text-white truncate">{videoRevenueData.topAccount.name}</p>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center space-x-3 mb-4">
                    <LinkIcon className="h-6 w-6 text-green-300" />
                    <h2 className="text-xl font-semibold text-white">联盟链接自动化</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    系统会自动识别内容中的产品，获取联盟链接，并将其插入到描述中以产生被动收入。
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-xs text-gray-400">总收入 (30天)</p>
                        <p className="text-2xl font-bold text-green-400">¥{affiliateData.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-xs text-gray-400">总点击量 (30天)</p>
                        <p className="text-2xl font-bold text-white">{affiliateData.clicks.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-xs text-gray-400">转化率</p>
                        <p className="text-2xl font-bold text-white">{(affiliateData.conversionRate * 100).toFixed(2)}%</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-xs text-gray-400">表现最佳链接</p>
                        <p className="text-lg font-bold text-white truncate">{affiliateData.topPerformer}</p>
                    </div>
                </div>
                <button 
                    onClick={() => onNavigate('affiliateManagement')}
                    className="mt-4 px-4 py-2 bg-green-600/80 text-white font-semibold rounded-lg hover:bg-green-600 transition">
                    管理联盟链接规则
                </button>
            </Card>
            
            <Card>
                <div className="flex items-center space-x-3 mb-4">
                    <UsersIcon className="h-6 w-6 text-blue-300" />
                    <h2 className="text-xl font-semibold text-white">SaaS 增长飞轮</h2>
                </div>
                 <p className="text-sm text-gray-400 mb-4">
                    通过在您发布的视频中自动添加品牌水印和推广链接，将您的内容矩阵转化为获取潜在SaaS客户的强大引擎。
                </p>
                 <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                     <div className="bg-gray-900/50 p-6 rounded-lg text-center">
                        <p className="text-sm text-gray-400">推广内容总触达量 (总观看数)</p>
                        <p className="text-5xl font-bold text-blue-300 my-2">{formatLargeNumber(saasData.promotionalReach)}</p>
                        <p className="text-xs text-gray-500">数据来自所有开启了“推广水印”的账号。</p>
                    </div>
                </div>
                 <button 
                    onClick={() => onNavigate('accounts')}
                    className="mt-6 w-full px-4 py-2 bg-blue-600/80 text-white font-semibold rounded-lg hover:bg-blue-600 transition">
                    配置推广水印
                </button>
            </Card>

        </div>
    );
};
