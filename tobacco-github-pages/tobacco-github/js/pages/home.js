// ==================== 首页 ====================
const HomePage = {
    render() {
        const stats = App.getTodayStats();
        const hasUndo = App.hasUndoableOperation();
        
        // 获取最近记录
        const salesRecords = App.getSalesRecords().slice(0, 5);
        const inboundRecords = App.getInboundRecords().slice(0, 5);
        
        const allRecords = [
            ...salesRecords.map(r => ({...r, type: 'outbound'})),
            ...inboundRecords.map(r => ({...r, type: 'inbound'}))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

        const todayStr = new Date().toLocaleDateString('zh-CN', { 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });

        return `
            <div class="header">
                <div>
                    <div class="header-title">烟草管家</div>
                    <div class="header-date">${todayStr}</div>
                </div>
                ${hasUndo ? `
                    <button class="undo-btn" onclick="HomePage.handleUndo()">
                        <span>&#8617;&#65039;</span>
                        <span style="margin-left: 4px;">撤回</span>
                    </button>
                ` : ''}
            </div>

            <!-- 快捷操作 -->
            <div class="quick-actions">
                <div class="action-card" onclick="Router.navigate('inbound')">
                    <div class="action-icon green">
                        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <div class="action-label">扫码入库</div>
                </div>
                <div class="action-card" onclick="Router.navigate('outbound')">
                    <div class="action-icon red">
                        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </div>
                    <div class="action-label">扫码出库</div>
                </div>
                <div class="action-card" onclick="Router.navigate('inventory')">
                    <div class="action-icon blue">
                        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    </div>
                    <div class="action-label">查看库存</div>
                </div>
                <div class="action-card" onclick="HomePage.goToLowStock()">
                    <div class="action-icon orange">
                        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div class="action-label">库存预警</div>
                </div>
            </div>

            <!-- 今日数据 -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value red">${App.formatMoney(stats.todayRevenue)}</div>
                    <div class="stat-label">今日销售额</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value blue">${stats.totalStock}</div>
                    <div class="stat-label">库存总数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value green">${App.formatMoney(stats.monthProfit)}</div>
                    <div class="stat-label">本月利润</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value ${stats.lowStockCount > 0 ? 'orange' : 'green'}">${stats.lowStockCount}</div>
                    <div class="stat-label">低库存预警</div>
                </div>
            </div>

            <!-- 最近操作 -->
            <div class="card">
                <div class="card-title">最近操作</div>
                ${allRecords.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon" style="font-size: 48px;">&#128221;</div>
                        <div class="empty-text">暂无操作记录</div>
                    </div>
                ` : `
                    ${allRecords.map(record => `
                        <div class="record-row">
                            <span class="record-tag ${record.type}">${record.type === 'inbound' ? '入库' : '出库'}</span>
                            <div class="record-info">
                                <div class="record-name">${record.type === 'inbound' ? record.productName : record.items.map(i => i.productName).join(', ')}</div>
                            </div>
                            <span class="record-amount ${record.type}">
                                ${record.type === 'inbound' ? '+' + record.quantity : App.formatMoney(record.totalAmount)}
                            </span>
                            <span class="record-time">${App.formatDate(record.timestamp)}</span>
                        </div>
                    `).join('')}
                `}
            </div>
        `;
    },

    handleUndo() {
        App.vibrate();
        App.showConfirm('确认撤回', '确定要撤回上次的操作吗？', () => {
            if (App.undoLastOperation()) {
                App.showToast('撤回成功');
                Router.refresh();
            } else {
                App.showToast('撤回失败');
            }
        });
    },

    goToLowStock() {
        Router.navigate('inventory');
    }
};
