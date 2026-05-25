import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ClipboardList, ExternalLink, Calendar, MapPin, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await API.get('/admin/orders');
      setOrders(response.data);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchOrders();
      setLoading(false);
    };
    init();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status?status=${newStatus}`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">DELIVERED</span>;
      case 'SHIPPED':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full">SHIPPED</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full">CANCELLED</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">PENDING</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    if (status === 'PAID') {
      return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">PAID</span>;
    }
    return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full">UNPAID / COD</span>;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(screen-16rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 sm:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">Manage Customer Orders</h1>
        <p className="text-slate-400 mt-2">Filter and inspect orders, adjust dispatch statuses, and track invoice payments.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <span className="text-4xl block mb-4">📦</span>
          <h3 className="text-slate-800 font-bold text-lg">No Orders Placed</h3>
          <p className="text-slate-400 text-sm mt-1">Orders will appear here once placed by customers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const isExpanded = expandedId === o.orderId;
            return (
              <div key={o.orderId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition hover:shadow-md">
                {/* Order Summary Header */}
                <div
                  onClick={() => toggleExpand(o.orderId)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer select-none bg-white hover:bg-slate-50/20"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 flex-1">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block">Order ID</span>
                      <span className="text-slate-800 font-bold text-sm">#100{o.orderId}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block">Customer</span>
                      <span className="text-slate-800 font-bold text-sm block truncate max-w-[120px]">{o.customerName}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block">Date</span>
                      <span className="text-slate-800 font-bold text-sm">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block">Bill Total</span>
                      <span className="text-slate-800 font-extrabold text-sm">${o.totalAmount.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block mb-1">State Badges</span>
                      <div className="flex gap-2">
                        {getStatusBadge(o.orderStatus)}
                        {getPaymentStatusBadge(o.paymentStatus)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-4 border-t sm:border-0 border-slate-50 pt-3 sm:pt-0 shrink-0">
                    <span className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="bg-slate-50/50 border-t border-slate-50 p-6 space-y-6 animate-slide-down">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Left: Items List */}
                      <div className="md:col-span-2 space-y-3">
                        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Ordered Items</h4>
                        <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-50 bg-white">
                          {o.orderItems.map((item) => (
                            <div key={item.orderItemId} className="p-4 flex justify-between items-center text-sm">
                              <div>
                                <span className="font-bold text-slate-800">{item.medicineName}</span>
                                <span className="text-slate-400 text-xs block mt-0.5">${item.price.toFixed(2)} each x {item.quantity}</span>
                              </div>
                              <span className="text-slate-800 font-extrabold">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Actions and Address */}
                      <div className="space-y-6">
                        {/* Address */}
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Shipping Destination</h4>
                          <div className="bg-white p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 font-semibold leading-relaxed flex gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{o.deliveryAddress}</span>
                          </div>
                        </div>

                        {/* Status Control */}
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Dispatch Status Action</h4>
                          <select
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-emerald-500 font-semibold text-xs transition shadow-sm"
                            value={o.orderStatus}
                            onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
