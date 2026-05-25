import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../components/Toast';
import { ClipboardList, Loader2, Calendar, MapPin, ExternalLink, X, AlertTriangle, CheckCircle, Package } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  const { showToast } = useToast();
  const justPlaced = searchParams.get('placed') === 'true';

  const fetchOrders = async () => {
    try {
      const response = await API.get('/orders/history');
      setOrders(response.data);
    } catch (err) {
      console.error("Failed to load order history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetails = async (orderId) => {
    setLoadingDetails(true);
    try {
      const response = await API.get(`/orders/${orderId}`);
      setSelectedOrder(response.data);
    } catch (err) {
      showToast("Failed to load order details.", "error");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? This will restore item stock and void payment.")) {
      return;
    }

    setCancelling(true);
    try {
      await API.put(`/orders/${orderId}/cancel`);
      showToast("Order cancelled successfully! Stock has been restored.", "success");
      
      // Reload lists and close modal
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to cancel order.", "error");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">DELIVERED</span>;
      case 'SHIPPED':
        return <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">SHIPPED</span>;
      case 'CANCELLED':
        return <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">CANCELLED</span>;
      case 'CONFIRMED':
        return <span className="bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">CONFIRMED</span>;
      default:
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">PENDING</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    if (status === 'PAID') {
      return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">PAID</span>;
    }
    return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">UNPAID / COD</span>;
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 sm:px-8 bg-slate-50/20 min-h-[90vh]">
      {justPlaced && (
        <div className="bg-emerald-50 border border-emerald-200/60 p-5 rounded-2xl mb-8 flex gap-3 items-center shadow-sm">
          <div className="bg-emerald-100 p-2.5 rounded-xl"><CheckCircle className="w-6 h-6 text-emerald-600 animate-bounce" /></div>
          <div>
            <h4 className="font-extrabold text-sm text-emerald-800">Order Placed Successfully!</h4>
            <p className="text-xs text-emerald-600 mt-0.5">Your prescription check is finalized and your order items are being processed.</p>
          </div>
        </div>
      )}

      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Order History</h1>
        <p className="text-slate-500 mt-1.5 text-sm">Track real-time shipment updates, cancellations, and past medical invoices.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-xl shadow-slate-100/50 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            📦
          </div>
          <h2 className="text-slate-800 font-bold text-lg">No Orders Yet</h2>
          <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
            You haven't checked out any orders yet! Explore our products to start purchasing.
          </p>
          <Link
            to="/medicines"
            className="mt-6 inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.orderId}
              className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-lg transition duration-200"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Order Reference</span>
                  <span className="text-slate-700 font-bold text-sm">#100{o.orderId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Checkout Date</span>
                  <span className="text-slate-700 font-bold text-sm">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Amount Paid</span>
                  <span className="text-slate-800 font-extrabold text-sm">${o.totalAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1.5">Status Tracking</span>
                  <div className="flex gap-1.5">
                    {getStatusBadge(o.orderStatus)}
                    {getPaymentStatusBadge(o.paymentStatus)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewDetails(o.orderId)}
                  className="flex-1 sm:flex-initial bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  View Details <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </button>
                {(o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED') && (
                  <button
                    onClick={() => handleCancelOrder(o.orderId)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-4 py-2.5 rounded-xl border border-rose-100 transition text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Order Details</h3>
                <span className="text-xs text-slate-400 mt-1 font-semibold block">Reference #100{selectedOrder.orderId} • Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Timeline Flow */}
              {selectedOrder.orderStatus !== 'CANCELLED' && (
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-4 text-center">Shipment Timeline</span>
                  <div className="flex items-center justify-between max-w-md mx-auto">
                    
                    {/* Step 1: PENDING */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-emerald-500/10">1</div>
                      <span className="text-[10px] font-bold text-slate-700 mt-1.5">Pending</span>
                    </div>
                    
                    <div className={`h-0.5 flex-1 mx-2 ${
                      ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.orderStatus) ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}></div>

                    {/* Step 2: CONFIRMED */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.orderStatus)
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-400'
                      }`}>2</div>
                      <span className="text-[10px] font-bold text-slate-700 mt-1.5">Confirmed</span>
                    </div>
                    
                    <div className={`h-0.5 flex-1 mx-2 ${
                      ['SHIPPED', 'DELIVERED'].includes(selectedOrder.orderStatus) ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}></div>

                    {/* Step 3: SHIPPED */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        ['SHIPPED', 'DELIVERED'].includes(selectedOrder.orderStatus)
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-400'
                      }`}>3</div>
                      <span className="text-[10px] font-bold text-slate-700 mt-1.5">Shipped</span>
                    </div>
                    
                    <div className={`h-0.5 flex-1 mx-2 ${
                      selectedOrder.orderStatus === 'DELIVERED' ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}></div>

                    {/* Step 4: DELIVERED */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedOrder.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-400'
                      }`}>4</div>
                      <span className="text-[10px] font-bold text-slate-700 mt-1.5">Delivered</span>
                    </div>

                  </div>
                </div>
              )}

              {/* Order Status Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Order Status</span>
                  <div className="mt-1.5">{getStatusBadge(selectedOrder.orderStatus)}</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Payment Status</span>
                  <div className="mt-1.5">{getPaymentStatusBadge(selectedOrder.paymentStatus)}</div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Delivery Address
                </span>
                <span className="text-slate-700 font-bold text-sm block leading-relaxed">{selectedOrder.deliveryAddress}</span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-slate-500" /> Purchased Items
                </h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.orderItemId} className="p-4 flex justify-between items-center text-sm bg-white hover:bg-slate-50/50 transition">
                      <div>
                        <span className="font-bold text-slate-800">{item.medicineName}</span>
                        <span className="text-slate-400 text-xs block mt-0.5">${item.price.toFixed(2)} each • Qty: {item.quantity}</span>
                      </div>
                      <span className="text-slate-800 font-extrabold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-sm font-bold gap-4">
              {(selectedOrder.orderStatus === 'PENDING' || selectedOrder.orderStatus === 'CONFIRMED') && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder.orderId)}
                  disabled={cancelling}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-bold px-4 py-2.5 rounded-xl text-xs transition"
                >
                  Cancel Entire Order
                </button>
              )}
              <div className="ml-auto text-right">
                <span className="text-xs text-slate-400 block font-semibold">Invoice Total</span>
                <span className="text-slate-800 text-2xl font-extrabold">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
