import React, { useState } from 'react';
import { Card } from './ui/Card';
import { ClipboardIcon, CheckIcon, TerminalIcon, ArrowCircleDownIcon, ChevronDownIcon, ChevronUpIcon, DevicePhoneMobileIcon } from './ui/Icons';

const webUiDeploymentScript = `
#!/bin/bash
# AIVideoMatrix 指挥中心 (Web UI) 一键部署脚本 v5.2
# 适用于 Ubuntu 22.04 LTS。

# --- 请修改这里的配置 ---
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
# -------------------------

echo ">>> [PRE-FLIGHT] 正在清理旧的部署 (如果存在)..."
sudo docker stop aivideomatrix_controller > /dev/null 2>&1 && sudo docker rm aivideomatrix_controller > /dev/null 2>&1
rm -rf ~/aivideomatrix-controller

echo ">>> [1/3] 安装核心工具: Docker & Git..."
sudo apt-get update -y && sudo apt-get install -y docker.io git

echo ">>> [2/3] 正在拉取最新的指挥中心 v5.2 代码..."
git clone https://github.com/aivideomatrix/controller-releases.git aivideomatrix-controller
cd aivideomatrix-controller

echo ">>> [3/3] 创建配置文件并启动指挥中心..."
echo "VITE_SUPABASE_URL=\${VITE_SUPABASE_URL}" > .env
echo "VITE_SUPABASE_ANON_KEY=\${VITE_SUPABASE_ANON_KEY}" >> .env

sudo docker build -t aivideomatrix-controller-v5.2 .
sudo docker run -d --name aivideomatrix_controller -p 80:80 --restart unless-stopped aivideomatrix-controller-v5.2

echo "✅ 指挥中心部署成功!"
echo "您现在可以通过 http://$(curl -s ifconfig.me) 访问全新的系统。"
`.trim();

const desktopConfigExample = `
{
  "SUPABASE_URL": "从您的Supabase项目API设置中复制",
  "SUPABASE_ANON_KEY": "从您的Supabase项目API设置中复制",
  "NODE_ID": "为您这台电脑创建的【桌面伴侣节点】ID"
}
`.trim();

const mobileConfigExample = `
{
  "SUPABASE_URL": "和桌面版一样",
  "SUPABASE_ANON_KEY": "和桌面版一样",
  "NODE_ID": "为您手机热点创建的【移动代理节点】ID"
}
`.trim();

const nodeDeploymentScript = `
#!/bin/bash
# AIVideoMatrix 执行节点一键部署脚本 v5.2 (高可用版)
# 适用于 Ubuntu 22.04 LTS。已针对网络超时和GPG密钥错误进行优化。

# --- 关键配置 (请在粘贴前修改!) ---
SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
NODE_ID="YOUR_EXECUTION_NODE_ID"
LOCATION_TAG="YOUR_LOCATION_TAG"

# --- 自动部署开始 ---
echo ">>> [PRE-FLIGHT] 正在清理旧的部署尝试 (如果存在)..."
pm2 stop aivideomatrix-node > /dev/null 2>&1 && pm2 delete aivideomatrix-node > /dev/null 2>&1
rm -rf aivideomatrix-node

echo ">>> [1/5] 更新系统并安装核心工具..."
sudo apt-get update -y
sudo apt-get install -y curl gnupg

echo ">>> [2/5] 正在以最高成功率模式安装 Docker..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo ">>> [3/5] 配置 Docker 国内镜像加速 (解决网络超时问题)..."
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://hub-mirror.c.163.com", "https://docker.mirrors.ustc.edu.cn"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
echo "    Docker 镜像已配置。"

echo ">>> [4/5] 安装 Node.js v18, npm, FFmpeg 和 PM2..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs ffmpeg
sudo npm install pm2 -g

echo ">>> [5/5] 设置项目并启动引擎..."
mkdir -p aivideomatrix-node && cd aivideomatrix-node
npm init -y > /dev/null 2>&1
npm install @supabase/supabase-js dotenv

echo ">>> 创建环境文件和核心脚本..."
# Note: The perception-engine.js and platform-publisher.js are created from a repo now.
# This script will now git clone the necessary files.
git clone https://github.com/aivideomatrix/node-scripts.git .

cat > .env << EOL
SUPABASE_URL=\${SUPABASE_URL}
SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
NODE_ID=\${NODE_ID}
LOCATION_TAG=\${LOCATION_TAG}
IS_SERVER_NODE=true
EOL

echo "---"
echo ">>> 设置完成! 正在用 PM2 启动引擎..."
pm2 start perception-engine.js --name aivideomatrix-node
pm2 startup
pm2 save

echo "---"
echo "✅ 您的 AIVideoMatrix 执行节点现已成功运行!"
echo ">>> 使用 'pm2 list' 查看状态。"
echo ">>> 使用 'pm2 logs aivideomatrix-node' 监控活动。"
`.trim();


const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="relative bg-gray-900/50 p-4 rounded-lg border border-dark-border">
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-gray-300 p-1.5 rounded-md transition"
            >
                {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardIcon className="h-5 w-5" />}
            </button>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                <code>{code.trim()}</code>
            </pre>
        </div>
    );
};

export const DeploymentGuide: React.FC<{ onNavigate: (view: 'settings' | 'nodes') => void }> = ({ onNavigate }) => {
    const [isStandardVisible, setIsStandardVisible] = useState(false);
    const [isAdvancedVisible, setIsAdvancedVisible] = useState(false);
    const [isEliteVisible, setIsEliteVisible] = useState(false);
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">部署与运维</h1>
                <p className="text-gray-400 mt-1">请按顺序完成以下步骤，以确保系统完整部署。</p>
            </div>
            
            <Card>
                <div className="flex items-start sm:items-center space-x-3 mb-4">
                     <span className="flex-shrink-0 bg-brand-blue/20 text-brand-blue font-bold rounded-full h-8 w-8 flex items-center justify-center">1</span>
                    <div>
                        <h2 className="text-xl font-semibold text-white">部署指挥中心 (Web UI)</h2>
                        <p className="text-sm text-gray-400">这是您现在看到的这个界面的部署步骤。推荐部署在您的上海服务器上。</p>
                    </div>
                </div>
                 <div className="space-y-4 text-gray-300 text-sm pl-11">
                    <p>1. 购买一台云服务器 (推荐：腾讯云/阿里云的轻量应用服务器，选择 **Ubuntu 22.04** 系统)。</p>
                    <p>2. 使用SSH工具 (如 Termius, Xshell) 登录到您的服务器。</p>
                    <p>3. 在下方的代码框中，将顶部的 <span className="font-semibold text-yellow-300">2个占位符</span> (\`YOUR_...\`) 替换成您的真实Supabase信息。</p>
                    <p>4. 复制修改后的 **完整脚本**，然后直接粘贴到服务器的命令行中，按回车键执行。脚本将自动完成所有操作。</p>
                    <CodeBlock code={webUiDeploymentScript} />
                </div>
            </Card>

            <div className="bg-dark-card border border-dark-border rounded-lg shadow-lg">
                <button onClick={() => setIsStandardVisible(!isStandardVisible)} className="w-full flex justify-between items-center p-4 text-left">
                     <div className="flex items-start sm:items-center space-x-3">
                         <span className="flex-shrink-0 bg-gray-700 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center">2</span>
                        <div>
                            <h2 className="text-lg font-semibold text-white">标准部署：桌面员工 (Desktop Companion)</h2>
                            <p className="text-sm text-gray-500">推荐给所有用户。这是一个在您自己电脑上运行的程序。</p>
                        </div>
                    </div>
                    {isStandardVisible ? <ChevronUpIcon className="h-6 w-6 text-gray-400 flex-shrink-0"/> : <ChevronDownIcon className="h-6 w-6 text-gray-400 flex-shrink-0"/>}
                </button>
                {isStandardVisible && (
                     <div className="p-6 border-t border-dark-border space-y-4 text-gray-300 text-sm">
                        <p>1. 首先，前往 <button onClick={() => onNavigate('nodes')} className="text-brand-blue hover:underline">执行节点</button> 页面，点击“添加新节点”，类型选择“桌面伴侣节点”，为您的电脑创建一个节点记录，然后复制生成的 **节点ID**。</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="https://github.com/aivideomatrix/companion-releases/releases/latest/download/aivideomatrix-companion-v5.2-win-x64.zip" target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition flex items-center justify-center space-x-2">
                                <ArrowCircleDownIcon className="h-5 w-5"/><span>下载Windows版本 v5.2</span>
                            </a>
                            <a href="https://github.com/aivideomatrix/companion-releases/releases/latest/download/aivideomatrix-companion-v5.2-mac-arm64.zip" target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition flex items-center justify-center space-x-2">
                                <ArrowCircleDownIcon className="h-5 w-5"/><span>下载macOS版本 v5.2</span>
                            </a>
                        </div>
                        <p>2. 下载并解压软件。找到名为 `config.json.example` 的文件，将它重命名为 `config.json`。</p>
                        <p>3. 用记事本或任何文本编辑器打开 `config.json` 文件，将下面模板中的三个值，替换成您自己的信息（URL、Key和节点ID），然后保存文件。</p>
                         <CodeBlock code={desktopConfigExample} />
                        <p>4. **双击 `start.bat` (Windows) 或 `start.command` (macOS) 文件。** 一个黑色窗口会打开，您的“桌面员工”就正式开始工作了！请勿关闭此窗口。</p>
                    </div>
                )}
            </div>

            <div className="bg-dark-card border border-dark-border rounded-lg shadow-lg">
                <button onClick={() => setIsAdvancedVisible(!isAdvancedVisible)} className="w-full flex justify-between items-center p-4 text-left">
                    <div className="flex items-start sm:items-center space-x-3">
                         <span className="flex-shrink-0 bg-gray-700 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center">3</span>
                        <div>
                             <h2 className="text-lg font-semibold text-white">高级部署：24/7云端数字员工 (上海/香港服务器)</h2>
                             <p className="text-sm text-gray-500">为您的云服务器部署执行节点。</p>
                        </div>
                    </div>
                    {isAdvancedVisible ? <ChevronUpIcon className="h-6 w-6 text-gray-400 flex-shrink-0"/> : <ChevronDownIcon className="h-6 w-6 text-gray-400 flex-shrink-0"/>}
                </button>
                {isAdvancedVisible && (
                    <div className="p-6 border-t border-dark-border">
                        <div className="space-y-3 text-gray-300 text-sm">
                             <p>1. 登录到您要用作执行节点的云服务器（上海或香港）。</p>
                             <p>2. 在 <button onClick={() => onNavigate('nodes')} className="text-brand-blue hover:underline">执行节点</button> 页面添加一个“服务器”类型的节点（例如，命名为“上海服务器”），并复制其ID。</p>
                             <p>3. 在下方的代码框中，将顶部的 <span className="font-semibold text-yellow-300">4个占位符</span> (\`YOUR_...\`) 替换成您的真实信息。</p>
                            <p>4. 复制修改后的 **完整脚本**，然后直接粘贴到服务器的命令行中，按回车键执行。</p>
                            <p>5. **为其他服务器部署：** 只需重复步骤2-4，使用为该服务器创建的节点ID和相应的位置标签即可。</p>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white mb-2">执行节点一键部署脚本 v5.2 (高可用版)</h3>
                            <CodeBlock code={nodeDeploymentScript} />
                        </div>
                    </div>
                )}
            </div>

             <div className="bg-dark-card border border-dark-border rounded-lg shadow-lg">
                <button onClick={() => setIsEliteVisible(!isEliteVisible)} className="w-full flex justify-between items-center p-4 text-left">
                    <div className="flex items-start sm:items-center space-x-3">
                         <span className="flex-shrink-0 bg-gray-700 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center">4</span>
                        <div>
                             <h2 className="text-lg font-semibold text-white">精英部署：移动先锋 (手机IP发布)</h2>
                             <p className="text-sm text-gray-500">最高级的拟人化策略，使用您手机的4G/5G网络IP发布内容。</p>
                        </div>
                    </div>
                    {isEliteVisible ? <ChevronUpIcon className="h-6 w-6 text-gray-400 flex-shrink-0"/> : <ChevronDownIcon className="h-6 w-6 text-gray-400 flex-shrink-0"/>}
                </button>
                {isEliteVisible && (
                    <div className="p-6 border-t border-dark-border space-y-3 text-gray-300 text-sm">
                        <p>此方案利用您电脑上的“桌面员工”软件，通过连接您手机的“个人热点”来实现手机IP发布。</p>
                        <p>1. 在 <button onClick={() => onNavigate('nodes')} className="text-brand-blue hover:underline">执行节点</button> 页面，点击“添加新节点”，类型选择 **“移动代理节点”**，为您的手机创建一个节点记录（例如，命名为“我的手机热点”），并复制其ID。</p>
                        <p>2. 将您之前下载的“桌面员工”软件文件夹 **完整复制一份**，并重命名为 `mobile-companion` 以作区分。</p>
                        <p>3. 进入新的 `mobile-companion` 文件夹，打开 `config.json` 文件。将 `NODE_ID` 的值 **替换成您刚刚为手机创建的那个新ID**。Supabase的URL和Key保持不变。</p>
                        <CodeBlock code={mobileConfigExample} />
                        <p>4. **执行：**</p>
                        <ul className="list-decimal list-inside pl-4 space-y-1">
                            <li>打开您手机的 **个人热点**。</li>
                            <li>让您的电脑 **连接到这个手机热点** (确保已断开其他所有WiFi或有线网络)。</li>
                            <li>进入 `mobile-companion` 文件夹，双击 `start.bat` 或 `start.command` 运行。</li>
                        </ul>
                        <p>现在，这个程序运行期间，所有从此节点发布的视频都将使用您手机的IP地址。</p>
                    </div>
                )}
            </div>
        </div>
    );
};
