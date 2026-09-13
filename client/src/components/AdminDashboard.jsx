import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, LogOut, Package, ClipboardList, Plus, Pencil, Trash2, Loader2, X,
  AlertTriangle, RefreshCw, Search, CheckCircle2, Clock, Info
} from 'lucide-react';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getOrders, updateOrderStatus, getInventoryAlerts,
} from '../services/api';

// ─── Main Dashboard Component ───
const AdminDashboard = ({ adminName, onLogout, onBack }) => {
  const [activeTab, setActiveTab] = useState('products');
  const token = localStorage.getItem('adminToken');

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Bar */}
      <header className="bg-primary-container border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-on-primary hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-headline font-bold text-on-primary">Admin Dashboard</h1>
          <span className="text-xs font-bold text-on-primary/60 uppercase tracking-widest hidden sm:inline">Welcome, {adminName}</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-on-primary/80 hover:text-on-primary text-sm font-bold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      {/* Tab Switcher */}
      <div className="max-w-screen-xl mx-auto px-6 pt-6">
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package className="w-4 h-4" />} label="Products" />
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ClipboardList className="w-4 h-4" />} label="Orders" />
          <TabButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={<AlertTriangle className="w-4 h-4" />} label="Demand Alerts" />
        </div>

        {activeTab === 'products' && <ProductsTab token={token} />}
        {activeTab === 'orders' && <OrdersTab token={token} />}
        {activeTab === 'alerts' && <InventoryAlertsTab token={token} />}
      </div>
    </div>
  );
};

// ─── Reusable Tab Button ───
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
      active
        ? 'bg-primary-container text-on-primary shadow-md'
        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/10'
    }`}
  >
    {icon} {label}
  </button>
);

// ─── Products Tab ───
const ProductsTab = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id, token);
      // Remove from local state without refetching
      setProducts(prev => prev.filter(p => p._id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts(); // Refresh the list
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <p className="text-on-surface-variant font-medium">{products.length} products in database</p>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-[#d1a154] text-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#f1be6e] transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          token={token}
          product={editingProduct}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onDone={handleFormDone}
        />
      )}

      {/* Products Table */}
      {products.length === 0 ? (
        <p className="text-center text-on-surface-variant py-16">No products yet. Click "Add Product" to create one.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-widest font-bold">
                  <th className="text-left px-6 py-4">Product</th>
                  <th className="text-left px-4 py-4">Category</th>
                  <th className="text-right px-4 py-4">Price</th>
                  <th className="text-right px-4 py-4">Stock</th>
                  <th className="text-right px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {products.map(product => (
                  <tr key={product._id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary max-w-[250px] truncate">{product.name}</td>
                    <td className="px-4 py-4 text-on-surface-variant">{product.category}</td>
                    <td className="px-4 py-4 text-right font-bold text-primary">₹{product.price}</td>
                    <td className="px-4 py-4 text-right text-on-surface-variant">{product.stock}</td>
                    <td className="px-6 py-4 text-right">
                      {confirmDeleteId === product._id ? (
                        <div className="flex gap-2 justify-end items-center">
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleEdit(product)} className="p-2 hover:bg-surface-container rounded-lg transition-colors text-primary" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDeleteId(product._id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Product Add/Edit Form ───
const ProductForm = ({ token, product, onClose, onDone }) => {
  const isEditing = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || 0,
    category: product?.category || '',
    images: product?.images?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert comma-separated image URLs into an array
      const productData = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      if (isEditing) {
        await updateProduct(product._id, productData, token);
      } else {
        await createProduct(productData, token);
      }
      onDone();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/10 p-6 shadow-lg space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-primary">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-surface-container rounded-lg transition-colors">
          <X className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Name" name="name" value={form.name} onChange={handleChange} required />
        <FormInput label="Category" name="category" value={form.category} onChange={handleChange} required />
        <FormInput label="Price (₹)" name="price" type="number" value={form.price} onChange={handleChange} required />
        <FormInput label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} />
        <div className="md:col-span-2">
          <FormInput label="Description" name="description" value={form.description} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <FormInput label="Image URLs (comma-separated)" name="images" value={form.images} onChange={handleChange} />
        </div>

        {error && <p className="text-red-500 text-sm md:col-span-2">{error}</p>}

        <div className="md:col-span-2 flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#d1a154] text-primary hover:bg-[#f1be6e] transition-all shadow-md disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Orders Tab ───
const OrdersTab = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders(token);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, token);
      // Update local state so we don't need a full refetch
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, status: newStatus } : o
      ));
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pb-12">
      <p className="text-on-surface-variant font-medium">{orders.length} total orders</p>

      {orders.length === 0 ? (
        <p className="text-center text-on-surface-variant py-16">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl border border-outline-variant/10 p-6 shadow-sm space-y-4">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <h4 className="font-bold text-primary text-lg">{order.customerName}</h4>
                  <p className="text-sm text-on-surface-variant">{order.phone} • {order.address}</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="text-xs font-bold bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-fixed-dim cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-outline-variant/10 pt-3 space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">{item.name} × {item.quantity}</span>
                    <span className="font-bold text-primary">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="flex justify-between text-base font-black text-primary pt-2 border-t border-outline-variant/10">
                  <span>Total</span>
                  <span>₹{order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Inventory Demand Alerts Tab ───
const ALERT_LEVEL_CONFIG = {
  CRITICAL: {
    label: 'Critical',
    badge: 'bg-red-100 text-red-800 border border-red-300',
    dot: 'bg-red-500',
    cardBorder: 'border-red-200 bg-red-50/40',
    text: 'text-red-700',
  },
  LOW: {
    label: 'Low Stock',
    badge: 'bg-amber-100 text-amber-900 border border-amber-300',
    dot: 'bg-amber-500',
    cardBorder: 'border-amber-200 bg-amber-50/40',
    text: 'text-amber-700',
  },
  MEDIUM: {
    label: 'Monitor',
    badge: 'bg-blue-100 text-blue-800 border border-blue-200',
    dot: 'bg-blue-500',
    cardBorder: 'border-blue-200 bg-blue-50/40',
    text: 'text-blue-700',
  },
  HEALTHY: {
    label: 'Healthy',
    badge: 'bg-green-100 text-green-800 border border-green-200',
    dot: 'bg-green-500',
    cardBorder: 'border-green-200 bg-green-50/40',
    text: 'text-green-700',
  },
};

const InventoryAlertsTab = ({ token }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getInventoryAlerts(token);
      setData(res);
    } catch (err) {
      console.error('Failed to load inventory alerts:', err);
      setError(err.message || 'Unable to load inventory analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-4 my-12 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-primary">Unable to load demand alerts</h3>
          <p className="text-sm text-on-surface-variant">{error}</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-md transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const { summary = {}, alerts = [], constants = {} } = data || {};

  const filteredAlerts = alerts.filter(item => {
    const matchesLevel = filterLevel === 'ALL' || item.alertLevel === filterLevel;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterLevel(filterLevel === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterLevel === 'CRITICAL' ? 'ring-2 ring-red-500 shadow-md' : 'hover:shadow-sm'
          } ${ALERT_LEVEL_CONFIG.CRITICAL.cardBorder}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">Critical (≤ 3d)</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-3xl font-black text-red-700 mt-2">{summary.criticalCount ?? 0}</p>
          <p className="text-xs text-red-600/80 mt-1">Out of stock or imminent stockout</p>
        </div>

        <div
          onClick={() => setFilterLevel(filterLevel === 'LOW' ? 'ALL' : 'LOW')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterLevel === 'LOW' ? 'ring-2 ring-amber-500 shadow-md' : 'hover:shadow-sm'
          } ${ALERT_LEVEL_CONFIG.LOW.cardBorder}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Low Stock (≤ 7d)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-800 mt-2">{summary.lowCount ?? 0}</p>
          <p className="text-xs text-amber-700/80 mt-1">Under 1 week of supply</p>
        </div>

        <div
          onClick={() => setFilterLevel(filterLevel === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterLevel === 'MEDIUM' ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
          } ${ALERT_LEVEL_CONFIG.MEDIUM.cardBorder}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Monitor (≤ 14d)</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-800 mt-2">{summary.mediumCount ?? 0}</p>
          <p className="text-xs text-blue-700/80 mt-1">1 to 2 weeks of supply</p>
        </div>

        <div
          onClick={() => setFilterLevel(filterLevel === 'HEALTHY' ? 'ALL' : 'HEALTHY')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            filterLevel === 'HEALTHY' ? 'ring-2 ring-green-500 shadow-md' : 'hover:shadow-sm'
          } ${ALERT_LEVEL_CONFIG.HEALTHY.cardBorder}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-green-800">Healthy</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-3xl font-black text-green-800 mt-2">{summary.healthyCount ?? 0}</p>
          <p className="text-xs text-green-700/80 mt-1">Adequate 14+ day stock</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-outline-variant/10 shadow-sm">
        {/* Quick filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {['ALL', 'CRITICAL', 'LOW', 'MEDIUM', 'HEALTHY'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterLevel === lvl
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {lvl === 'ALL' ? 'All Products' : ALERT_LEVEL_CONFIG[lvl].label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name or category..."
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-outline-variant/20 bg-surface-container-low outline-none focus:ring-2 focus:ring-primary-fixed-dim"
          />
        </div>
      </div>

      {/* Heuristics Transparency Callout */}
      <div className="flex items-start gap-3 bg-surface-container-low/60 border border-outline-variant/10 p-4 rounded-2xl text-xs text-on-surface-variant">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-primary">Transparent Business Logic:</strong> Demand velocity is calculated from real order items over the past 30 days. Stockout days = Current Stock ÷ Average Daily Demand. Suggested Reorder = (Daily Demand × 30-day coverage + 10 safety buffer) - Current Stock.
        </p>
      </div>

      {/* Alerts Table */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/10 p-12 text-center text-on-surface-variant">
          <p className="font-medium text-base">No inventory alerts found matching your filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-widest font-bold border-b border-outline-variant/10">
                  <th className="text-left px-6 py-4">Product</th>
                  <th className="text-right px-4 py-4">Current Stock</th>
                  <th className="text-right px-4 py-4">Sales (7d / 30d)</th>
                  <th className="text-right px-4 py-4">Daily Demand</th>
                  <th className="text-right px-4 py-4">Days Left</th>
                  <th className="text-center px-4 py-4">Alert Level</th>
                  <th className="text-right px-6 py-4">Suggested Reorder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filteredAlerts.map((item) => {
                  const cfg = ALERT_LEVEL_CONFIG[item.alertLevel] || ALERT_LEVEL_CONFIG.HEALTHY;
                  const isStockout = item.currentStock <= 0;

                  return (
                    <tr key={item.productId} className="hover:bg-surface-container-low/40 transition-colors">
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-primary max-w-[240px] truncate">{item.name}</div>
                        <div className="text-xs text-on-surface-variant/70">{item.category} • ₹{item.price}</div>
                      </td>

                      {/* Current Stock */}
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-block font-black px-2 py-0.5 rounded-lg text-sm ${
                          isStockout
                            ? 'bg-red-100 text-red-700'
                            : item.currentStock <= 5
                            ? 'bg-amber-100 text-amber-900'
                            : 'text-primary'
                        }`}>
                          {item.currentStock}
                        </span>
                      </td>

                      {/* Sales 7d / 30d */}
                      <td className="px-4 py-4 text-right font-medium text-on-surface-variant text-xs">
                        <span className="font-bold text-primary">{item.unitsSold7d}</span> / {item.unitsSold30d}
                      </td>

                      {/* Daily Demand */}
                      <td className="px-4 py-4 text-right font-medium text-xs">
                        {item.avgDailyDemand > 0 ? (
                          <span className="font-bold text-primary">{item.avgDailyDemand} / day</span>
                        ) : (
                          <span className="text-on-surface-variant/40">—</span>
                        )}
                      </td>

                      {/* Days Left */}
                      <td className="px-4 py-4 text-right text-xs">
                        {isStockout ? (
                          <span className="font-black text-red-600">0 days (Stockout)</span>
                        ) : item.daysUntilStockout !== null ? (
                          <span className={`font-bold ${item.daysUntilStockout <= 3 ? 'text-red-600' : item.daysUntilStockout <= 7 ? 'text-amber-700' : 'text-primary'}`}>
                            {item.daysUntilStockout} days
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/50">No recent sales</span>
                        )}
                      </td>

                      {/* Alert Level Badge */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Suggested Reorder */}
                      <td className="px-6 py-4 text-right">
                        {item.suggestedReorder > 0 ? (
                          <span className="inline-block bg-primary-container/20 text-primary font-black px-3 py-1 rounded-xl text-xs">
                            +{item.suggestedReorder} units
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-xl">
                            Adequate
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Status Badge ───
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
};

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
    {status}
  </span>
);

// ─── Shared Components ───
const FormInput = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low text-primary text-sm font-medium outline-none focus:ring-2 focus:ring-primary-fixed-dim transition-shadow"
    />
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

export default AdminDashboard;
