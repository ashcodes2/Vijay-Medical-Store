import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Package, ClipboardList, Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getOrders, updateOrderStatus,
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
        <div className="flex gap-2 mb-6">
          <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package className="w-4 h-4" />} label="Products" />
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ClipboardList className="w-4 h-4" />} label="Orders" />
        </div>

        {activeTab === 'products' && <ProductsTab token={token} />}
        {activeTab === 'orders' && <OrdersTab token={token} />}
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
