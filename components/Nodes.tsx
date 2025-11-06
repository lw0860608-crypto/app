
import React, { useState, useEffect } from 'react';
import type { ExecutionNode } from '../types';
import { NodeType } from '../types';
import { Card } from './ui/Card';
import { PlusIcon, PencilIcon, TrashIcon, ClipboardIcon, CheckIcon, ChipIcon, DevicePhoneMobileIcon, DesktopComputerIcon } from './ui/Icons';
import { supabase } from '../services/supabase';
import { AddNodeModal } from './AddNodeModal';

interface NodesProps {
    nodes: ExecutionNode[];
    refreshNodes: () => void;
}

const getNodeStatus = (node: ExecutionNode) => {
    if (!node.last_heartbeat) {
        return { label: '离线', color: 'bg-gray-500/20 text-gray-400' };
    }
    const lastHeartbeat = new Date(node.last_heartbeat).getTime();
    const now = new Date().getTime();
    const minutesSince = (now - lastHeartbeat) / (1000 * 60);

    if (minutesSince <= 5) {
        return { label: '在线', color: 'bg-green-500/20 text-green-400' };
    }
    return { label: '离线', color: 'bg-red-500/20 text-red-400' };
};

const NodeTypeDisplay: React.FC<{type: NodeType}> = ({ type }) => {
    const displayConfig = {
        [NodeType.Server]: { icon: ChipIcon, text: '服务器', color: 'text-cyan-400' },
        [NodeType.MobileProxy]: { icon: DevicePhoneMobileIcon, text: '移动代理', color: 'text-green-400' },
        [NodeType.DesktopCompanion]: { icon: DesktopComputerIcon, text: '桌面伴侣', color: 'text-blue-400' },
    };

    const config = displayConfig[type] || displayConfig[NodeType.Server];
    const Icon = config.icon;

    return (
        <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${config.color}`} />
            <span className="text-sm text-white">{config.text}</span>
        </div>
    );
};

export const Nodes: React.FC<NodesProps> = ({ nodes, refreshNodes }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNode, setEditingNode] = useState<ExecutionNode | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSaveNode = async (nodeData: Omit<ExecutionNode, 'id' | 'status' | 'last_heartbeat' | 'created_at'> | ExecutionNode) => {
        if (!supabase) return;

        if ('id' in nodeData) { // Edit
            const { error } = await supabase.from('execution_nodes').update({ name: nodeData.name, location: nodeData.location, node_type: nodeData.node_type }).eq('id', nodeData.id);
            if (error) console.error("Failed to update node:", error);
        } else { // Add
            const { error } = await supabase.from('execution_nodes').insert([{ name: nodeData.name, location: nodeData.location, node_type: nodeData.node_type }]);
            if (error) console.error("Failed to add node:", error);
        }
        refreshNodes();
        setIsModalOpen(false);
        setEditingNode(null);
    };
    
    const handleDeleteNode = async (nodeId: string) => {
        if (!supabase) return;
        if (window.confirm('您确定要删除此节点吗？')) {
            const { error } = await supabase.from('execution_nodes').delete().eq('id', nodeId);
            if (error) console.error("Failed to delete node:", error);
            else refreshNodes();
        }
    };
    
    const handleOpenAddModal = () => {
        setEditingNode(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (node: ExecutionNode) => {
        setEditingNode(node);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">执行节点</h1>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition-transform duration-200 hover:scale-105"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    添加新节点
                </button>
            </div>
             <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-border">
                        <thead className="bg-dark-card">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">节点名称 / ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">类型</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">位置标签</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">状态</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">上次心跳</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-dark-card divide-y divide-dark-border">
                             {nodes.length > 0 ? (
                                nodes.map((node) => {
                                    const status = getNodeStatus(node);
                                    return (
                                    <tr key={node.id} className="hover:bg-gray-700/50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-white">{node.name}</p>
                                            <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
                                                <span>{node.id.substring(0, 8)}...</span>
                                                <button onClick={() => handleCopyId(node.id)} className="text-gray-500 hover:text-white transition-colors">
                                                    {copiedId === node.id ? <CheckIcon className="h-4 w-4 text-green-400" /> : <ClipboardIcon className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <NodeTypeDisplay type={node.node_type} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-300">
                                                {node.location}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {node.last_heartbeat ? new Date(node.last_heartbeat).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center space-x-3">
                                                <button onClick={() => handleOpenEditModal(node)} className="text-blue-400 hover:text-blue-300 transition-colors">
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleDeleteNode(node.id)} className="text-red-500 hover:text-red-400 transition-colors">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )})
                             ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 px-6">
                                        <h3 className="text-lg font-semibold text-white">未找到任何执行节点</h3>
                                        <p className="text-gray-400 mt-1">点击“添加新节点”按钮来配置您的服务器。</p>
                                    </td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            </Card>
            <AddNodeModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingNode(null); }}
                onSave={handleSaveNode}
                nodeToEdit={editingNode}
            />
        </div>
    );
};