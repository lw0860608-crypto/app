
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase.ts';
import type { Session, User } from '@supabase/supabase-js';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { Accounts } from './components/Accounts.tsx';
import { Tasks } from './components/Tasks.tsx';
import { Nodes } from './components/Nodes.tsx';
import { Analytics } from './components/Analytics.tsx';
import { Monetization } from './components/Monetization.tsx';
import { Vision } from './components/Vision.tsx';
import { StrategyBrain } from './components/StrategyBrain.tsx';
import { Orchestrator } from './components/Orchestrator.tsx';
import { Workflows } from './components/Workflows.tsx';
import { PlatformManagement } from './components/PlatformManagement.tsx';
import { AffiliateManagement } from './components/AffiliateManagement.tsx';
import { AssetLibrary } from './components/AssetLibrary.tsx';
import { DeploymentGuide } from './components/DeploymentGuide.tsx';
import { DesktopCompanion } from './components/DesktopCompanion.tsx';
import { ApiMarketplace } from './components/ApiMarketplace.tsx';
import { UserManagement } from './components/UserManagement.tsx';
import { Login } from './components/Login.tsx';
import { Database } from './components/Database.tsx';
import { ImpersonationBanner } from './components/ImpersonationBanner.tsx';

// FIX: Imported Platform enum to resolve type error in handleAnalyzeUrl.
import { Platform, type Account, type GenerationTask, type ExecutionNode, type PerformanceMetric, type TaskSubStep, type Workflow, type TrendingVideo, type StrategyLog, type Asset, type AffiliateRule, type SuperAdminUser, type ManagedPlatform, type ApiProvider, type ApiMarketplaceProvider, type TaskStatus } from './types.ts';
import { AddAccountModal } from './components/AddAccountModal.tsx';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [impersonatedUser, setImpersonatedUser] = useState<SuperAdminUser | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    
    // FIX: Safely access import.meta.env to prevent crashes when not in a Vite environment.
    const env = (import.meta as any).env;
    const [isDbConnected, setIsDbConnected] = useState(!!(env?.VITE_SUPABASE_URL && env?.VITE_SUPABASE_ANON_KEY));
    const [view, setView] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    // Data states
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [tasks, setTasks] = useState<GenerationTask[]>([]);
    const [nodes, setNodes] = useState<ExecutionNode[]>([]);
    const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
    const [subSteps, setSubSteps] = useState<TaskSubStep[]>([]);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([]);
    const [strategyLogs, setStrategyLogs] = useState<StrategyLog[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [affiliateRules, setAffiliateRules] = useState<AffiliateRule[]>([]);
    const [managedPlatforms, setManagedPlatforms] = useState<ManagedPlatform[]>([]);
    const [apiProviders, setApiProviders] = useState<ApiProvider[]>([]);
    const [systemApiProviders, setSystemApiProviders] = useState<ApiMarketplaceProvider[]>([]);

    // UI State
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    const fetchData = async () => {
        if (!supabase || !user) return;
        
        const currentUserId = impersonatedUser ? impersonatedUser.id : user.id;

        // Parallel fetching
        const [
            accountsRes, tasksRes, nodesRes, metricsRes, subStepsRes, 
            workflowsRes, trendingRes, logsRes, assetsRes, rulesRes,
            platformsRes, providersRes, systemProvidersRes, userRoleRes
        ] = await Promise.all([
            supabase.from('accounts').select('*').eq('user_id', currentUserId),
            supabase.from('generation_tasks').select('*').eq('user_id', currentUserId),
            supabase.from('execution_nodes').select('*'),
            supabase.from('performance_metrics').select('*'), // This might need filtering based on tasks
            supabase.from('task_sub_steps').select('*'), // This might need filtering based on tasks
            supabase.from('workflows').select('*'),
            supabase.from('trending_videos').select('*').order('created_at', { ascending: false }),
            supabase.from('strategy_logs').select('*, accounts(username)').eq('user_id', currentUserId).order('created_at', { ascending: false }).limit(20),
            supabase.from('asset_library').select('*').eq('user_id', currentUserId).order('created_at', { ascending: false }),
            supabase.from('affiliate_rules').select('*').eq('user_id', currentUserId).order('keyword'),
            supabase.from('managed_platforms').select('*'),
            supabase.from('api_providers').select('*').eq('user_id', currentUserId),
            supabase.from('system_api_providers').select('*'),
            supabase.rpc('is_super_admin')
        ]);

        setAccounts(accountsRes.data || []);
        setTasks(tasksRes.data || []);
        setNodes(nodesRes.data || []);
        setPerformanceMetrics(metricsRes.data || []);
        setSubSteps(subStepsRes.data || []);
        setWorkflows(workflowsRes.data || []);
        setTrendingVideos(trendingRes.data || []);
        setStrategyLogs(logsRes.data || []);
        setAssets(assetsRes.data || []);
        setAffiliateRules(rulesRes.data || []);
        setManagedPlatforms(platformsRes.data || []);
        setApiProviders(providersRes.data || []);
        setSystemApiProviders(systemProvidersRes.data || []);
        setIsSuperAdmin(userRoleRes.data === true && !impersonatedUser);
    };

    useEffect(() => {
        if (!isDbConnected) return;

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setImpersonatedUser(null); // Logout exits impersonation
        });
        
        return () => subscription.unsubscribe();
    }, [isDbConnected]);

    useEffect(() => {
        if (session) {
            fetchData();
            // Realtime subscriptions
            const channels = supabase.channel('db-changes')
              .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
              .subscribe();
            return () => {
                supabase.removeChannel(channels);
            };
        }
    }, [session, impersonatedUser]);
    
    const handleNavigation = (newView: string) => {
        setView(newView);
        setSidebarOpen(false);
    };
    
    const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
        const { error } = await supabase.from('generation_tasks').update({ status }).eq('id', taskId);
        if (error) console.error("Error updating task status:", error);
    };
    
    const handleTakedownTask = async (taskId: string) => {
        setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? { ...t, takedown_status: 'Pending' } : t));
        const { error } = await supabase
            .from('generation_tasks')
            .update({ takedown_status: 'Pending' })
            .eq('id', taskId);
        if (error) {
            console.error("Error initiating takedown:", error);
            setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? { ...t, takedown_status: null } : t));
        }
    };


    const handleAnalyzeUrl = async (url: string, platform: Platform) => {
        await supabase.from('trending_videos').insert([{ source_url: url, platform, analysis_status: 'Pending' }]);
    };
    
    const handleImpersonate = (user: SuperAdminUser) => {
        setImpersonatedUser(user);
        setView('dashboard'); // Go to user's dashboard
    };

    const handleExitImpersonation = () => {
        setImpersonatedUser(null);
    };

    const handleSaveAccount = async (accountData: Omit<Account, 'id' | 'created_at'> | Account) => {
        const currentUserId = impersonatedUser ? impersonatedUser.id : user!.id;

        if ('id' in accountData) { // Edit
            const { error } = await supabase.from('accounts').update({ ...accountData, user_id: currentUserId }).eq('id', accountData.id);
            if (error) console.error('Failed to update account:', error);
        } else { // Add
            const { error } = await supabase.from('accounts').insert([{ ...accountData, user_id: currentUserId }]);
            if (error) console.error('Failed to add account:', error);
        }
        setIsAccountModalOpen(false);
    };
    
    const handleDeleteAccount = async (accountId: string) => {
        if (window.confirm('您确定要删除此账号及其所有相关任务吗？')) {
            const { error } = await supabase.from('accounts').delete().eq('id', accountId);
            if (error) console.error('Failed to delete account:', error);
        }
    };

    const renderView = () => {
        switch (view) {
            case 'dashboard': return <Dashboard accounts={accounts} tasks={tasks} nodes={nodes} performanceMetrics={performanceMetrics} onUpdateTaskStatus={handleUpdateTaskStatus} />;
            case 'accounts': return <Accounts accounts={accounts} onAddAccount={() => { setEditingAccount(null); setIsAccountModalOpen(true); }} onEditAccount={(acc) => { setEditingAccount(acc); setIsAccountModalOpen(true); }} onDeleteAccount={handleDeleteAccount} />;
            case 'tasks': return <Tasks tasks={tasks} accounts={accounts} nodes={nodes} performanceMetrics={performanceMetrics} refreshTasks={fetchData} onTakedownTask={handleTakedownTask} />;
            case 'nodes': return <Nodes nodes={nodes} refreshNodes={fetchData} />;
            case 'analytics': return <Analytics accounts={accounts} tasks={tasks} performanceMetrics={performanceMetrics} />;
            case 'monetization': return <Monetization accounts={accounts} performanceMetrics={performanceMetrics} tasks={tasks} onNavigate={handleNavigation} />;
            case 'affiliateManagement': return <AffiliateManagement affiliateRules={affiliateRules} refreshRules={fetchData} />;
            case 'strategy': return <StrategyBrain trendingVideos={trendingVideos} onAnalyzeUrl={handleAnalyzeUrl} strategyLogs={strategyLogs} />;
            case 'orchestrator': return <Orchestrator tasks={tasks} subSteps={subSteps} accounts={accounts} />;
            case 'assets': return <AssetLibrary assets={assets} refreshAssets={fetchData} />;
            case 'workflows': return <Workflows workflows={workflows} onRunWorkflow={()=>{}} />;
            case 'platforms': return <PlatformManagement />;
            case 'apiMarketplace': return <ApiMarketplace userApiProviders={apiProviders} systemApiProviders={systemApiProviders} refreshProviders={fetchData} />;
            case 'deployment': return <DeploymentGuide onNavigate={handleNavigation} />;
            case 'companion': return <DesktopCompanion tasks={tasks} nodes={nodes} performanceMetrics={performanceMetrics} onNavigate={handleNavigation} />;
            case 'vision': return <Vision />;
            case 'userManagement': return <UserManagement onImpersonate={handleImpersonate} />;
            default: return <Dashboard accounts={accounts} tasks={tasks} nodes={nodes} performanceMetrics={performanceMetrics} onUpdateTaskStatus={handleUpdateTaskStatus} />;
        }
    };
    
    if (!isDbConnected) {
        return <Database onConnectionSuccess={() => {
            setIsDbConnected(true);
            window.location.reload();
        }} />;
    }

    if (!session) {
        return <Login />;
    }

    return (
        <>
            {impersonatedUser && <ImpersonationBanner user={impersonatedUser} onExit={handleExitImpersonation} />}
            <div className="flex h-screen bg-dark-bg text-gray-300">
                <Sidebar currentView={view} onNavigate={handleNavigation} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} isSuperAdmin={isSuperAdmin} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-bg p-4 md:p-6 lg:p-8">
                        {renderView()}
                    </main>
                </div>
            </div>
            <AddAccountModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                onSave={handleSaveAccount}
                accountToEdit={editingAccount}
            />
        </>
    );
};

export default App;
