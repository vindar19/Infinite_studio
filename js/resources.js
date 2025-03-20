document.addEventListener('DOMContentLoaded', () => {
    initializeResourceUploads();
    initializeNavigation();

    // 身份选择功能
    const roleSelect = document.getElementById('role-select');
    const currentUser = document.getElementById('current-user');

    roleSelect.addEventListener('change', (e) => {
        const selectedRole = e.target.value;
        if (selectedRole) {
            const selectedText = roleSelect.options[roleSelect.selectedIndex].text;
            currentUser.textContent = selectedText;
            localStorage.setItem('currentRole', selectedText);
        }
    });

    // 恢复之前选择的身份
    const savedRole = localStorage.getItem('currentRole');
    if (savedRole) {
        currentUser.textContent = savedRole;
        Array.from(roleSelect.options).forEach(option => {
            if (option.text === savedRole) {
                option.selected = true;
            }
        });
    }
});

// 添加资源存储管理
const STORAGE_KEY = {
    SCENES: 'scene_resources',
    CHARACTERS: 'character_resources'
};

function initializeResourceUploads() {
    const sceneUpload = document.getElementById('scene-upload');
    const characterUpload = document.getElementById('character-upload');

    sceneUpload.addEventListener('change', (e) => handleFileUpload(e, 'scene-grid', STORAGE_KEY.SCENES));
    characterUpload.addEventListener('change', (e) => handleFileUpload(e, 'character-grid', STORAGE_KEY.CHARACTERS));

    // 加载已保存的资源
    loadSavedResources(STORAGE_KEY.SCENES, 'scene-grid');
    loadSavedResources(STORAGE_KEY.CHARACTERS, 'character-grid');
}

function handleFileUpload(event, gridId, storageKey) {
    const files = event.target.files;
    const grid = document.getElementById(gridId);

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const resourceData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    type: file.type,
                    data: e.target.result,
                    uploadDate: new Date().toISOString(),
                    uploadedBy: document.getElementById('current-user').textContent
                };

                saveResource(storageKey, resourceData);
                addResourceToGrid(resourceData, grid);
            };

            reader.readAsDataURL(file);
        }
    });
}

function saveResource(storageKey, resourceData) {
    const savedResources = JSON.parse(localStorage.getItem(storageKey) || '[]');
    savedResources.push(resourceData);
    localStorage.setItem(storageKey, JSON.stringify(savedResources));
}

function loadSavedResources(storageKey, gridId) {
    const grid = document.getElementById(gridId);
    const savedResources = JSON.parse(localStorage.getItem(storageKey) || '[]');

    grid.innerHTML = ''; // 清空网格
    savedResources.forEach(resource => addResourceToGrid(resource, grid));
}

function addResourceToGrid(resource, grid) {
    const div = document.createElement('div');
    div.className = 'resource-item';

    // 添加资源元素
    if (resource.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = resource.data;
        div.appendChild(img);
    } else if (resource.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = resource.data;
        video.controls = true;
        div.appendChild(video);
    }

    // 添加操作按钮
    const actions = document.createElement('div');
    actions.className = 'resource-actions';
    
    // 预览按钮
    const previewBtn = document.createElement('button');
    previewBtn.className = 'action-button';
    previewBtn.textContent = '预览';
    previewBtn.onclick = () => previewResource(resource);
    actions.appendChild(previewBtn);
    
    // 下载按钮
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'action-button';
    downloadBtn.textContent = '下载';
    downloadBtn.onclick = () => downloadResource(resource);
    actions.appendChild(downloadBtn);
    
    div.appendChild(actions);

    // 添加资源信息
    const info = document.createElement('div');
    info.className = 'resource-info';
    info.innerHTML = `
        <p class="resource-name">${resource.name}</p>
        <p class="resource-meta">上传者: ${resource.uploadedBy}</p>
        <p class="resource-meta">时间: ${new Date(resource.uploadDate).toLocaleString()}</p>
    `;
    div.appendChild(info);

    // 添加删除按钮
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.innerHTML = '×';
    removeButton.onclick = () => {
        removeResource(resource.id, grid.id === 'scene-grid' ? STORAGE_KEY.SCENES : STORAGE_KEY.CHARACTERS);
        div.remove();
    };
    
    div.appendChild(removeButton);
    grid.appendChild(div);
}

function previewResource(resource) {
    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    
    const content = document.createElement('div');
    content.className = 'preview-content';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-preview';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => modal.remove();
    
    let mediaElement;
    if (resource.type.startsWith('image/')) {
        mediaElement = document.createElement('img');
        mediaElement.src = resource.data;
    } else if (resource.type.startsWith('video/')) {
        mediaElement = document.createElement('video');
        mediaElement.src = resource.data;
        mediaElement.controls = true;
        mediaElement.autoplay = true;
    }
    
    content.appendChild(closeBtn);
    content.appendChild(mediaElement);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // 添加淡入效果
    setTimeout(() => modal.classList.add('active'), 10);
    
    // 点击背景关闭预览
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function downloadResource(resource) {
    const link = document.createElement('a');
    link.href = resource.data;
    link.download = resource.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function removeResource(resourceId, storageKey) {
    const savedResources = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedResources = savedResources.filter(r => r.id !== resourceId);
    localStorage.setItem(storageKey, JSON.stringify(updatedResources));
}

function createResourceItem(src, type) {
    const div = document.createElement('div');
    div.className = 'resource-item';

    if (type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = src;
        div.appendChild(img);
    } else if (type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        div.appendChild(video);
    }

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.innerHTML = '×';
    removeButton.onclick = () => div.remove();
    
    div.appendChild(removeButton);
    return div;
}

function initializeNavigation() {
    // 标签页切换
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 移除所有active类
            document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            // 添加active类到当前标签
            e.target.classList.add('active');
            
            const targetId = e.target.getAttribute('href').substring(1);
            if (targetId === 'all-resources') {
                document.querySelectorAll('.resource-section').forEach(section => {
                    section.style.display = 'block';
                });
            } else {
                document.querySelectorAll('.resource-section').forEach(section => {
                    section.style.display = section.id === targetId ? 'block' : 'none';
                });
            }
        });
    });

    // 原有的平滑滚动代码
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
}
