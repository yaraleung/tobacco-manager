// ==================== 出库页 ====================
const OutboundPage = {
    data: {
        products: [],
        cart: [],
        records: [],
        filter: 'today',
        selectedProductId: ''
    },

    init() {
        this.data.products = App.getProducts();
        this.data.records = App.getSalesRecords();
        this.render();
    },

    render() {
        const totalAmount = this.data.cart.reduce((sum, item) => sum + item.subtotal, 0);
        const estimatedProfit = this.data.cart.reduce((sum, item) => {
            return sum + ((item.price - item.costPrice) * item.quantity);
        }, 0);
        
        const filteredRecords = this.getFilteredRecords();

        return `
            <!-- 扫码添加 -->
            <div class="card">
                <div class="card-title">扫码添加商品</div>
                <div class="search-box">
                    <button class="btn btn-primary" onclick="OutboundPage.scanAndAdd()"><svg style="width:20px;height:20px;vertical-align:middle;margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> 扫码</button>
                    <input type="text" class="search-input" id="barcode-input" placeholder="输入条码或盒码">
                    <button class="btn btn-secondary" onclick="OutboundPage.addByBarcode()">添加</button>
                </div>
                
                <div style="margin-top: 16px;">
                    <label class="form-label">或选择商品</label>
                    <div class="search-box">
                        <select class="search-input" id="product-select" onchange="OutboundPage.onProductSelect(this.value)">
                            <option value="">请选择商品</option>
                            ${this.data.products.map(p => `
                                <option value="${p.id}">${p.name} (库存: ${p.stock})</option>
                            `).join('')}
                        </select>
                        <button class="btn btn-secondary" onclick="OutboundPage.addByPicker()">添加</button>
                    </div>
                </div>
            </div>

            <!-- 购物车 -->
            ${this.data.cart.length > 0 ? `
                <div class="card">
                    <div class="card-title">出库清单</div>
                    
                    ${this.data.cart.map((item, index) => `
                        <div class="cart-item">
                            <div class="cart-header">
                                <div class="cart-name">${item.productName}</div>
                                <span class="cart-remove" onclick="OutboundPage.removeFromCart(${index})">删除</span>
                            </div>
                            <div style="font-size: 14px; color: ${item.stock < item.quantity ? '#D4380D' : '#52C41A'}; margin-bottom: 8px;">
                                库存: ${item.stock} ${item.stock < item.quantity ? '(库存不足!)' : '(充足)'}
                            </div>
                            <div class="cart-edit">
                                <div class="cart-field">
                                    <label>数量</label>
                                    <input type="number" value="${item.quantity}" min="1" onchange="OutboundPage.updateQuantity(${index}, this.value)">
                                </div>
                                <div class="cart-field">
                                    <label>单价</label>
                                    <input type="number" value="${item.price}" min="0" step="0.01" onchange="OutboundPage.updatePrice(${index}, this.value)">
                                </div>
                                <div class="cart-subtotal">${App.formatMoney(item.subtotal)}</div>
                            </div>
                        </div>
                    `).join('')}
                    
                    <div class="cart-total">
                        <span class="total-label">合计金额</span>
                        <span class="total-amount">${App.formatMoney(totalAmount)}</span>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 16px; color: ${estimatedProfit >= 0 ? '#52C41A' : '#D4380D'}; font-size: 18px;">
                        预估利润: ${estimatedProfit >= 0 ? '+' : ''}${App.formatMoney(estimatedProfit)}
                    </div>
                    
                    <button class="btn btn-primary btn-block btn-large" onclick="OutboundPage.confirmSale()">
                        确认出库
                    </button>
                </div>
            ` : ''}

            <!-- 出库记录 -->
            <div class="card">
                <div class="card-title">出库记录</div>
                <div class="tab-filter">
                    <div class="tab-filter-item ${this.data.filter === 'today' ? 'active' : ''}" onclick="OutboundPage.setFilter('today')">今天</div>
                    <div class="tab-filter-item ${this.data.filter === 'week' ? 'active' : ''}" onclick="OutboundPage.setFilter('week')">本周</div>
                    <div class="tab-filter-item ${this.data.filter === 'month' ? 'active' : ''}" onclick="OutboundPage.setFilter('month')">本月</div>
                    <div class="tab-filter-item ${this.data.filter === 'all' ? 'active' : ''}" onclick="OutboundPage.setFilter('all')">全部</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 16px; padding: 12px; background: #F8F9FA; border-radius: 8px;">
                    <span style="font-size: 16px; color: #666;">共 ${filteredRecords.length} 笔</span>
                    <span style="font-size: 16px; font-weight: 600;">
                        合计: ${App.formatMoney(filteredRecords.reduce((sum, r) => sum + r.totalAmount, 0))}
                    </span>
                </div>
                
                ${filteredRecords.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon" style="font-size: 48px;">&#128228;</div>
                        <div class="empty-text">暂无出库记录</div>
                    </div>
                ` : `
                    ${filteredRecords.map(r => `
                        <div class="record-row">
                            <span class="record-tag outbound">出库</span>
                            <div class="record-info">
                                <div class="record-name">${r.items.map(i => i.productName).join(', ')}</div>
                            </div>
                            <span class="record-amount outbound">${App.formatMoney(r.totalAmount)}</span>
                            <span class="record-time">${App.formatDate(r.timestamp)}</span>
                        </div>
                    `).join('')}
                `}
            </div>
        `;
    },

    scanAndAdd() {
        const barcode = prompt('请输入商品条码（或盒码）：');
        if (barcode) {
            this.matchAndAdd(barcode.trim());
        }
    },

    addByBarcode() {
        const input = document.getElementById('barcode-input');
        const barcode = input.value.trim();
        if (barcode) {
            this.matchAndAdd(barcode);
            input.value = '';
        }
    },

    matchAndAdd(barcode) {
        const product = this.data.products.find(p => 
            p.barcode === barcode || p.boxBarcode === barcode
        );
        
        if (product) {
            this.addToCart(product);
        } else {
            App.showToast('未找到匹配的商品');
        }
    },

    onProductSelect(value) {
        this.data.selectedProductId = value;
    },

    addByPicker() {
        const select = document.getElementById('product-select');
        const productId = select.value;
        if (productId) {
            const product = this.data.products.find(p => p.id === productId);
            if (product) {
                this.addToCart(product);
                select.value = '';
            }
        }
    },

    addToCart(product) {
        const existing = this.data.cart.find(item => item.productId === product.id);
        if (existing) {
            existing.quantity++;
            existing.subtotal = existing.quantity * existing.price;
        } else {
            this.data.cart.push({
                productId: product.id,
                productName: product.name,
                quantity: 1,
                price: product.retailPrice,
                costPrice: product.wholesalePrice,
                stock: product.stock,
                subtotal: product.retailPrice
            });
        }
        Router.refresh();
    },

    removeFromCart(index) {
        this.data.cart.splice(index, 1);
        Router.refresh();
    },

    updateQuantity(index, value) {
        const num = parseInt(value) || 1;
        this.data.cart[index].quantity = Math.max(1, num);
        this.data.cart[index].subtotal = this.data.cart[index].quantity * this.data.cart[index].price;
        Router.refresh();
    },

    updatePrice(index, value) {
        const price = parseFloat(value) || 0;
        this.data.cart[index].price = Math.max(0, price);
        this.data.cart[index].subtotal = this.data.cart[index].quantity * this.data.cart[index].price;
        Router.refresh();
    },

    confirmSale() {
        if (this.data.cart.length === 0) {
            App.showToast('请添加商品');
            return;
        }

        // 检查库存
        const insufficient = this.data.cart.filter(item => item.quantity > item.stock);
        if (insufficient.length > 0) {
            App.showToast(insufficient[0].productName + ' 库存不足');
            return;
        }

        App.showConfirm('确认出库', '确定要完成这次出库吗？', () => {
            this.doConfirmSale();
        });
    },

    doConfirmSale() {
        const products = App.getProducts();
        const items = [];
        let totalAmount = 0;

        this.data.cart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.productId);
            if (product) {
                product.stock -= cartItem.quantity;
                
                items.push({
                    productId: cartItem.productId,
                    productName: cartItem.productName,
                    quantity: cartItem.quantity,
                    price: cartItem.price,
                    costPrice: cartItem.costPrice,
                    subtotal: cartItem.subtotal
                });
                
                totalAmount += cartItem.subtotal;
            }
        });

        App.saveProducts(products);

        // 保存出库记录
        const record = {
            id: App.generateId(),
            items: items,
            totalAmount: totalAmount,
            timestamp: new Date().toISOString()
        };
        
        const records = App.getSalesRecords();
        records.unshift(record);
        App.saveSalesRecords(records);

        // 设置撤回操作
        App.setLastOperation({
            type: 'outbound',
            items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
            recordId: record.id
        });

        // 添加日志
        App.addLog('商品出库', '共' + items.length + '种商品，金额' + App.formatMoney(totalAmount));

        App.vibrate();
        App.showToast('出库成功');

        // 清空购物车
        this.data.cart = [];
        this.data.products = App.getProducts();
        this.data.records = App.getSalesRecords();
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
