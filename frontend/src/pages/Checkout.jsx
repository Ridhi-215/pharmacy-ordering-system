import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { MapPin, CreditCard, ChevronRight, AlertCircle, ShoppingBag, Loader2, ArrowLeft, ShieldAlert, Upload, CheckCircle2, RefreshCw } from 'lucide-react';

const Checkout = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);
  
  // Prescription related states
  const [uploadingRx, setUploadingRx] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState(null);
  const [rxFileName, setRxFileName] = useState('');
  const [rxStatus, setRxStatus] = useState(null); // 'PENDING', 'APPROVED', 'REJECTED'
  const [rxRejectionReason, setRxRejectionReason] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  let statusPollInterval = useRef(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await API.get('/cart');
        setCartItems(response.data);
        if (response.data.length === 0) {
          showToast("Your cart is empty.", "warning");
          navigate('/cart');
        }
      } catch (err) {
        showToast("Failed to retrieve checkout items.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate, showToast]);

  const applyLatestPrescription = (latest) => {
    if (!latest) {
      setPrescriptionId(null);
      setRxStatus(null);
      setRxRejectionReason('');
      setRxFileName('');
      return;
    }
    setPrescriptionId(latest.prescriptionId);
    setRxStatus(latest.status);
    setRxRejectionReason(latest.rejectionReason || '');
    setRxFileName(`Prescription #${latest.prescriptionId} (${latest.status})`);
  };

  // Load user's latest prescription status on load if cart has restricted items
  useEffect(() => {
    const checkExistingPrescription = async () => {
      const requiresRx = cartItems.some(item => item.requiresPrescription);
      if (requiresRx) {
        try {
          const response = await API.get('/prescriptions');
          applyLatestPrescription(response.data?.[0] || null);
        } catch (err) {
          console.error("Failed to load existing prescriptions", err);
        }
      }
    };
    
    if (cartItems.length > 0) {
      checkExistingPrescription();
    }
  }, [cartItems]);

  // Poll while awaiting admin decision (PENDING or recently uploaded)
  useEffect(() => {
    const requiresRx = cartItems.some(item => item.requiresPrescription);
    if (requiresRx && rxStatus === 'PENDING') {
      statusPollInterval.current = setInterval(() => {
        pollPrescriptionStatus(false);
      }, 5000);
    } else if (statusPollInterval.current) {
      clearInterval(statusPollInterval.current);
    }

    return () => {
      if (statusPollInterval.current) {
        clearInterval(statusPollInterval.current);
      }
    };
  }, [rxStatus, cartItems]);

  const pollPrescriptionStatus = async (showFeedback = false) => {
    if (showFeedback) setCheckingStatus(true);
    try {
      const response = await API.get('/prescriptions');
      const latest = response.data?.[0] || null;
      const previousStatus = rxStatus;
      applyLatestPrescription(latest);

      if (latest?.status === 'APPROVED' && previousStatus !== 'APPROVED') {
        showToast("Prescription APPROVED by admin! Checkout unlocked.", "success");
      } else if (latest?.status === 'REJECTED' && previousStatus !== 'REJECTED') {
        const reasonMsg = latest.rejectionReason ? ` Reason: ${latest.rejectionReason}` : '';
        showToast(`Prescription was rejected by admin.${reasonMsg} Please upload a new one.`, "error");
      } else if (showFeedback && latest?.status === 'PENDING') {
        showToast("Prescription approval is pending from admin.", "info");
      }
    } catch (err) {
      console.error("Failed to poll prescription status", err);
    } finally {
      if (showFeedback) setCheckingStatus(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingRx(true);
    setError(null);
    setRxFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await API.post('/prescriptions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      applyLatestPrescription(response.data);
      showToast("Prescription uploaded successfully! Sent for admin review.", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to upload prescription.";
      setError(msg);
      showToast(msg, "error");
      setRxFileName('');
    } finally {
      setUploadingRx(false);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (placing) return;
    setError(null);
    
    const requiresRx = cartItems.some(item => item.requiresPrescription);
    if (requiresRx) {
      if (!prescriptionId) {
        showToast("Please upload a prescription first.", "warning");
        setError("Please upload a prescription before checkout.");
        return;
      }
      if (rxStatus === 'PENDING') {
        showToast("Prescription approval is pending from admin.", "warning");
        setError("Prescription approval is pending from admin.");
        return;
      }
      if (rxStatus === 'REJECTED') {
        const rejectMsg = rxRejectionReason
          ? `Prescription was rejected by admin. Reason: ${rxRejectionReason}`
          : "Prescription was rejected by admin. Please upload a new prescription.";
        showToast(rejectMsg, "error");
        setError(rejectMsg);
        return;
      }
      if (rxStatus !== 'APPROVED') {
        showToast("Prescription must be approved before placing an order.", "warning");
        return;
      }
    }

    setPlacing(true);

    try {
      // 1. Place order
      const orderResponse = await API.post('/orders/place', {
        deliveryAddress,
        paymentMethod,
        prescriptionId: requiresRx ? prescriptionId : null
      });
      const order = orderResponse.data;

      // 2. Simulate payment processing
      if (paymentMethod === 'CARD') {
        const txId = "TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        await API.post(`/payments/process?orderId=${order.orderId}&transactionId=${txId}`);
      }

      // Synchronize cart changes instantly for Navbar
      window.dispatchEvent(new Event('cart-updated'));
      showToast("Order placed successfully! Redirecting to tracking...", "success");

      // Refresh user loyalty points
      await refreshProfile();

      // Redirect to history
      navigate('/orders/history?placed=true');
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to place order. Ensure prescription approvals are complete.";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const requiresRx = cartItems.some(item => item.requiresPrescription);
  const isCheckoutDisabled = placing || (requiresRx && (rxStatus !== 'APPROVED' || !prescriptionId));

  const getCheckoutBlockMessage = () => {
    if (!requiresRx) return null;
    if (!prescriptionId) {
      return {
        title: 'Prescription required',
        body: 'Upload your prescription document to continue checkout.',
        tone: 'amber'
      };
    }
    if (rxStatus === 'PENDING') {
      return {
        title: 'Prescription approval is pending from admin.',
        body: 'Checkout stays disabled until your latest prescription is approved.',
        tone: 'amber'
      };
    }
    if (rxStatus === 'REJECTED') {
      return {
        title: 'Prescription was rejected by admin.',
        body: rxRejectionReason
          ? `Reason: ${rxRejectionReason}. Upload a new prescription to continue.`
          : 'Upload a new prescription to continue checkout.',
        tone: 'rose'
      };
    }
    return null;
  };

  const checkoutBlockMessage = getCheckoutBlockMessage();

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 sm:px-8 bg-slate-50/20 min-h-[90vh]">
      
      {/* Back button and title */}
      <div className="mb-10 text-center sm:text-left space-y-3">
        <Link
          to="/cart"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Cart</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Secure Pharmacy Checkout</h1>
        <p className="text-slate-500 text-sm mt-1">Review delivery options, select payment, and place your order securely.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl mb-8 flex gap-2.5 items-start text-sm shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <span className="font-medium leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Prescription Upload Card (Visible only when Rx is required) */}
          {requiresRx && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base tracking-wide uppercase flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" /> 
                  <span>Prescription Required (Rx)</span>
                </h3>
                {rxStatus && (
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    rxStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    rxStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                    'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                  }`}>
                    {rxStatus}
                  </span>
                )}
              </div>

              {rxStatus === 'APPROVED' ? (
                <div className="bg-emerald-50/50 border border-emerald-200/50 p-5 rounded-2xl flex gap-3 items-center text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-extrabold block">Prescription Approved</span>
                    <p className="mt-0.5 text-emerald-650 font-medium">Your medical documentation is validated. Checkout is fully unlocked!</p>
                  </div>
                </div>
              ) : rxStatus === 'PENDING' ? (
                <div className="bg-amber-50/50 border border-amber-200/50 p-5 rounded-2xl space-y-4 text-amber-800 text-xs font-semibold animate-pulse">
                  <div className="flex gap-3 items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-600 shrink-0" />
                    <div>
                      <span className="font-extrabold block">Verification In Progress</span>
                      <p className="mt-0.5 text-amber-650 font-medium">Prescription approval is pending from admin. Status is being refreshed every 5 seconds...</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => pollPrescriptionStatus(true)}
                    disabled={checkingStatus}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-700 rounded-xl transition duration-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
                    <span>Check Status Now</span>
                  </button>
                </div>
              ) : rxStatus === 'REJECTED' ? (
                <div className="space-y-4">
                  <div className="bg-rose-50/60 border border-rose-200/60 p-5 rounded-2xl text-rose-800 text-xs font-semibold">
                    <span className="font-extrabold block">Prescription was rejected by admin.</span>
                    <p className="mt-1 font-medium">
                      {rxRejectionReason
                        ? `Reason: ${rxRejectionReason}`
                        : 'Please upload a new prescription to unlock checkout.'}
                    </p>
                  </div>
                  <div
                    onClick={triggerUploadClick}
                    className="border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-3xl p-8 text-center cursor-pointer hover:bg-rose-50/30 transition duration-200 group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 group-hover:bg-rose-100 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm transition">
                      {uploadingRx ? <Loader2 className="w-6 h-6 animate-spin text-rose-600" /> : <Upload className="w-6 h-6" />}
                    </div>
                    <span className="font-bold text-slate-700 text-sm block">Upload New Prescription</span>
                    <span className="text-slate-400 text-xs block mt-1 font-medium">JPG, PNG, or PDF formats up to 10MB</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    onClick={triggerUploadClick}
                    className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-3xl p-8 text-center cursor-pointer hover:bg-slate-50/40 transition duration-200 group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm transition">
                      {uploadingRx ? <Loader2 className="w-6 h-6 animate-spin text-emerald-600" /> : <Upload className="w-6 h-6" />}
                    </div>
                    <span className="font-bold text-slate-700 text-sm block">Drag & drop or Click to Upload</span>
                    <span className="text-slate-400 text-xs block mt-1 font-medium">JPG, PNG, or PDF formats up to 10MB</span>
                  </div>
                </div>
              )}

              {rxFileName && (
                <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 flex justify-between items-center text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 text-sm">📄</span>
                    <span className="truncate max-w-[200px] sm:max-w-sm">{rxFileName}</span>
                  </div>
                  {rxStatus === 'APPROVED' && <span className="text-emerald-650 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Approved</span>}
                </div>
              )}
            </div>
          )}

          {/* Address Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base tracking-wide uppercase flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> 
              <span>Delivery Address</span>
            </h3>
            <div>
              <textarea
                required
                rows={3}
                className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-semibold text-sm transition"
                placeholder="Enter complete shipping/home address..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base tracking-wide uppercase flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" /> 
              <span>Payment Option</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <label className={`border rounded-2xl p-4.5 flex items-center justify-between cursor-pointer transition-all duration-200 ${
                paymentMethod === 'CARD' 
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-md shadow-emerald-500/5' 
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}>
                <div className="flex gap-3 items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="accent-emerald-600 w-4.5 h-4.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-sm">Credit / Debit Card</span>
                    <span className="text-slate-400 text-xs block mt-0.5 font-medium">Process paid order instantly</span>
                  </div>
                </div>
              </label>

              <label className={`border rounded-2xl p-4.5 flex items-center justify-between cursor-pointer transition-all duration-200 ${
                paymentMethod === 'CASH_ON_DELIVERY' 
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-md shadow-emerald-500/5' 
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}>
                <div className="flex gap-3 items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className="accent-emerald-600 w-4.5 h-4.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-sm">Cash On Delivery</span>
                    <span className="text-slate-400 text-xs block mt-0.5 font-medium">COD payment upon parcel arrival</span>
                  </div>
                </div>
              </label>

            </div>
          </div>

        </div>

        {/* Right Column: Order Review */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50 h-fit space-y-6">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase border-b border-slate-50 pb-3">Review Purchase</h3>
          
          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.cartId} className="flex justify-between items-center text-xs font-bold">
                <div>
                  <span className="text-slate-700 block line-clamp-1">{item.name}</span>
                  <span className="text-slate-400 text-[10px] block mt-0.5">Qty: {item.quantity}</span>
                </div>
                <span className="text-slate-800 font-extrabold shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3.5 text-xs font-bold">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal Amount</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Estimated Delivery</span>
              <span className="text-emerald-600 font-extrabold">FREE</span>
            </div>
            <div className="border-t border-slate-100 pt-4 flex justify-between font-extrabold text-slate-800 text-base">
              <span>Total Bill</span>
              <span className="text-lg text-slate-800 font-extrabold">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          {checkoutBlockMessage && (
            <div className={`p-4.5 rounded-2xl text-[11px] flex gap-2.5 items-start leading-relaxed font-semibold border ${
              checkoutBlockMessage.tone === 'rose'
                ? 'bg-rose-50/70 border-rose-200/50 text-rose-900'
                : 'bg-amber-50/70 border-amber-200/50 text-amber-900'
            }`}>
              <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${
                checkoutBlockMessage.tone === 'rose' ? 'text-rose-500' : 'text-amber-500'
              }`} />
              <div>
                <span className="font-extrabold block">{checkoutBlockMessage.title}</span>
                <p className="mt-1">{checkoutBlockMessage.body}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isCheckoutDisabled}
            className={`font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition duration-200 w-full text-sm shrink-0 shadow-lg ${
              isCheckoutDisabled
                ? 'bg-slate-150 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10 hover:shadow-emerald-600/25'
            }`}
          >
            {placing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShoppingBag className="w-4.5 h-4.5" /> 
                <span>Confirm & Place Order</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
