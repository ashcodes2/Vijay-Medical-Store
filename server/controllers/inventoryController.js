const Product = require('../models/Product');
const Order = require('../models/Order');

// Configurable constants for inventory heuristics
const CONFIG = {
  CRITICAL_DAYS_THRESHOLD: 3,   // Stockout expected within 3 days or already 0
  LOW_DAYS_THRESHOLD: 7,        // Less than 1 week of supply remaining
  MEDIUM_DAYS_THRESHOLD: 14,    // 1 to 2 weeks of supply remaining
  TARGET_COVERAGE_DAYS: 30,     // 30-day inventory replenishment target
  MIN_SAFETY_STOCK: 10,         // Minimum baseline buffer units
  LOW_STOCK_ABSOLUTE: 5,        // Absolute low stock threshold for items without recent demand
};

// GET /api/inventory/alerts — calculate inventory demand alerts from real orders
const getInventoryAlerts = async (req, res, next) => {
  try {
    const now = Date.now();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // 1. Fetch all catalog products and orders from the last 30 days
    const [products, recentOrders] = await Promise.all([
      Product.find().lean(),
      Order.find({
        createdAt: { $gte: thirtyDaysAgo },
        // Valid active orders (excludes any non-standard states)
        status: { $in: ['pending', 'confirmed', 'shipped', 'delivered'] },
      }).lean(),
    ]);

    // 2. Aggregate demand metrics from real order items
    // Maps by productId string and normalized product name for maximum resilience
    const salesMap = new Map();

    for (const order of recentOrders) {
      const orderDate = new Date(order.createdAt);
      const isLast7d = orderDate >= sevenDaysAgo;

      if (!Array.isArray(order.items)) continue;

      for (const item of order.items) {
        const qty = Number(item.quantity) || 0;
        if (qty <= 0) continue;

        const keys = [];
        if (item.product) keys.push(item.product.toString());
        if (item.name) keys.push(`name:${item.name.trim().toLowerCase()}`);

        for (const key of keys) {
          const prev = salesMap.get(key) || { sold7d: 0, sold30d: 0 };
          salesMap.set(key, {
            sold7d: prev.sold7d + (isLast7d ? qty : 0),
            sold30d: prev.sold30d + qty,
          });
        }
      }
    }

    // 3. Compute demand heuristics and alert levels for each product
    let totalUnitsSold30d = 0;
    let totalUnitsSold7d = 0;

    const alerts = products.map((product) => {
      const currentStock = typeof product.stock === 'number' ? product.stock : 0;
      const prodIdStr = product._id ? product._id.toString() : '';
      const prodNameKey = product.name ? `name:${product.name.trim().toLowerCase()}` : '';

      // Match sales by product ID or fallback to product name
      const salesById = prodIdStr ? salesMap.get(prodIdStr) : null;
      const salesByName = prodNameKey ? salesMap.get(prodNameKey) : null;

      // Use the matched sales record (prefer ID match, fallback to name)
      const sales = salesById || salesByName || { sold7d: 0, sold30d: 0 };

      const unitsSold7d = sales.sold7d;
      const unitsSold30d = sales.sold30d;

      totalUnitsSold7d += unitsSold7d;
      totalUnitsSold30d += unitsSold30d;

      // Calculate effective active days to avoid underestimating new products
      const productCreatedAt = product.createdAt ? new Date(product.createdAt).getTime() : now;
      const daysActive = Math.max(1, Math.min(30, Math.round((now - productCreatedAt) / (1000 * 60 * 60 * 24))));

      // Average daily sales demand
      const avgDailyDemand = Number((unitsSold30d / daysActive).toFixed(2));

      // Estimated days until stockout
      let daysUntilStockout = null;
      if (currentStock <= 0) {
        daysUntilStockout = 0;
      } else if (avgDailyDemand > 0) {
        daysUntilStockout = Number((currentStock / avgDailyDemand).toFixed(1));
      }

      // Determine alert level
      let alertLevel = 'HEALTHY';
      let explanation = 'Inventory levels are optimal for current demand.';

      if (currentStock <= 0) {
        alertLevel = 'CRITICAL';
        explanation = 'Product is completely out of stock. Immediate reorder required.';
      } else if (daysUntilStockout !== null && daysUntilStockout <= CONFIG.CRITICAL_DAYS_THRESHOLD) {
        alertLevel = 'CRITICAL';
        explanation = `Critically low: Stockout expected in ${daysUntilStockout} days at current demand rate.`;
      } else if (
        (daysUntilStockout !== null && daysUntilStockout <= CONFIG.LOW_DAYS_THRESHOLD) ||
        (avgDailyDemand === 0 && currentStock <= CONFIG.LOW_STOCK_ABSOLUTE)
      ) {
        alertLevel = 'LOW';
        explanation = daysUntilStockout !== null
          ? `Low stock: ${daysUntilStockout} days of supply remaining. Reorder recommended.`
          : `Low buffer: Only ${currentStock} unit(s) remaining on shelf (no recent orders).`;
      } else if (daysUntilStockout !== null && daysUntilStockout <= CONFIG.MEDIUM_DAYS_THRESHOLD) {
        alertLevel = 'MEDIUM';
        explanation = `Moderate stock: ${daysUntilStockout} days of supply remaining. Monitor inventory.`;
      }

      // Suggested reorder calculation
      let suggestedReorder = 0;
      if (avgDailyDemand > 0) {
        const targetStock = Math.ceil(avgDailyDemand * CONFIG.TARGET_COVERAGE_DAYS) + CONFIG.MIN_SAFETY_STOCK;
        suggestedReorder = Math.max(0, targetStock - currentStock);
      } else if (currentStock === 0) {
        suggestedReorder = CONFIG.MIN_SAFETY_STOCK;
      }

      return {
        productId: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        currentStock,
        unitsSold7d,
        unitsSold30d,
        avgDailyDemand,
        daysUntilStockout,
        alertLevel,
        suggestedReorder,
        explanation,
        image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '',
      };
    });

    // 4. Sort alerts: Most urgent first
    const LEVEL_RANK = { CRITICAL: 1, LOW: 2, MEDIUM: 3, HEALTHY: 4 };

    alerts.sort((a, b) => {
      // Primary: Alert severity
      const rankDiff = LEVEL_RANK[a.alertLevel] - LEVEL_RANK[b.alertLevel];
      if (rankDiff !== 0) return rankDiff;

      // Secondary: Days until stockout (nulls last)
      if (a.daysUntilStockout !== null && b.daysUntilStockout !== null) {
        return a.daysUntilStockout - b.daysUntilStockout;
      }
      if (a.daysUntilStockout !== null) return -1;
      if (b.daysUntilStockout !== null) return 1;

      // Tertiary: Current stock ascending
      return a.currentStock - b.currentStock;
    });

    // 5. Compute overall summary counts
    const summary = {
      totalProducts: alerts.length,
      criticalCount: alerts.filter((a) => a.alertLevel === 'CRITICAL').length,
      lowCount: alerts.filter((a) => a.alertLevel === 'LOW').length,
      mediumCount: alerts.filter((a) => a.alertLevel === 'MEDIUM').length,
      healthyCount: alerts.filter((a) => a.alertLevel === 'HEALTHY').length,
      totalUnitsSold7d,
      totalUnitsSold30d,
    };

    res.json({
      success: true,
      summary,
      constants: {
        criticalDaysThreshold: CONFIG.CRITICAL_DAYS_THRESHOLD,
        lowDaysThreshold: CONFIG.LOW_DAYS_THRESHOLD,
        mediumDaysThreshold: CONFIG.MEDIUM_DAYS_THRESHOLD,
        targetCoverageDays: CONFIG.TARGET_COVERAGE_DAYS,
        minSafetyStock: CONFIG.MIN_SAFETY_STOCK,
      },
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventoryAlerts,
};
