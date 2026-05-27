// ==================== 应用核心逻辑 ====================
const App = {
    // 数据存储键名
    keys: {
        products: 'tobacco_products',
        salesRecords: 'tobacco_sales_records',
        inboundRecords: 'tobacco_inbound_records',
        logs: 'tobacco_logs',
        lastOperation: 'tobacco_last_operation',
        lowStockThreshold: 'tobacco_low_stock_threshold'
    },

    // 获取数据
    getProducts() {
        const data = localStorage.getItem(this.keys.products);
        return data ? JSON.parse(data) : this.getDefaultProducts();
    },

    saveProducts(products) {
        localStorage.setItem(this.keys.products, JSON.stringify(products));
    },

    getSalesRecords() {
        const data = localStorage.getItem(this.keys.salesRecords);
        return data ? JSON.parse(data) : [];
    },

    saveSalesRecords(records) {
        localStorage.setItem(this.keys.salesRecords, JSON.stringify(records));
    },

    getInboundRecords() {
        const data = localStorage.getItem(this.keys.inboundRecords);
        return data ? JSON.parse(data) : [];
    },

    saveInboundRecords(records) {
        localStorage.setItem(this.keys.inboundRecords, JSON.stringify(records));
    },

    getLogs() {
        const data = localStorage.getItem(this.keys.logs);
        return data ? JSON.parse(data) : [];
    },

    addLog(action, details = '') {
        const logs = this.getLogs();
        logs.unshift({
            id: this.generateId(),
            action,
            details,
            timestamp: new Date().toISOString()
        });
        // 只保留最近100条
        if (logs.length > 100) logs.pop();
        localStorage.setItem(this.keys.logs, JSON.stringify(logs));
    },

    getLowStockThreshold() {
        const threshold = localStorage.getItem(this.keys.lowStockThreshold);
        return threshold ? parseInt(threshold) : 5;
    },

    saveLowStockThreshold(threshold) {
        localStorage.setItem(this.keys.lowStockThreshold, threshold.toString());
    },

    // 获取默认商品数据（从Excel订单表导入，库存为0）
    getDefaultProducts() {
        return [
            { id: '24', name: '七匹狼(软灰)', boxBarcode: '6901028138505', barcode: '6901028138536', wholesalePrice: 185.5, retailPrice: 210.0, stock: 0 },
            { id: '17', name: '中华(硬)', boxBarcode: '6901028075763', barcode: '6901028075015', wholesalePrice: 381.6, retailPrice: 450.0, stock: 0 },
            { id: '38', name: '云烟(硬云龙细支)', boxBarcode: '6901028339940', barcode: '6901028339957', wholesalePrice: 129.3, retailPrice: 150.0, stock: 0 },
            { id: '12', name: '云烟(硬小熊猫家园中支16支)', boxBarcode: '6901028340601', barcode: '6901028340618', wholesalePrice: 158.0, retailPrice: 180.0, stock: 0 },
            { id: '6', name: '云烟(硬紫)', boxBarcode: '6901028046886', barcode: '6901028046893', wholesalePrice: 114.5, retailPrice: 130.0, stock: 0 },
            { id: '9', name: '利群(硬新版)', boxBarcode: '6901028118170', barcode: '6901028118187', wholesalePrice: 143.1, retailPrice: 160.0, stock: 0 },
            { id: '23', name: '利群(硬楼外楼中支)', boxBarcode: '6901028121729', barcode: '6901028121736', wholesalePrice: 175.0, retailPrice: 200.0, stock: 0 },
            { id: '53', name: '利群(软蓝新)', boxBarcode: '6901028216159', barcode: '6901028216166', wholesalePrice: 159.0, retailPrice: 180.0, stock: 0 },
            { id: '1', name: '双喜(硬吉祥好日子)', boxBarcode: '6901028942843', barcode: '6901028942850', wholesalePrice: 66.78, retailPrice: 75.0, stock: 0 },
            { id: '11', name: '双喜(硬晶彩好日子)', boxBarcode: '6901028057073', barcode: '6901028057080', wholesalePrice: 158.0, retailPrice: 180.0, stock: 0 },
            { id: '4', name: '双喜(硬精品好日子)', boxBarcode: '6901028942898', barcode: '6901028942881', wholesalePrice: 93.28, retailPrice: 110.0, stock: 0 },
            { id: '55', name: '双喜(硬金樽好日子)', boxBarcode: '6901028942966', barcode: '6901028942973', wholesalePrice: 243.8, retailPrice: 280.0, stock: 0 },
            { id: '16', name: '双喜(硬金樽好日子细支)', boxBarcode: '6901028057103', barcode: '6901028057110', wholesalePrice: 263.0, retailPrice: 320.0, stock: 0 },
            { id: '8', name: '双喜(软珍品好日子)', boxBarcode: '6901028942928', barcode: '6901028942911', wholesalePrice: 137.8, retailPrice: 160.0, stock: 0 },
            { id: '26', name: '天子(硬中支)', boxBarcode: '6901028229067', barcode: '6901028229074', wholesalePrice: 201.4, retailPrice: 230.0, stock: 0 },
            { id: '2', name: '好猫(硬金猴王)', boxBarcode: '6901028937528', barcode: '6901028937535', wholesalePrice: 71.0, retailPrice: 80.0, stock: 0 },
            { id: '7', name: '广州双喜(硬经典)', boxBarcode: '6901028000642', barcode: '6901028000659', wholesalePrice: 129.3, retailPrice: 150.0, stock: 0 },
            { id: '10', name: '广州双喜(硬经典1906)', boxBarcode: '6901028001618', barcode: '6901028001625', wholesalePrice: 150.52, retailPrice: 170.0, stock: 0 },
            { id: '19', name: '广州双喜(硬金五叶神新)', boxBarcode: '6901028005029', barcode: '6901028005036', wholesalePrice: 121.9, retailPrice: 140.0, stock: 0 },
            { id: '52', name: '广州双喜(软经典1906)', boxBarcode: '6901028004183', barcode: '6901028004305', wholesalePrice: 143.1, retailPrice: 160.0, stock: 0 },
            { id: '18', name: '广州双喜(软蓝红玫王新)', boxBarcode: '6901028004947', barcode: '6901028004954', wholesalePrice: 114.5, retailPrice: 130.0, stock: 0 },
            { id: '51', name: '广州双喜（硬莲香）', boxBarcode: '6901028005142', barcode: '6901028005159', wholesalePrice: 129.3, retailPrice: 150.0, stock: 0 },
            { id: '21', name: '广州双喜（硬蓝红玫王新）', boxBarcode: '6901028004978', barcode: '6901028004992', wholesalePrice: 143.1, retailPrice: 160.0, stock: 0 },
            { id: '54', name: '泰山(软望岳)', boxBarcode: '6901028150361', barcode: '6901028150378', wholesalePrice: 167.48, retailPrice: 190.0, stock: 0 },
            { id: '46', name: '牡丹(软)', boxBarcode: '6901028075862', barcode: '6901028075053', wholesalePrice: 121.9, retailPrice: 140.0, stock: 0 },
            { id: '25', name: '玉溪(硬)', boxBarcode: '6901028316989', barcode: '6901028316866', wholesalePrice: 199.28, retailPrice: 230.0, stock: 0 },
            { id: '14', name: '玉溪(软)', boxBarcode: '6901028317122', barcode: '6901028317177', wholesalePrice: 201.4, retailPrice: 230.0, stock: 0 },
            { id: '37', name: '白沙(硬天天向上细支)', boxBarcode: '6901028064835', barcode: '6901028064842', wholesalePrice: 129.3, retailPrice: 160.0, stock: 0 },
            { id: '44', name: '白沙(硬精品)', boxBarcode: '6901028191043', barcode: '6901028191166', wholesalePrice: 88.0, retailPrice: 100.0, stock: 0 },
            { id: '20', name: '白沙(硬精品三代)', boxBarcode: '6901028192729', barcode: '6901028192736', wholesalePrice: 129.3, retailPrice: 150.0, stock: 0 },
            { id: '5', name: '白沙(硬精品二代新)', boxBarcode: '6901028063364', barcode: '6901028063371', wholesalePrice: 97.0, retailPrice: 110.0, stock: 0 },
            { id: '28', name: '真龙(硬起源)', boxBarcode: '6901028011778', barcode: '6901028011785', wholesalePrice: 212.0, retailPrice: 250.0, stock: 0 },
            { id: '36', name: '真龙(软祥云)', boxBarcode: '6901028013789', barcode: '6901028013796', wholesalePrice: 114.48, retailPrice: 130.0, stock: 0 },
            { id: '3', name: '红塔山(硬经典)', boxBarcode: '6901028314978', barcode: '6901028314985', wholesalePrice: 75.0, retailPrice: 85.0, stock: 0 },
            { id: '47', name: '红塔山(硬经典100)', boxBarcode: '6901028315425', barcode: '6901028315432', wholesalePrice: 97.0, retailPrice: 110.0, stock: 0 },
            { id: '42', name: '红金龙(硬新版)', boxBarcode: '6901028940498', barcode: '6901028940504', wholesalePrice: 44.5, retailPrice: 50.0, stock: 0 },
            { id: '15', name: '芙蓉王(硬)', boxBarcode: '6901028193498', barcode: '6901028193504', wholesalePrice: 218.36, retailPrice: 250.0, stock: 0 },
            { id: '30', name: '芙蓉王(硬细支)', boxBarcode: '6901028201711', barcode: '6901028201728', wholesalePrice: 225.0, retailPrice: 260.0, stock: 0 },
            { id: '27', name: '贵烟(硬跨越)', boxBarcode: '6901028221443', barcode: '6901028221450', wholesalePrice: 201.4, retailPrice: 230.0, stock: 0 },
            { id: '34', name: '贵烟(硬黄精品)', boxBarcode: '6901028039741', barcode: '6901028039758', wholesalePrice: 114.5, retailPrice: 130.0, stock: 0 },
            { id: '39', name: '金圣(硬滕王阁紫光)', boxBarcode: '6901028224062', barcode: '6901028224079', wholesalePrice: 129.3, retailPrice: 150.0, stock: 0 },
            { id: '45', name: '金圣(硬青瓷)', boxBarcode: '6901028224635', barcode: '6901028224642', wholesalePrice: 158.0, retailPrice: 180.0, stock: 0 },
            { id: '56', name: '钻石(硬荷花)', boxBarcode: '6901028079952', barcode: '6901028079990', wholesalePrice: 275.6, retailPrice: 320.0, stock: 0 },
            { id: '48', name: '钻石(硬荷花细支)', boxBarcode: '6901028080514', barcode: '6901028080521', wholesalePrice: 360.4, retailPrice: 420.0, stock: 0 },
            { id: '50', name: '黄山(硬小红方印中支)', boxBarcode: '6901028124881', barcode: '6901028124966', wholesalePrice: 185.5, retailPrice: 220.0, stock: 0 },
            { id: '31', name: '黄山(红方印细支)', boxBarcode: '6901028208932', barcode: '6901028208949', wholesalePrice: 175.0, retailPrice: 200.0, stock: 0 },
            { id: '29', name: '黄金叶(硬乐途中支)', boxBarcode: '6901028172714', barcode: '6901028172844', wholesalePrice: 201.4, retailPrice: 230.0, stock: 0 },
            { id: '40', name: '黄金叶(硬小目标)', boxBarcode: '6901028165914', barcode: '6901028165921', wholesalePrice: 121.9, retailPrice: 140.0, stock: 0 },
            { id: '13', name: '黄金叶(硬新商鼎)', boxBarcode: '6901028167062', barcode: '6901028172509', wholesalePrice: 175.0, retailPrice: 200.0, stock: 0 },
            { id: '41', name: '黄金叶(硬金满堂)', boxBarcode: '6901028169677', barcode: '6901028169257', wholesalePrice: 93.28, retailPrice: 105.0, stock: 0 },
            { id: '32', name: '黄金叶(软乐途)', boxBarcode: '6901028160278', barcode: '6901028160285', wholesalePrice: 121.9, retailPrice: 140.0, stock: 0 },
            { id: '35', name: '黄鹤楼(硬8度)', boxBarcode: '6901028187336', barcode: '6901028187343', wholesalePrice: 158.0, retailPrice: 180.0, stock: 0 },
            { id: '43', name: '黄鹤楼(硬天下名楼)', boxBarcode: '6901028180801', barcode: '6901028180818', wholesalePrice: 139.92, retailPrice: 160.0, stock: 0 },
            { id: '49', name: '黄鹤楼(硬奇景)', boxBarcode: '6901028219143', barcode: '6901028219174', wholesalePrice: 238.5, retailPrice: 300.0, stock: 0 },
            { id: '33', name: '黄鹤楼(硬银紫)', boxBarcode: '6901028188074', barcode: '6901028188081', wholesalePrice: 114.5, retailPrice: 130.0, stock: 0 },
            { id: '22', name: '黄鹤楼(软蓝)', boxBarcode: '6901028180573', barcode: '6901028180580', wholesalePrice: 164.3, retailPrice: 190.0, stock: 0 }
        ];
    },

    // 工具方法
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const diffDays = Math.floor((today - dateDay) / (1000 * 60 * 60 * 24));
        
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        if (diffDays === 0) return '今天 ' + hours + ':' + minutes;
        if (diffDays === 1) return '昨天 ' + hours + ':' + minutes;
        if (diffDays < 7) return diffDays + '天前';
        
        return (date.getMonth() + 1) + '/' + date.getDate();
    },

    formatMoney(amount) {
        return '¥' + parseFloat(amount).toFixed(2);
    },

    // 撤回功能
    getLastOperation() {
        const data = localStorage.getItem(this.keys.lastOperation);
        return data ? JSON.parse(data) : null;
    },

    setLastOperation(operation) {
        localStorage.setItem(this.keys.lastOperation, JSON.stringify(operation));
    },

    clearLastOperation() {
        localStorage.removeItem(this.keys.lastOperation);
    },

    hasUndoableOperation() {
        return this.getLastOperation() !== null;
    },

    undoLastOperation() {
        const operation = this.getLastOperation();
        if (!operation) return false;

        const products = this.getProducts();

        if (operation.type === 'inbound') {
            // 撤销入库：减少库存
            const product = products.find(p => p.id === operation.productId);
            if (product) {
                product.stock -= operation.quantity;
                this.saveProducts(products);
                
                // 删除入库记录
                const records = this.getInboundRecords();
                const filtered = records.filter(r => r.id !== operation.recordId);
                this.saveInboundRecords(filtered);
            }
        } else if (operation.type === 'outbound') {
            // 撤销出库：恢复库存
            operation.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    product.stock += item.quantity;
                }
            });
            this.saveProducts(products);
            
            // 删除出库记录
            const records = this.getSalesRecords();
            const filtered = records.filter(r => r.id !== operation.recordId);
            this.saveSalesRecords(filtered);
        }

        this.clearLastOperation();
        this.addLog('撤回操作', '撤回了上次的' + (operation.type === 'inbound' ? '入库' : '出库'));
        return true;
    },

    // 提示方法
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    },

    showConfirm(title, message, onConfirm, onCancel) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('show');

        const handleConfirm = () => {
            modal.classList.remove('show');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            if (onConfirm) onConfirm();
        };

        const handleCancel = () => {
            modal.classList.remove('show');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            if (onCancel) onCancel();
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    },

    // 震动反馈（如果支持）
    vibrate() {
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    },

    // 获取低库存商品
    getLowStockProducts() {
        const products = this.getProducts();
        const threshold = this.getLowStockThreshold();
        return products.filter(p => p.stock <= threshold).sort((a, b) => a.stock - b.stock);
    },

    // 获取今日数据
    getTodayStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const salesRecords = this.getSalesRecords();
        const todaySales = salesRecords.filter(r => new Date(r.timestamp) >= today);
        
        const products = this.getProducts();
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        
        const todayRevenue = todaySales.reduce((sum, r) => sum + r.totalAmount, 0);
        const todayCost = todaySales.reduce((sum, r) => {
            return sum + r.items.reduce((itemSum, item) => itemSum + (item.costPrice * item.quantity), 0);
        }, 0);
        
        const lowStockCount = this.getLowStockProducts().length;
        
        // 本月利润
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthSales = salesRecords.filter(r => new Date(r.timestamp) >= monthStart);
        const monthRevenue = monthSales.reduce((sum, r) => sum + r.totalAmount, 0);
        const monthCost = monthSales.reduce((sum, r) => {
            return sum + r.items.reduce((itemSum, item) => itemSum + (item.costPrice * item.quantity), 0);
        }, 0);
        
        return {
            todayRevenue,
            todayProfit: todayRevenue - todayCost,
            totalStock,
            lowStockCount,
            monthProfit: monthRevenue - monthCost,
            productCount: products.length
        };
    }
};
