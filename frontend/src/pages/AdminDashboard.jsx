import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { DollarSign, ClipboardList, FileSignature, Pill, ArrowRight, Loader2, Users, AlertTriangle, CheckCircle, Package } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await API.get('/admin/dashboard');
        setStats(response.data);
        
        // Fetch specific low stock products
        const lowStockResponse = await API.get('/medicines/low-stock');
        setLowStockItems(lowStockResponse.data);
      } catch (err) {
        console.error("Failed to load dashboard statistics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  const lowStockCount = stats?.lowStockProducts || 0;

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 sm:px-8 space-y-10 bg-slate-50/20 min-h-[90vh]">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Operations</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage products catalog, review prescriptions, and process orders.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/medicines"
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-sm transition"
          >
            Add New Product
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition"
          >
            View Active Orders
          </Link>
        </div>
      </div>

      {/* Stats Grid - Premium Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Sales Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100/50">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Net Revenue</span>
            <span className="text-slate-800 font-extrabold text-xl mt-0.5 block">${stats?.totalSales?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100/50">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Orders</span>
            <span className="text-slate-800 font-extrabold text-xl mt-0.5 block">{stats?.totalOrders || 0}</span>
          </div>
        </div>

        {/* Prescriptions Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100/50">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Pending Rx</span>
            <span className="text-slate-800 font-extrabold text-xl mt-0.5 block">{stats?.pendingPrescriptions || 0}</span>
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100/50">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Users</span>
            <span className="text-slate-800 font-extrabold text-xl mt-0.5 block">{stats?.totalUsers || 0}</span>
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className={`p-5 rounded-3xl border transition flex items-center gap-4 ${
          lowStockCount > 0 
            ? 'bg-rose-50/70 border-rose-200 hover:shadow-md shadow-rose-100/20' 
            : 'bg-white border-slate-100 hover:shadow-md'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            lowStockCount > 0 
              ? 'bg-rose-100 text-rose-600 border-rose-200/50 animate-pulse' 
              : 'bg-teal-50 text-teal-600 border-teal-100/50'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Low Stock</span>
            <span className={`font-extrabold text-xl mt-0.5 block ${
              lowStockCount > 0 ? 'text-rose-700' : 'text-slate-800'
            }`}>{lowStockCount} items</span>
          </div>
        </div>

      </div>

      {/* Lists Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Recent Orders</h3>
            <Link to="/admin/orders" className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {stats?.recentOrders?.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6">No recent orders.</p>
            ) : (
              stats?.recentOrders?.map((o) => (
                <div key={o.orderId} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block">{o.customerName}</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-800 block">${o.totalAmount.toFixed(2)}</span>
                    <span className={`text-[9px] font-bold ${
                      o.orderStatus === 'DELIVERED' ? 'text-emerald-600' :
                      o.orderStatus === 'CANCELLED' ? 'text-rose-600' : 'text-amber-500'
                    }`}>{o.orderStatus}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Recent Rx Uploads</h3>
            <Link to="/admin/prescriptions" className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {stats?.recentPrescriptions?.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6">No recent uploads.</p>
            ) : (
              stats?.recentPrescriptions?.map((p) => (
                <div key={p.prescriptionId} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block">{p.userFullName}</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">{new Date(p.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider ${
                      p.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                      p.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Warning System */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Stock Alerts</span>
            </h3>
            <Link to="/admin/medicines" className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1">
              Refill Stock <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50 max-h-[250px] overflow-y-auto pr-1">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-slate-500 text-xs font-semibold">All products fully refilled!</p>
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.medicineId} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block leading-tight">{item.name}</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">{item.manufacturer}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider ${
                      item.stockQuantity <= 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.stockQuantity <= 0 ? 'OUT OF STOCK' : `${item.stockQuantity} LEFT`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
