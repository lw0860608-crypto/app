import React from 'react';
import { Card } from './ui/Card';

export const Vision: React.FC = () => {
    return (
        <div className="space-y-8 text-gray-300">
            <div>
                <h1 className="text-3xl font-bold text-white">项目进化之路：从“内容工厂”到“AI总监”</h1>
                <p className="text-gray-400 mt-1">我们的战略演进与核心理念。</p>
            </div>

            <Card>
                <h2 className="text-xl font-semibold text-white mb-2">核心目标</h2>
                <p>打造一个名为“一青里AI工作室”的自动化视频矩阵系统，旨在实现盈利。</p>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold text-white mb-4 border-b border-dark-border pb-3">战略的演进</h2>
                <div className="space-y-6">
                    {/* Stage 1 */}
                    <div>
                        <h3 className="text-lg font-bold text-brand-blue">第一阶段：“增长黑客”闪电战模式 (高预算)</h3>
                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-brand-blue/30">
                            <p><span className="font-semibold text-gray-200">目标：</span>冲击“首月盈利十万”。</p>
                            <p><span className="font-semibold text-gray-200">策略：</span>高投入、高频次、高质量。预算预估为每月 ¥1.5万 - ¥2.5万，主要用于API消耗。</p>
                            <div>
                                <p className="font-semibold text-gray-200">系统功能：</p>
                                <ul className="list-disc list-inside text-gray-400 mt-1 pl-2 space-y-1">
                                    <li>A/B测试与冠军策略：在“ROI与性能分析”页面用数据找出最高效的内容模型。</li>
                                    <li>高级工作流编排器 (任务编排器)：可视化监控复杂视频的每一个制作子步骤。</li>
                                    <li>实时热点追踪：在“数据监控中心”上识别24小时内有爆款潜力的视频，并一键创建相似任务。</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {/* Stage 2 */}
                    <div>
                        <h3 className="text-lg font-bold text-yellow-400">第二阶段：“狙击手”精确打击模式 (低预算)</h3>
                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-yellow-400/30">
                            <p><span className="font-semibold text-gray-200">背景：</span>针对预算有限的现实情况，我们将策略调整为“用最小成本发现爆款，用利润放大爆款”。</p>
                            <p><span className="font-semibold text-gray-200">策略：</span>启动成本控制在 ¥1000以内，核心是“先分析，后开火”，最大化利用免费资源（如Gemini API）。</p>
                             <p><span className="font-semibold text-gray-200">系统升级：</span>为了辅助决策，我们开发了 “战略洞察标签”。该功能在“数据监控中心”的审批队列和“内容任务中心”页面的待审批任务旁边，直接显示该内容风格的历史 “千次观看成本 (ROI)”，让决策者能瞬间判断哪个任务最值得投入宝贵的API预算。</p>
                        </div>
                    </div>
                     {/* Stage 3 */}
                    <div>
                        <h3 className="text-lg font-bold text-green-400">第三阶段：“AI总监”自主运营模式 (解决时间瓶颈)</h3>
                         <div className="mt-2 space-y-2 pl-4 border-l-2 border-green-400/30">
                            <p><span className="font-semibold text-gray-200">背景：</span>针对您没有时间手动审批每一条内容的核心痛点，我们将系统从“需要操作员的指令中心”升级为“自主运营的智能总部”。</p>
                            <p><span className="font-semibold text-gray-200">策略：</span>您作为“董事长”设定战略和预算，系统内的“AI总监”负责具体执行。</p>
                            <div>
                                <p className="font-semibold text-gray-200">系统核心升级：</p>
                                <ul className="list-disc list-inside text-gray-400 mt-1 pl-2 space-y-1">
                                    <li><span className="font-semibold text-white">自主模式开关：</span>一键授权AI全权管理账号。</li>
                                    <li><span className="font-semibold text-white">每日预算上限：</span>为AI总监设定严格的每日API消费额度，确保成本可控。</li>
                                    <li><span className="font-semibold text-white">审批阈值：</span>设定一个成本线（如$0.5），低于此成本的任务AI将 自动批准并执行，高于此成本的“大制作”才需要您亲自审批，实现了高效的混合管理模式。</li>
                                    <li><span className="font-semibold text-white">AI创作指令 (Creative Mandate)：</span>为每个平台的AI总监下达明确的、定制化的战略方向（例如，为抖音账号创作快节奏、强反转的短视频）。</li>
                                    <li><span className="font-semibold text-white">动态发布策略：</span>AI总监会根据ROI数据，在预算和您设定的发布时间基准上，动态调整发布频率和时间，以追求最大化的爆款概率。</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            
            <Card>
                <h2 className="text-xl font-semibold text-white mb-2">核心技术与理念澄清</h2>
                <p>我们明确了 平台会员 ≠ 无限API调用 的关键区别。我们的系统依赖的是按用量付费的API，而非网页版的手动创作会员。</p>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold text-white mb-2">最终系统状态</h2>
                <p>“一青里AI工作室”目前是一个高度智能化的自主运营平台。它不再需要逐条审批，而是能够理解每个账号的独特定位和预算限制，自主地进行内容规划、创作、发布和策略调整。您作为最高决策者，只需通过“账户管理”模块设定好战略框架，系统便会作为您的“AI总监”团队，7x24小时不间断地为您执行增长策略，寻找并创造爆款内容。</p>
            </Card>

        </div>
    );
};
