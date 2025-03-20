document.addEventListener('DOMContentLoaded', () => {
    // 直接创建侧边栏而不是通过fetch加载
    const sidebarHTML = `
        <aside class="sidebar">
            <button class="sidebar-toggle" id="sidebarToggle">
                <span class="toggle-icon">≡</span>
            </button>
            <div class="sidebar-content">
                <div class="identity-selector">
                    <h3>身份选择</h3>
                    <select id="role-select">
                        <option value="">请选择身份</option>
                        <option value="pm">天天</option>
                        <option value="developer">IEWW</option>
                        <option value="designer">铭</option>
                        <option value="tester">帽砸</option>
                        <option value="tester">南羽</option>
                    </select>
                </div>
                
                <div class="page-nav">
                    <h3>页面导航</h3>
                    <ul class="nav-links" id="pageNavLinks"></ul>
                </div>

                <div class="current-identity" id="current-identity">
                    <p>当前身份: <span id="current-user">未选择</span></p>
                </div>
            </div>
        </aside>`;

    // 插入侧边栏到页面
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    
    // 初始化功能
    setupSidebarToggle();
    loadSavedIdentity();
    updatePageNavigation();
    setupIdentitySync();
});

function setupSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    const mainContainer = document.querySelector('.main-container');
    const sidebarToggle = document.getElementById('sidebarToggle');

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContainer.classList.toggle('expanded');
    });
}

function setupIdentitySync() {
    // 监听身份变更事件
    document.addEventListener('identityChanged', (e) => {
        updateIdentityDisplay(e.detail.role);
    });
    
    // 监听localStorage变化
    window.addEventListener('storage', (e) => {
        if (e.key === 'currentRole') {
            updateIdentityDisplay(e.newValue);
        }
    });
}

function loadSavedIdentity() {
    const roleSelect = document.getElementById('role-select');
    const currentUser = document.getElementById('current-user');
    const savedRole = localStorage.getItem('currentRole');

    if (savedRole && roleSelect) {
        Array.from(roleSelect.options).forEach(option => {
            if (option.text === savedRole) {
                option.selected = true;
                currentUser.textContent = savedRole;
                // 触发一个自定义事件通知其他页面
                document.dispatchEvent(new CustomEvent('identityChanged', {
                    detail: { role: savedRole }
                }));
            }
        });
    }

    roleSelect?.addEventListener('change', (e) => {
        const selectedText = e.target.options[e.target.selectedIndex].text;
        localStorage.setItem('currentRole', selectedText);
        updateIdentityDisplay(selectedText);
        // 触发身份改变事件
        document.dispatchEvent(new CustomEvent('identityChanged', {
            detail: { role: selectedText }
        }));
    });
}

function updateIdentityDisplay(role) {
    const currentUser = document.getElementById('current-user');
    if (currentUser) {
        currentUser.textContent = role || '未选择';
    }
}

function updatePageNavigation() {
    const navLinks = document.getElementById('pageNavLinks');
    const currentPath = window.location.pathname;
    let links = [];

    // 根据当前页面路径设置导航链接
    if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
        links = [
            { href: '#project-section', text: '项目管理' },
            { href: '#discussion-section', text: '团队讨论' }
        ];
    } else if (currentPath.includes('team.html')) {
        links = [
            { href: '#team-members', text: '团队成员' }
        ];
    } else if (currentPath.includes('resources.html')) {
        links = [
            { href: '#scene-references', text: '场景参考' },
            { href: '#character-references', text: '人物参考' }
        ];
    }

    if (navLinks) {
        navLinks.innerHTML = links.map(link => 
            `<li><a href="${link.href}">${link.text}</a></li>`
        ).join('');
    }
}
