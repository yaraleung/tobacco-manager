// ==================== 设置页 ====================
const SettingsPage = {
    data: {
        products: [],
        lowStockThreshold: 5,
        searchKeyword: '',
        editingProduct: null,
        showModal: false
    },

    init() {
        this.data.products = App.getProducts();
        this.data.lowStockThreshold = App.getLowStockThreshold();
        this.render();
    },

    render() {
        const filteredProducts = this.getFilteredProducts();
        const lowStockCount = App.getLowStockProducts().length;

        return `
            <div class="settings-page">
            <!-- 库存预警设置 -->
            <div class="card">
                <div class="card-title">&#9888;&#65039; 库存预警设置</div>
                <div style="font-size: 16px; color: #666; margin-bottom: 16px;">
                    当商品库存低于设定值时，会显示预警提醒
                </div>
                <div class="form-group">
                    <label class="form-label">库存低于多少条时提醒</label>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <input type="number" class="form-input" id="threshold-input" 
                            value="${this.data.lowStockThreshold}" min="1" max="100"
                            style="width: 120px; text-align: center; font-size: 28px; font-weight: 700; color: #D4380D;">
                        <span style="font-size: 18px; color: #666;">条</span>
                        <button class="btn btn-primary" onclick="SettingsPage.saveThreshold()">保存</button>
                    </div>
                </div>
                <div style="margin-top: 16px; padding: 12px; background: ${lowStockCount > 0 ? '#FDEDEC' : '#E8F8F0'}; border-radius: 8px; text-align: center;">
                    <span style="font-size: 16px; color: ${lowStockCount > 0 ? '#D4380D' : '#52C41A'}; font-weight: 600;">
                        ${lowStockCount > 0 ? `当前有 ${lowStockCount} 个商品库存不足` : '当前库存充足'}
                    </span>
                </div>
            </div>

            <!-- 商品管理 -->
            <div class="card">
                <div class="card-title">&#128230; 商品管理</div>
                
                <div class="search-box">
                    <input type="text" class="search-input" placeholder="搜索商品" 
                        value="${this.data.searchKeyword}" 
                        oninput="SettingsPage.onSearch(this.value)">
                    ${this.data.searchKeyword ? `
                        <button class="btn btn-secondary" onclick="SettingsPage.clearSearch()">清除</button>
                    ` : ''}
                </div>
                
                <button class="btn btn-primary btn-block" style="margin-bottom: 16px;" onclick="SettingsPage.showAddProduct()">
                    + 添加新商品
                </button>
                
                ${filteredProducts.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon" style="font-size: 48px;">&#128230;</div>
                        <div class="empty-text">${this.data.searchKeyword ? '未找到匹配商品' : '暂无商品'}</div>
                    </div>
                ` : `
                    ${filteredProducts.map(p => `
                        <div class="product-card" style="border: 2px solid #E0E0E0;">
                            <div class="product-header">
                                <div class="product-name">${p.name}</div>
                                <div class="product-stock ${p.stock <= this.data.lowStockThreshold ? 'low' : 'normal'}">${p.stock}</div>
                            </div>
                            <div class="product-info">批发价: ${App.formatMoney(p.wholesalePrice)} / 零售价: ${App.formatMoney(p.retailPrice)}</div>
                            <div class="product-info">条码: ${p.barcode || '无'}</div>
                            <div style="display: flex; gap: 12px; margin-top: 12px;">
                                <button class="btn btn-secondary" style="flex: 1; font-size: 16px;" onclick="SettingsPage.showEditProduct('${p.id}')">编辑</button>
                                <button class="btn btn-secondary" style="flex: 1; font-size: 16px; border-color: #D4380D; color: #D4380D;" onclick="SettingsPage.deleteProduct('${p.id}')">删除</button>
                            </div>
                        </div>
                    `).join('')}
                `}
            </div>

            <!-- 数据管理 -->
            <div class="card">
                <div class="card-title">&#128190; 数据管理</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                    <button class="btn btn-primary" style="background: #1890FF;" onclick="SettingsPage.backupData()">&#128228; 备份数据</button>
                    <button class="btn btn-primary" style="background: #52C41A;" onclick="SettingsPage.restoreData()">&#128229; 恢复数据</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                    <button class="btn btn-secondary" onclick="SettingsPage.exportCSV()">&#128196; 导出表格</button>
                    <button class="btn btn-secondary" onclick="SettingsPage.importData()">&#128203; 导入数据</button>
                </div>
                <button class="btn btn-secondary" style="border-color: #D4380D; color: #D4380D;" onclick="SettingsPage.clearAllData()">&#128465;&#65039; 清空所有数据</button>
                <div style="margin-top: 8px; font-size: 14px; color: #999; text-align: center;">
                    警告：清空后数据无法恢复，请先备份！
                </div>
                <div style="margin-top: 16px;">
                    <button class="btn btn-secondary" style="width: 100%;" onclick="SettingsPage.resetProducts()">&#127801; 更新商品列表（同步订单表数据）</button>
                    <div style="font-size: 12px; color: #999; text-align: center; margin-top: 4px;">重置为56种烟品，库存归零</div>
                </div>
            </div>

            <!-- 关于 -->
            <div class="card" style="text-align: center;">
                <div style="font-size: 20px; font-weight: 700; color: #D4380D; margin-bottom: 8px;">烟草管家</div>
                <div style="font-size: 14px; color: #999;">适老化版 v1.0</div>
                <div style="font-size: 14px; color: #999; margin-top: 4px;">专为50-60岁人群设计</div>
            </div>

            <!-- 商品编辑弹窗 -->
            ${this.data.showModal ? `
                <div class="modal show" onclick="SettingsPage.closeModal(event)">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <h3 class="modal-title">${this.data.editingProduct ? '编辑商品' : '添加商品'}</h3>
                        <div class="form-group">
                            <label class="form-label">商品名称</label>
                            <input type="text" class="form-input" id="product-name" value="${this.data.editingProduct ? this.data.editingProduct.name : ''}" placeholder="如：中华(硬)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">盒码</label>
                            <input type="text" class="form-input" id="product-box-barcode" value="${this.data.editingProduct ? this.data.editingProduct.boxBarcode : ''}" placeholder="扫描或输入盒码">
                        </div>
                        <div class="form-group">
                            <label class="form-label">条码</label>
                            <input type="text" class="form-input" id="product-barcode" value="${this.data.editingProduct ? this.data.editingProduct.barcode : ''}" placeholder="扫描或输入条码">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div class="form-group">
                                <label class="form-label">批发价</label>
                                <input type="number" class="form-input" id="product-wholesale" value="${this.data.editingProduct ? this.data.editingProduct.wholesalePrice : ''}" placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label class="form-label">零售价</label>
                                <input type="number" class="form-input" id="product-retail" value="${this.data.editingProduct ? this.data.editingProduct.retailPrice : ''}" placeholder="0.00">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">当前库存</label>
                            <input type="number" class="form-input" id="product-stock" value="${this.data.editingProduct ? this.data.editingProduct.stock : '0'}" placeholder="0">
                        </div>
                        <div class="modal-btns">
                            <button class="btn btn-secondary" onclick="SettingsPage.hideModal()">取消</button>
                            <button class="btn btn-primary" onclick="SettingsPage.saveProduct()">保存</button>
                        </div>
                    </div>
                </div>
            ` : ''}
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

    saveThreshold() {
        const input = document.getElementById('threshold-input');
        const value = parseInt(input.value) || 5;
        App.saveLowStockThreshold(value);
        this.data.lowStockThreshold = value;
        App.showToast('保存成功');
        Router.refresh();
    },

    showAddProduct() {
        this.data.editingProduct = null;
        this.data.showModal = true;
        Router.refresh();
    },

    showEditProduct(productId) {
        const product = this.data.products.find(p => p.id === productId);
        if (product) {
            this.data.editingProduct = { ...product };
            this.data.showModal = true;
            Router.refresh();
        }
    },

    hideModal() {
        this.data.showModal = false;
        this.data.editingProduct = null;
        Router.refresh();
    },

    closeModal(event) {
        if (event.target === event.currentTarget) {
            this.hideModal();
        }
    },

    saveProduct() {
        const name = document.getElementById('product-name').value.trim();
        const boxBarcode = document.getElementById('product-box-barcode').value.trim();
        const barcode = document.getElementById('product-barcode').value.trim();
        const wholesalePrice = parseFloat(document.getElementById('product-wholesale').value) || 0;
        const retailPrice = parseFloat(document.getElementById('product-retail').value) || 0;
        const stock = parseInt(document.getElementById('product-stock').value) || 0;

        if (!name) {
            App.showToast('请输入商品名称');
            return;
        }

        if (this.data.editingProduct) {
            // 编辑
            const index = this.data.products.findIndex(p => p.id === this.data.editingProduct.id);
            if (index > -1) {
                this.data.products[index] = {
                    ...this.data.products[index],
                    name,
                    boxBarcode,
                    barcode,
                    wholesalePrice,
                    retailPrice,
                    stock
                };
                App.saveProducts(this.data.products);
                App.addLog('编辑商品', name);
                App.showToast('修改成功');
            }
        } else {
            // 新增
            const newProduct = {
                id: App.generateId(),
                name,
                boxBarcode,
                barcode,
                wholesalePrice,
                retailPrice,
                stock
            };
            this.data.products.push(newProduct);
            App.saveProducts(this.data.products);
            App.addLog('添加商品', name);
            App.showToast('添加成功');
        }

        this.hideModal();
    },

    deleteProduct(productId) {
        const product = this.data.products.find(p => p.id === productId);
        if (!product) return;

        App.showConfirm('确认删除', '确定要删除商品 "' + product.name + '" 吗？', () => {
            this.data.products = this.data.products.filter(p => p.id !== productId);
            App.saveProducts(this.data.products);
            App.addLog('删除商品', product.name);
            App.showToast('删除成功');
            Router.refresh();
        });
    },

    backupData() {
        const data = {
            products: App.getProducts(),
            salesRecords: App.getSalesRecords(),
            inboundRecords: App.getInboundRecords(),
            logs: App.getLogs(),
            lowStockThreshold: App.getLowStockThreshold(),
            backupTime: new Date().toISOString()
        };
        
        const jsonStr = JSON.stringify(data);
        
        // 复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(jsonStr).then(() => {
                App.showToast('备份数据已复制到剪贴板');
            });
        } else {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = jsonStr;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            App.showToast('备份数据已复制到剪贴板');
        }
    },

    restoreData() {
        const jsonStr = prompt('请粘贴备份数据：');
        if (!jsonStr) return;

        try {
            const data = JSON.parse(jsonStr);
            
            App.showConfirm('确认恢复', '恢复数据将覆盖当前所有数据，确定继续吗？', () => {
                if (data.products) App.saveProducts(data.products);
                if (data.salesRecords) App.saveSalesRecords(data.salesRecords);
                if (data.inboundRecords) App.saveInboundRecords(data.inboundRecords);
                if (data.logs) localStorage.setItem(App.keys.logs, JSON.stringify(data.logs));
                if (data.lowStockThreshold) App.saveLowStockThreshold(data.lowStockThreshold);
                
                App.addLog('恢复数据', '从备份恢复');
                App.showToast('恢复成功');
                
                this.data.products = App.getProducts();
                this.data.lowStockThreshold = App.getLowStockThreshold();
                Router.refresh();
            });
        } catch (e) {
            App.showToast('数据格式错误');
        }
    },

    exportCSV() {
        const products = App.getProducts();
        const salesRecords = App.getSalesRecords();
        const inboundRecords = App.getInboundRecords();
        
        let csv = '商品名称,盒码,条码,批发价,零售价,当前库存\n';
        products.forEach(p => {
            csv += `${p.name},${p.boxBarcode || ''},${p.barcode || ''},${p.wholesalePrice},${p.retailPrice},${p.stock}\n`;
        });
        
        csv += '\n出库记录\n时间,商品,数量,金额\n';
        salesRecords.forEach(r => {
            r.items.forEach(item => {
                csv += `${r.timestamp},${item.productName},${item.quantity},${item.subtotal}\n`;
            });
        });
        
        csv += '\n入库记录\n时间,商品,数量,成本\n';
        inboundRecords.forEach(r => {
            csv += `${r.timestamp},${r.productName},${r.quantity},${r.costPrice * r.quantity}\n`;
        });
        
        // 下载CSV
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '烟草管家数据_' + new Date().toLocaleDateString() + '.csv';
        link.click();
        
        App.showToast('导出成功');
    },

    importData() {
        App.showToast('请使用"恢复数据"功能导入备份');
    },

    clearAllData() {
        App.showConfirm('⚠️ 危险操作', '确定要清空所有数据吗？此操作不可恢复！', () => {
            localStorage.removeItem(App.keys.products);
            localStorage.removeItem(App.keys.salesRecords);
            localStorage.removeItem(App.keys.inboundRecords);
            localStorage.removeItem(App.keys.logs);
            localStorage.removeItem(App.keys.lastOperation);
            
            App.addLog('清空数据', '所有数据已清空');
            App.showToast('数据已清空');
            
            this.data.products = App.getProducts();
            Router.refresh();
        });
    },

    resetProducts() {
        App.showConfirm('更新商品', '确定要用订单表数据更新商品列表吗？\n将重置为48种烟品，现有库存将归零。\n出库记录和入库记录不受影响。', () => {
            const defaultProducts = App.getDefaultProducts();
            App.saveProducts(defaultProducts);
            
            App.addLog('更新商品', '商品列表已更新为48种烟品');
            App.showToast('商品列表已更新');
            
            this.data.products = defaultProducts;
            Router.refresh();
        });
    }
};
