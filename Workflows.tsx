import React from 'react';
import { Card } from './ui/Card';
import type { Workflow } from '../types';
import { PlayIcon, PlusIcon } from './ui/Icons';

interface WorkflowsProps {
    workflows: Workflow[];
    onRunWorkflow: (workflowName: string) => void;
}

export const Workflows: React.FC<WorkflowsProps> = ({ workflows, onRunWorkflow }) => {
    
    // In the future, you could add functionality to add/edit workflows from the UI.
    const handleAddWorkflow = () => {
        alert("要添加新的工作流，请在您的Supabase数据库的'workflows'表中添加一个条目。'name'必须与您的n8n工作流使用的'workflow_type'完全匹配。");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">工作流管理</h1>
                    <p className="text-gray-400 mt-1">管理并手动触发您的n8n自动化工作流。</p>
                </div>
                <button
                    onClick={handleAddWorkflow}
                    className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    添加新工作流
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.length > 0 ? workflows.map(workflow => (
                    <Card key={workflow.id} className="flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-bold text-white mb-2">{workflow.name}</h2>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${workflow.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {workflow.status === 'active' ? '激活' : '禁用'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 min-h-[40px]">
                                {workflow.description || '无描述信息。'}
                            </p>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => onRunWorkflow(workflow.name)}
                                disabled={workflow.status !== 'active'}
                                className="w-full flex items-center justify-center px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                <PlayIcon className="h-5 w-5 mr-2" />
                                手动运行
                            </button>
                        </div>
                    </Card>
                )) : (
                    <Card className="md:col-span-2 lg:col-span-3">
                         <div className="text-center py-10 px-6">
                            <h3 className="text-lg font-semibold text-white">未找到工作流</h3>
                            <p className="text-gray-400 mt-1">请在您的Supabase数据库的'workflows'表中添加条目以在此处显示它们。</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};
