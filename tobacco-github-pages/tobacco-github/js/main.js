// ==================== 路由系统 ====================
const Router = {
    currentPage: 'home',

    init() {
        // 监听hash变化
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // 初始化Tab点击事件
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const page = tab.dataset.page;
                this.navigate(page);
            });
        });

        // 初始路由
        this.handleRoute();
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        this.currentPage = hash;
        this.render();
        this.updateTabBar();
    },

    navigate(page) {
        window.location.hash = page;
    },

    refresh() {
        this.render();
    },

    render() {
        const container = document.getElementById('page-container');
        
        switch (this.currentPage) {
            case 'home':
                container.innerHTML = HomePage.render();
                break;
            case 'inbound':
                InboundPage.init();
                container.innerHTML = InboundPage.render();
                break;
            case 'outbound':
                OutboundPage.init();
                container.innerHTML = OutboundPage.render();
                break;
            case 'inventory':
                InventoryPage.init();
                container.innerHTML = InventoryPage.render();
                break;
            case 'settings':
                SettingsPage.init();
                container.innerHTML = SettingsPage.render();
                break;
            default:
                container.innerHTML = HomePage.render();
        }

        // 滚动到顶部
        window.scrollTo(0, 0);
    },

    updateTabBar() {
        document.querySelectorAll('.tab-item').forEach(tab => {
            if (tab.dataset.page === this.currentPage) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});
