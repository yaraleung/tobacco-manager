// ==================== 库存页 ====================
const InventoryPage = {
    data: {
        products: [],
        searchKeyword: '',
        lowStockThreshold: 5
    },

    init() {
        this.data.products = App.getProducts();
        this.data.lowStockThreshold = App.getLowStockThreshold();
        this.render();
    },

    render() {
        const filteredProducts = this.getFilteredProducts();
        const lowStockProducts = App.getLowStockProducts();
        
        const totalStock = this.data.products.reduce((sum, p) => sum + p.stock, 0);
        const productCount = this.data.products.length;

        return `
            <!-- 搜索框 -->
            <div class="search-box">
                <input type="text" class="search-input" placeholder="搜索商品名称或条码" 
                    value="${this.data.searchKeyword}" 
                    oninput="InventoryPage.onSearch(this.value)">
                ${this.data.searchKeyword ? `
                    <button class="btn btn-secondary" onclick="InventoryPage.clearSearch()">清除</button>
                ` : ''}
            </div>

            <!-- 统计卡片 -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value blue">${productCount}</div>
                    <div class="stat-label">商品种类</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value green">${totalStock}</div>
                    <div class="stat-label">库存总量</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value ${lowStockProducts.length > 0 ? 'orange' : 'green'}">${lowStockProducts.length}</div>
                    <div class="stat-label">低库存预警</div>
                </div>
            </div>

            <!-- 库存预警 -->
            ${lowStockProducts.length > 0 ? `
                <div class="warning-card">
                    <div class="warning-title">&#9888;&#65039; 库存预警</div>
                    <div style="font-size: 14px; color: #666; margin-bottom: 12px;">
                        以下商品库存低于 ${this.data.lowStockThreshold} 条，请及时补货
                    </div>
                    ${lowStockProducts.slice(0, 5).map(p => `
                        <div class="warning-item">
                            <span class="warning-name">${p.name}</span>
                            <span class="record-amount" style="color: #D4380D;">仅剩 ${p.stock} 条</span>
                        </div>
                    `).join('')}
                    ${lowStockProducts.length > 5 ? `
                        <div style="text-align: center; padding-top: 8px; color: #999; font-size: 14px;">
                            还有 ${lowStockProducts.length - 5} 个商品库存不足
                        </div>
                    ` : ''}
                    <button class="btn btn-primary btn-block" style="margin-top: 12px;" onclick="InventoryPage.goToInbound()">
                        去补货
                    </button>
                </div>
            ` : ''}

            <!-- 商品列表 -->
            <div class="card">
                <div class="card-title">商品库存</div>
                
                ${filteredProducts.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon" style="font-size: 48px;">&#128230;</div>
                        <div class="empty-text">${this.data.searchKeyword ? '未找到匹配商品' : '暂无商品'}</div>
                    </div>
                ` : `
                    ${filteredProducts.map(p => `
                        <div class="product-card">
                            <div class="product-header">
                                <div class="product-name">${p.name}</div>
                                <div class="product-stock ${p.stock <= this.data.lowStockThreshold ? 'low' : 'normal'}">${p.stock}</div>
                            </div>
                            <div class="product-info">批发价: ${App.formatMoney(p.wholesalePrice)} / 零售价: ${App.formatMoney(p.retailPrice)}</div>
                            <div class="product-info">条码: ${p.barcode || '无'}</div>
                            ${p.stock <= this.data.lowStockThreshold ? `
                                <span class="record-tag" style="background: #FDEDEC; color: #D4380D; margin-top: 8px;">库存不足</span>
                            ` : ''}
                        </div>
                    `).join('')}
                `}
            </div>
        `;
    },

    onSearch(keyword) {
        this.data.searchKeyword = keyword;
        Router.refresh();
    },

    clearSearch() {
        this.data.searchKeyword = '';
        Router.refresh();
    },

    getFilteredProducts() {
        if (!this.data.searchKeyword) {
            return this.data.products;
        }
        
        const keyword = this.data.searchKeyword.toLowerCase();
        return this.data.products.filter(p => 
            p.name.toLowerCase().includes(keyword) ||
            (p.barcode && p.barcode.includes(keyword)) ||
            (p.boxBarcode && p.boxBarcode.includes(keyword))
        );
    },

    goToInbound() {
        Router.navigate('inbound');
    }
};
