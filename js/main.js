document.addEventListener('DOMContentLoaded', () => {
    // 侧边栏折叠功能
    const sidebar = document.querySelector('.sidebar');
    const mainContainer = document.querySelector('.main-container');
    const sidebarToggle = document.getElementById('sidebarToggle');

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContainer.classList.toggle('expanded');
    });

    // 更新项目数据
    const projectData = {
        name: "末日求生",
        description: "末日背景下的生存冒险游戏",
        startDate: "2025.1.31",
        currentPhase: "Demo开发阶段",
        teamMembers: 5,
        progress: 25,
        details: `一款以末日废土为背景的生存冒险游戏，玩家需要在充满危险的世界中探索、收集资源、建造庇护所，
              同时对抗各种威胁。游戏强调策略性和资源管理，让玩家体验真实的求生体验。`
    };

    // 使用新的数据更新仪表板
    updateDashboard(projectData);
    initializeMessageBoard();

    // 添加平滑滚动效果
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 删除原有身份选择功能的代码
    // 现在由sidebar.js统一处理

    // 消息发送功能修改，使用全局身份信息
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            const currentRole = localStorage.getItem('currentRole');
            if (!currentRole) {
                alert('请先选择身份后再发送消息！');
                return;
            }
            
            addMessage({
                user: currentRole,
                content: message,
                time: new Date().toLocaleString()
            });
            
            messageInput.value = '';
            simulateServerSync(message, currentRole);
        }
    });

    // 第一次初始化时检查并修复重复消息
    cleanupDuplicateMessages();
});

function updateDashboard(data) {
    const currentProject = document.getElementById('current-project');
    const teamCount = document.getElementById('team-count');
    const progressBar = document.getElementById('progress-bar');

    if (currentProject) {
        currentProject.innerHTML = `
            <h4>${data.name}</h4>
            <p class="project-description">${data.description}</p>
            <div class="project-details">
                <p><strong>开始时间：</strong>${data.startDate}</p>
                <p><strong>当前阶段：</strong>${data.currentPhase}</p>
                <p><strong>项目简介：</strong></p>
                <p>${data.details}</p>
            </div>
        `;
    }

    if (teamCount) {
        teamCount.innerHTML = `
            <p>当前成员数: ${data.teamMembers}</p>
        `;
    }

    if (progressBar) {
        progressBar.innerHTML = `
            <div class="progress">
                <div class="progress-bar" style="width: ${data.progress}%">
                    ${data.progress}%
                </div>
            </div>
        `;
    }
}

// 消息发送功能优化
const messageInput = document.getElementById('message-content');
const sendButton = document.getElementById('send-message');
const messageBoard = document.getElementById('message-board');

// 添加实时发送功能
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendButton.addEventListener('click', sendMessage);

const MESSAGE_STORAGE_KEY = 'team_messages';

function initializeMessageBoard() {
    const messageBoard = document.getElementById('message-board');
    if (!messageBoard) return;

    // 清空现有消息
    messageBoard.innerHTML = '';
    
    // 加载保存的消息
    const savedMessages = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');
    
    // 如果没有任何消息，显示欢迎消息
    if (savedMessages.length === 0) {
        const welcomeMessage = {
            id: 'system-welcome',
            user: 'System',
            content: '欢迎来到团队讨论区！请先选择身份后参与讨论。',
            time: new Date().toLocaleString()
        };
        addMessageToStorage(welcomeMessage);
    }
    
    // 显示所有消息
    const messages = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');
    messages.forEach(message => displayMessage(message));
}

function addMessage(message) {
    // 为每条消息添加唯一ID
    message.id = Date.now() + Math.random();
    displayMessage(message);
    addMessageToStorage(message);
}

function displayMessage(message) {
    const messageBoard = document.getElementById('message-board');
    if (!messageBoard) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.dataset.messageId = message.id;
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="message-user">${message.user}</span>
            <span class="message-time">${message.time}</span>
        </div>
        <div class="message-content">${formatMessage(message.content)}</div>
    `;
    messageBoard.appendChild(messageElement);
    messageBoard.scrollTop = messageBoard.scrollHeight;
}

function addMessageToStorage(message) {
    const messages = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');
    const messageId = message.id || `${message.user}-${message.time}`;
    
    // 检查消息是否已存在
    if (!messages.some(m => m.id === messageId)) {
        message.id = messageId;
        messages.push(message);
        localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(messages));
    }
}

// 修改发送消息函数
function sendMessage() {
    const messageInput = document.getElementById('message-content');
    const message = messageInput.value.trim();
    if (message) {
        const currentRole = localStorage.getItem('currentRole');
        if (!currentRole || currentRole === '未选择') {
            alert('请先选择身份后再发送消息！');
            return;
        }
        
        addMessage({
            user: currentRole,
            content: message,
            time: new Date().toLocaleString()
        });
        
        messageInput.value = '';
    }
}

function formatMessage(content) {
    return content
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
}

function simulateServerSync(message, user) {
    console.log(`消息已发送: ${user} - ${message}`);
    // 这里可以添加实际的服务器通信代码
}

function cleanupDuplicateMessages() {
    const messages = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY) || '[]');
    
    // 使用Set来存储唯一消息ID
    const uniqueIds = new Set();
    const uniqueMessages = [];
    
    messages.forEach(message => {
        // 确保每条消息都有ID
        const messageId = message.id || `${message.user}-${message.time}`;
        if (!uniqueIds.has(messageId)) {
            uniqueIds.add(messageId);
            // 确保每条消息都有ID属性
            message.id = messageId;
            uniqueMessages.push(message);
        }
    });
    
    // 更新存储
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(uniqueMessages));
}

// 删除或注释掉旧的 initializeProjectData 函数
// function initializeProjectData() { ... }

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeMessageBoard();
});
