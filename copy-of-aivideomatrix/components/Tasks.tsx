import React, { useState, useMemo } from 'react';
// FIX: Imported AffiliateRule type to resolve its usage in handleSaveAffiliateRule.
import type { Account, GenerationTask, ExecutionNode, PerformanceMetric, AffiliateRule } from '../types';
import { TaskStatus } from '../types';
import { Card } from './ui/Card';
import { PlusIcon, PencilIcon, CheckIcon, BanIcon, SparklesIcon, ShareIcon, EyeOffIcon } from './ui/Icons';
import { PlatformIcon } from './ui/PlatformIcons';
import { CreateEditTaskModal } from './CreateEditTaskModal';
import { RepostTaskModal } from './RepostTaskModal';
import { AffiliateOpportunityModal } from './AffiliateOpportunityModal';
import { supabase } from '../services/supabase';

interface TasksProps {
    tasks: GenerationTask[];
    accounts: Account[];
    nodes: ExecutionNode[];
    performanceMetrics: PerformanceMetric[];
    refreshTasks: () => void;
    onTakedownTask: (taskId: string) => void;
}

const getStatusIndicator = (status: TaskStatus) => {
    const config = {
        [TaskStatus.Pending]: { text: '待处理', color: 'bg-yellow-500/20 text-yellow-300' },
        [TaskStatus['Pending Approval']]: { text: '待审批', color: 'bg-orange-500/20 text-orange-300' },
        [TaskStatus.Approved]: { text: '已批准', color: 'bg-teal-500/20 text-teal-300' },
        [TaskStatus.Rejected]: { text: '已拒绝', color: 'bg-gray-500/20 text-gray-400' },
        [TaskStatus.Scheduled]: { text: '已排期', color: 'bg-indigo-500/20 text-indigo-300' },
        [TaskStatus.Generating]: { text: '生成中', color: 'bg-cyan-500/20 text-cyan-300 animate-pulse' },
        [TaskStatus.Assembling]: { text: '合成中', color: 'bg-cyan-500/20 text-cyan-300 animate-pulse' },
        [TaskStatus.Uploading]: { text: '上传中', color: 'bg-blue-500/20 text-blue-300 animate-pulse' },
        [TaskStatus.Published]: { text: '已发布', color: 'bg-green-500/20 text-green-300' },
        [TaskStatus.Failed]: { text: '失败', color: 'bg-red-500/20 text-red-400' },
        [TaskStatus['Takedown Pending']]: { text: '下架中', color: 'bg-red-500/20 text-red-300 animate-pulse' },
        [TaskStatus['Takedown Complete']]: { text: '已下架', color: 'bg-gray-600/20 text-gray-300' },
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config[status]?.color || 'bg-gray-500/20 text-gray-400'}`}>{config[status]?.text || status}</span>;
};

export const Tasks: React.FC<TasksProps> = ({ tasks, accounts, nodes, performanceMetrics, refreshTasks, onTakedownTask }) => {
    const [isCreateEditModalOpen, setCreateEditModalOpen] = useState(false);
    const [isRepostModalOpen, setRepostModalOpen] = useState(false);
    const [isAffiliateModalOpen, setAffiliateModalOpen] = useState(false);

    const [editingTask, setEditingTask] = useState<GenerationTask | null>(null);
    const [repostSourceTask, setRepostSourceTask] = useState<GenerationTask | null>(null);
    const [affiliateAnalysisTask, setAffiliateAnalysisTask] = useState<GenerationTask | null>(null);
    
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const accountMap = useMemo(() => new Map(accounts.map(acc => [acc.id, acc])), [accounts]);
    const performanceMap = useMemo(() => new Map(performanceMetrics.map(pm => [pm.task_id, pm])), [performanceMetrics]);

    const filteredTasks = useMemo(() => {
        if (filterStatus === 'all') return tasks;
        return tasks.filter(t => t.status === filterStatus);
    }, [tasks, filterStatus]);
    
    const handleSaveTask = async (taskData: (Omit<GenerationTask, 'id' | 'created_at' | 'status'> & { account_ids: string[] }) | GenerationTask) => {
        if (!supabase) return;

        if ('id' in taskData) { // Edit
            const { error } = await supabase.from('generation_tasks').update(taskData).eq('id', taskData.id);
            if (error) console.error("Error updating task:", error);
        } else { // Create for multiple accounts
            const newTasks = taskData.account_ids.map(accId => ({
                prompt: taskData.prompt,
                account_id: accId,
                scheduled_for: taskData.scheduled_for,
                target_node_location: taskData.target_node_location,
                expires_at: taskData.expires_at,
            }));
            const { error } = await supabase.from('generation_tasks').insert(newTasks);
            if (error) console.error("Error creating tasks:", error);
        }
        setCreateEditModalOpen(false);
    };

    const handleRepost = async (originalTask: GenerationTask, targetAccountIds: string[]) => {
        const newTasks = targetAccountIds.map(accId => ({
            ...originalTask,
            account_id: accId,
            status: TaskStatus.Pending,
            variant_of_task_id: originalTask.id,
            published_at: null,
            video_url: null,
        }));
        // Remove keys that should not be copied
        newTasks.forEach(t => { delete (t as any).id; delete (t as any).created_at; });

        if (supabase) {
            await supabase.from('generation_tasks').insert(newTasks);
        }
        setRepostModalOpen(false);
    };
    
    const handleSaveAffiliateRule = async (rule: Omit<AffiliateRule, 'id' | 'created_at' | 'user_id'>) => {
        if (supabase) {
             await supabase.from('affiliate_rules').insert([rule]);
        }
        setAffiliateModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">内容任务中心</h1>
                <button onClick={() => { setEditingTask(null); setCreateEditModalOpen(true); }} className="flex items-center px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition-transform duration-200 hover:scale-105">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    创建新任务
                </button>
            </div>
            
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">状态筛选:</span>
                 <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus} className="bg-dark-card border-dark-border rounded-md text-sm px-2 py-1">
                    <option value="all">全部</option>
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-border">
                        <thead className="bg-dark-card">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">账号</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">任务指令</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">发布于 / 排期于</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-dark-card divide-y divide-dark-border">
                            {filteredTasks.length > 0 ? filteredTasks.map(task => {
                                const account = accountMap.get(task.account_id);
                                return (
                                <tr key={task.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {account && (
                                            <div className="flex items-center space-x-2">
                                                <PlatformIcon platform={account.platform} className="h-5 w-5" />
                                                <span className="text-sm font-medium text-white">{account.username}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-300 max-w-md truncate" title={task.prompt}>{task.prompt}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusIndicator(task.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{task.published_at ? new Date(task.published_at).toLocaleString() : (task.scheduled_for ? new Date(task.scheduled_for).toLocaleString() : 'N/A')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            {task.status === TaskStatus.Published && (
                                                <>
                                                    <button onClick={() => { setRepostSourceTask(task); setRepostModalOpen(true); }} className="p-1.5 rounded-md text-cyan-400 hover:bg-cyan-400/20" title="重发爆款"><ShareIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => { setAffiliateAnalysisTask(task); setAffiliateModalOpen(true); }} className="p-1.5 rounded-md text-purple-400 hover:bg-purple-400/20" title="分析商机"><SparklesIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => onTakedownTask(task.id)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/20" title="紧急下架"><EyeOffIcon className="h-5 w-5"/></button>
                                                </>
                                            )}
                                             {[TaskStatus.Pending, TaskStatus.Scheduled, TaskStatus.Rejected].includes(task.status) && (
                                                <button onClick={() => { setEditingTask(task); setCreateEditModalOpen(true); }} className="p-1.5 rounded-md text-blue-400 hover:bg-blue-400/20" title="编辑任务"><PencilIcon className="h-5 w-5"/></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">
                                        没有找到符合条件的任务。
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <CreateEditTaskModal isOpen={isCreateEditModalOpen} onClose={() => setCreateEditModalOpen(false)} onSave={handleSaveTask} taskToEdit={editingTask} accounts={accounts} nodes={nodes} />
            <RepostTaskModal isOpen={isRepostModalOpen} onClose={() => setRepostModalOpen(false)} onSave={handleRepost} originalTask={repostSourceTask} accounts={accounts} />
            <AffiliateOpportunityModal isOpen={isAffiliateModalOpen} onClose={() => setAffiliateModalOpen(false)} task={affiliateAnalysisTask} onSaveRule={handleSaveAffiliateRule} />
        </div>
    );
};
