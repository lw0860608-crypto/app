import React from 'react';
import type { GenerationTask, TaskSubStep, Account } from '../types';
import { Card } from './ui/Card';
import { PlatformIcon } from './ui/PlatformIcons';
import { CheckCircleIcon, ClockIcon, ExclamationIcon, PlayIcon } from './ui/Icons';

interface OrchestratorProps {
    tasks: GenerationTask[];
    subSteps: TaskSubStep[];
    accounts: Account[];
}

const getSubStepStatusIcon = (status: TaskSubStep['status']) => {
    switch (status) {
        case 'Completed':
            return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
        case 'In Progress':
            return <PlayIcon className="h-5 w-5 text-cyan-400 animate-pulse" />;
        case 'Failed':
            return <ExclamationIcon className="h-5 w-5 text-red-500" />;
        case 'Pending':
        default:
            return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
};


export const Orchestrator: React.FC<OrchestratorProps> = ({ tasks, subSteps, accounts }) => {
    const activeTasks = tasks.filter(t => ['Generating', 'Assembling', 'Uploading'].includes(t.status));
    // FIX: Memoize map creation for performance and stable type inference.
    const accountMap = React.useMemo(() => new Map(accounts.map(acc => [acc.id, acc])), [accounts]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">任务编排器</h1>
                <p className="text-gray-400 mt-1">实时查看所有正在进行中的、多步骤的视频生成任务。</p>
            </div>

            {activeTasks.length > 0 ? (
                <div className="space-y-6">
                    {activeTasks.map(task => {
                        const taskSubSteps = subSteps.filter(ss => ss.task_id === task.id);
                        const account = accountMap.get(task.account_id);
                        return (
                            <Card key={task.id}>
                                <div className="border-b border-dark-border pb-4 mb-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            {account && <PlatformIcon platform={account.platform} className="h-6 w-6" />}
                                            <div>
                                                <p className="font-semibold text-white text-lg">{account?.username || '未知账号'}</p>
                                                <p className="text-sm text-gray-400 truncate max-w-md" title={task.prompt}>指令: {task.prompt}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-cyan-300">{task.status}</p>
                                            <p className="text-xs text-gray-500">任务 ID: {task.id.substring(0,8)}...</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {taskSubSteps.length > 0 ? taskSubSteps.map(step => (
                                        <div key={step.id} className="flex items-center justify-between p-2 bg-gray-900/50 rounded-md">
                                            <div className="flex items-center space-x-3">
                                                {getSubStepStatusIcon(step.status)}
                                                <span className="font-medium text-white">{step.step_name}</span>
                                            </div>
                                            <span className="text-sm text-gray-400">{step.status}</span>
                                        </div>
                                    )) : (
                                        <p className="text-center text-gray-500 py-4">正在等待执行节点的子步骤更新...</p>
                                    )}
                                </div>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                 <Card>
                    <div className="text-center py-16">
                        <h2 className="text-xl font-semibold text-white">没有正在进行的任务</h2>
                        <p className="text-gray-400 mt-2">编排器当前空闲。所有任务都已排队、完成或失败。</p>
                    </div>
                </Card>
            )}
        </div>
    );
};