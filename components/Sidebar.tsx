import React from 'react';
import { 
    HomeIcon, UserGroupIcon, BeakerIcon, ChipIcon, ChartBarIcon, CurrencyDollarIcon, 
    CogIcon, EyeIcon, PlayIcon, CollectionIcon, CodeIcon, GlobeIcon, LinkIcon,
    DesktopComputerIcon, BriefcaseIcon, ShieldCheckIcon, StorefrontIcon
} from './ui/Icons.tsx';
import { MindSparkIcon } from './ui/Icons.tsx';
import { supabase } from '../services/supabase.ts';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
    isSidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
    isSuperAdmin: boolean;
}

const NavLink: React.FC<{
    icon: React.ElementType;
    label: string;
    view: string;
    currentView: string;
    onNavigate: (view: string) => void;
}> = ({ icon: Icon, label, view, currentView, onNavigate }) => {
    const isActive = currentView === view;
    return (
        <a
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate(view); }}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-brand-blue/20 text-white font-semibold' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </a>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isSidebarOpen, setSidebarOpen, isSuperAdmin }) => {
    
    const navItems = [
        { icon: HomeIcon, label: '数据监控中心', view: 'dashboard', section: 'core' },
        { icon: PlayIcon, label: '内容任务中心', view: 'tasks', section: 'core' },
        { icon: UserGroupIcon, label: '账号管理', view: 'accounts', section: 'core' },
        { icon: ChipIcon, label: '执行节点', view: 'nodes', section: 'core' },
        { icon: ChartBarIcon, label: 'ROI与性能分析', view: 'analytics', section: 'core' },
        
        { icon: CurrencyDollarIcon, label: '盈利引擎', view: 'monetization', section: 'growth' },
        { icon: LinkIcon, label: '联盟链接规则', view: 'affiliateManagement', section: 'growth' },
        { icon: BeakerIcon, label: 'AI战略大脑', view: 'strategy', section: 'growth' },

        { icon: CodeIcon, label: '任务编排器', view: 'orchestrator', section: 'ops' },
        { icon: CollectionIcon, label: '中央素材库', view: 'assets', section: 'ops' },
        { icon: GlobeIcon, label: '工作流管理', view: 'workflows', section: 'ops' },
        
        { icon: BriefcaseIcon, label: '平台管理', view: 'platforms', section: 'advanced' },
        { icon: StorefrontIcon, label: 'AI 模型市场', view: 'apiMarketplace', section: 'advanced' },
        { icon: CogIcon, label: '部署与运维', view: 'deployment', section: 'advanced' },
        { icon: DesktopComputerIcon, label: '桌面监控模式', view: 'companion', section: 'advanced' },
        { icon: EyeIcon, label: '项目进化之路', view: 'vision', section: 'advanced' },
    ];

    return (
        <>
            <div className={`fixed inset-0 bg-black/50 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
            <aside className={`fixed top-0 left-0 w-64 bg-dark-card border-r border-dark-border h-full z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex-shrink-0 transition-transform duration-300 ease-in-out flex flex-col`}>
                <div className="flex items-center space-x-3 p-4 border-b border-dark-border">
                     <div className="bg-gradient-to-tr from-brand-blue to-brand-purple p-2.5 rounded-lg">
                        <MindSparkIcon className="h-6 w-6 text-white"/>
                    </div>
                    <h1 className="text-xl font-bold text-white">一青里AI工作室</h1>
                </div>
                <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">核心</h3>
                        {navItems.filter(i => i.section === 'core').map(item => <NavLink key={item.view} {...item} currentView={currentView} onNavigate={onNavigate} />)}
                    </div>
                    <div>
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">增长</h3>
                        {navItems.filter(i => i.section === 'growth').map(item => <NavLink key={item.view} {...item} currentView={currentView} onNavigate={onNavigate} />)}
                    </div>
                     <div>
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">运维</h3>
                        {navItems.filter(i => i.section === 'ops').map(item => <NavLink key={item.view} {...item} currentView={currentView} onNavigate={onNavigate} />)}
                    </div>
                     <div>
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">高级</h3>
                        {navItems.filter(i => i.section === 'advanced').map(item => <NavLink key={item.view} {...item} currentView={currentView} onNavigate={onNavigate} />)}
                    </div>
                     {isSuperAdmin && (
                        <div>
                             <h3 className="px-3 text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 mt-4">超管</h3>
                            <NavLink icon={ShieldCheckIcon} label="用户管理" view="userManagement" currentView={currentView} onNavigate={onNavigate} />
                        </div>
                    )}
                </nav>
                 <div className="p-4 border-t border-dark-border">
                    <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="w-full text-left text-gray-400 hover:text-white transition-colors">退出登录</button>
                    <p className="text-xs text-gray-600 mt-2">v8.0 智能API网关</p>
                </div>
            </aside>
        </>
    );
};