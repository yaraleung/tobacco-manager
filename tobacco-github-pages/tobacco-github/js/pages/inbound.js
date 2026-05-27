// ==================== 入库页 ====================
const InboundPage = {
    data: {
        products: [],
        matchedProduct: null,
        quantity: 1,
        autoInbound: true,
        continuousScan: false,
        records: [],
        filter: 'today',
        scanHistory: []
    },

    init() {
        this.data.products = App.getProducts();
        this.data.records = App.getInboundRecords();
        this.loadScanHistory();
        this.render();
    },

    loadScanHistory() {
        const history = localStorage.getItem('scan_history');
        this.data.scanHistory = history ? JSON.parse(history) : [];
    },

    saveScanHistory() {
        localStorage.setItem('scan_history', JSON.stringify(this.data.scanHistory.slice(0, 10)));
    },

    addToScanHistory(product) {
        const existing = this.data.scanHistory.findIndex(p => p.id === product.id);
        if (existing > -1) {
            this.data.scanHistory.splice(existing, 1);
        }
        this.data.scanHistory.unshift(product);
        this.saveScanHistory();
    },

    render() {
        const filteredRecords = this.getFilteredRecords();
        
        return `
            <!-- 开关栏 -->
            <div class="switch-bar">
                <span class="switch-label">自动入库（扫码后直接入库1件）</span>
                <div class="switch ${this.data.autoInbound ? 'active' : ''}" onclick="InboundPage.toggleAutoInbound()"></div>
            </div>
            <div class="switch-bar">
                <span class="switch-label">连续扫码模式</span>
                <div class="switch ${this.data.continuousScan ? 'active' : ''}" onclick="InboundPage.toggleContinuousScan()"></div>
            </div>

            <!-- 扫码按钮 -->
            <div class="scan-section">
                <button class="scan-btn" onclick="InboundPage.scanCode()">
                    <svg style="width: 56px; height: 56px; margin-bottom: 4px;" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <span class="scan-text">扫码入库</span>
                </button>
            </div>

            <!-- 扫码历史 -->
            ${this.data.scanHistory.length > 0 ? `
                <div class="card">
                    <div class="card-title">最近扫码</div>
                    <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;">
                        ${this.data.scanHistory.map(p => `
                            <div class="product-card" style="min-width: 140px; cursor: pointer;" onclick="InboundPage.quickInbound('${p.id}')">
                                <div class="product-name" style="font-size: 16px;">${p.name}</div>
                                <div class="product-info">库存: ${p.stock}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- 匹配到的商品 -->
            ${this.data.matchedProduct ? `
                <div class="card">
                    <div class="product-card">
                        <div class="product-header">
                            <div class="product-name">${this.data.matchedProduct.name}</div>
                            <span class="record-tag inbound">匹配成功</span>
                        </div>
                        <div class="product-info">盒码: ${this.data.matchedProduct.boxBarcode || '无'}</div>
                        <div class="product-info">条码: ${this.data.matchedProduct.barcode || '无'}</div>
                        <div class="product-info">批发价: ${App.formatMoney(this.data.matchedProduct.wholesalePrice)}</div>
                        
                        <div class="form-group" style="margin-top: 16px;">
                            <label class="form-label">入库数量</label>
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <button class="btn btn-secondary" style="width: 48px; height: 48px; padding: 0; font-size: 24px;" onclick="InboundPage.changeQuantity(-1)">-</button>
                                <input type="number" class="form-input" style="flex: 1; text-align: center;" value="${this.data.quantity}" onchange="InboundPage.onQuantityChange(this.value)">
                                <button class="btn btn-secondary" style="width: 48px; height: 48px; padding: 0; font-size: 24px;" onclick="InboundPage.changeQuantity(1)">+</button>
                            </div>
                        </div>
                        
                        <button class="btn btn-primary btn-block btn-large" style="margin-top: 16px;" onclick="InboundPage.confirmInbound()">
                            确认入库
                        </button>
                    </div>
                </div>
            ` : ''}

            <!-- 入库记录 -->
            <div class="card">
                <div class="card-title">入库记录</div>
                <div class="tab-filter">
                    <div class="tab-filter-item ${this.data.filter === 'today' ? 'active' : ''}" onclick="InboundPage.setFilter('today')">今天</div>
                    <div class="tab-filter-item ${this.data.filter === 'week' ? 'active' : ''}" onclick="InboundPage.setFilter('week')">本周</div>
                    <div class="tab-filter-item ${this.data.filter === 'month' ? 'active' : ''}" onclick="InboundPage.setFilter('month')">本月</div>
                    <div class="tab-filter-item ${this.data.filter === 'all' ? 'active' : ''}" onclick="InboundPage.setFilter('all')">全部</div>
                </div>
                
                ${filteredRecords.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon" style="font-size: 48px;">&#128230;</div>
                        <div class="empty-text">暂无入库记录</div>
                    </div>
                ` : `
                    ${filteredRecords.map(r => `
                        <div class="record-row">
                            <span class="record-tag inbound">入库</span>
                            <div class="record-info">
                                <div class="record-name">${r.productName}</div>
                            </div>
                            <span class="record-amount inbound">+${r.quantity}</span>
                            <span class="record-time">${App.formatDate(r.timestamp)}</span>
                        </div>
                    `).join('')}
                `}
            </div>
        `;
    },

    scanCode() {
        // H5无法直接调用相机扫码，使用输入框模拟
        const barcode = prompt('请输入商品条码（或盒码）：');
        if (barcode) {
            this.searchByBarcode(barcode.trim());
        }
    },

    searchByBarcode(barcode) {
        const product = this.data.products.find(p => 
            p.barcode === barcode || p.boxBarcode === barcode
        );
        
        if (product) {
            this.data.matchedProduct = product;
            this.data.quantity = 1;
            this.addToScanHistory(product);
            
            if (this.data.autoInbound) {
                // 自动入库
                setTimeout(() => this.confirmInbound(), 300);
            } else {
                Router.refresh();
            }
        } else {
            App.showToast('未找到匹配的商品');
        }
    },

    quickInbound(productId) {
        const product = this.data.products.find(p => p.id === productId);
        if (product) {
            this.data.matchedProduct = product;
            this.data.quantity = 1;
            Router.refresh();
        }
    },

    changeQuantity(delta) {
        this.data.quantity = Math.max(1, this.data.quantity + delta);
        Router.refresh();
    },

    onQuantityChange(value) {
        const num = parseInt(value) || 1;
        this.data.quantity = Math.max(1, num);
    },

    confirmInbound() {
        if (!this.data.matchedProduct || this.data.quantity < 1) {
            App.showToast('请填写正确的数量');
            return;
        }

        const product = this.data.products.find(p => p.id === this.data.matchedProduct.id);
        if (!product) return;

        // 更新库存
        product.stock += this.data.quantity;
        App.saveProducts(this.data.products);

        // 保存入库记录
        const record = {
            id: App.generateId(),
            productId: product.id,
            productName: product.name,
            quantity: this.data.quantity,
            costPrice: product.wholesalePrice,
            timestamp: new Date().toISOString()
        };
        
        const records = App.getInboundRecords();
        records.unshift(record);
        App.saveInboundRecords(records);

        // 设置撤回操作
        App.setLastOperation({
            type: 'inbound',
            productId: product.id,
            quantity: this.data.quantity,
            recordId: record.id
        });

        // 添加日志
        App.addLog('商品入库', product.name + ' x' + this.data.quantity);

        App.vibrate();
        App.showToast('入库成功');

        // 清空匹配
        this.data.matchedProduct = null;
        this.data.quantity = 1;

        if (this.data.continuousScan) {
            // 连续扫码模式
            setTimeout(() => this.scanCode(), 500);
        } else {
            this.data.records = App.getInboundRecords();
            Router.refresh();
        }
    },

    toggleAutoInbound() {
        this.data.autoInbound = !this.data.autoInbound;
        Router.refresh();
    },

    toggleContinuousScan() {
        this.data.continuousScan = !this.data.continuousScan;
        Router.refresh();
    },

    setFilter(filter) {
        this.data.filter = filter;
        Router.refresh();
    },

    getFilteredRecords() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        return this.data.records.filter(r => {
            const date = new Date(r.timestamp);
            switch (this.data.filter) {
                case 'today': return date >= today;
                case 'week': return date >= weekStart;
                case 'month': return date >= monthStart;
                default: return true;
            }
        });
    }
};
