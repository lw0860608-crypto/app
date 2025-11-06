import React, { useState, useEffect } from 'react';
import { ExecutionNode, NodeType } from '../types';

interface AddNodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (nodeData: Omit<ExecutionNode, 'id' | 'status' | 'last_heartbeat' | 'created_at'> | ExecutionNode) => void;
    nodeToEdit?: ExecutionNode | null;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({ isOpen, onClose, onSave, nodeToEdit }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('Global');
    const [nodeType, setNodeType] = useState<NodeType>(NodeType.Server);
    
    const isEditing = !!nodeToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && nodeToEdit) {
                setName(nodeToEdit.name);
                setLocation(nodeToEdit.location);
                setNodeType(nodeToEdit.node_type || NodeType.Server);
            } else {
                setName('');
                setLocation('Global');
                setNodeType(NodeType.Server);
            }
        }
    }, [isOpen, nodeToEdit, isEditing]);


    const handleSave = () => {
        if (!name || !location) return;

        const nodeData = { name, location, node_type: nodeType };
        
        if (isEditing && nodeToEdit) {
            onSave({ ...nodeToEdit, ...nodeData });
        } else {
            onSave(nodeData);
        }
    };

    const nodeTypeDescriptions: Record<NodeType, string> = {
        [NodeType.Server]: "传统的云服务器，用于大规模、稳定的内容生成。",
        [NodeType.MobileProxy]: "在手机或模拟器上运行，使用移动网络IP发布，以最大限度地模拟真实用户行为。",
        [NodeType.DesktopCompanion]: "在您的个人电脑上运行，使用家庭/办公室网络IP进行发布，是最高级的拟人化策略。",
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-md p-6 border border-dark-border" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{isEditing ? '编辑节点' : '添加新节点'}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">节点类型</label>
                        <select
                            value={nodeType}
                            onChange={(e) => setNodeType(e.target.value as NodeType)}
                            className="w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                        >
                            <option value={NodeType.Server}>服务器节点</option>
                            <option value={NodeType.MobileProxy}>移动代理节点</option>
                            <option value={NodeType.DesktopCompanion}>桌面伴侣节点</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                           {nodeTypeDescriptions[nodeType]}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">节点名称</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例如：上海服务器 或 我的电脑"
                            className="w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">位置标签</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="例如：CN 或 HomePC"
                            className="w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                        />
                         <p className="text-xs text-gray-400 mt-1">使用一个简单的标签，以便您的自动化工作流可以识别使用哪个节点（例如：'CN', 'Global'）。</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition">保存节点</button>
                </div>
            </div>
        </div>
    );
};