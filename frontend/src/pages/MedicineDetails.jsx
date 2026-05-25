import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft, ShieldAlert, ShoppingBag, Plus, Minus, CheckCircle2, XCircle } from 'lucide-react';

const MedicineDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [medicine, setMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toast notifications
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertType, setAlertType] = useState('success');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await API.get(`/medicines/${id}`);
        setMedicine(response.data);
      } catch (err) {
        setError("Failed to load medicine details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleIncrement = () => {
    if (medicine && quantity < medicine.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (user.role === 'ADMIN') {
      triggerAlert("Admins cannot add items to cart.", 'error');
      return;
    }

    try {
      await API.post('/cart/add', {
        medicineId: medicine.medicineId,
        quantity: quantity
      });
      triggerAlert(`Added ${quantity} unit(s) of ${medicine.name} to cart!`, 'success');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      triggerAlert(err.response?.data?.message || "Failed to add to cart.", 'error');
    }
  };

  const triggerAlert = (msg, type = 'success') => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => {
      setAlertMsg(null);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(screen-16rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-slate-800">{error || "Medicine Not Found"}</h2>
        <Link to="/medicines" className="text-emerald-600 hover:underline mt-4 inline-block font-semibold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = medicine.stockQuantity <= 0;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 sm:px-8">
      {/* Toast Alert */}
      {alertMsg && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl shadow-xl border text-white transition-all ${
          alertType === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-red-600 border-red-500'
        }`}>
          {alertType === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="font-bold text-sm">{alertMsg}</span>
        </div>
      )}

      {/* Back link */}
      <Link to="/medicines" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-semibold mb-8 transition w-fit">
        <ArrowLeft className="w-5 h-5" /> Back to Catalog
      </Link>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Side: Mock Image Placeholder with Pill Emoji */}
        <div className="bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-12 aspect-square border border-slate-100 relative">
          <span className="text-[8rem] sm:text-[10rem] animate-pulse">💊</span>
          
          {medicine.requiresPrescription && (
            <div className="absolute top-4 right-4 bg-amber-500 text-white font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1 shadow-sm">
              <ShieldAlert className="w-4 h-4" /> Rx Required
            </div>
          )}
        </div>

        {/* Right Side: Information */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">{medicine.category.categoryName}</span>
            <h1 className="text-3xl font-extrabold text-slate-800 mt-4 leading-tight">{medicine.name}</h1>
            <p className="text-slate-400 text-sm font-semibold mt-1">Manufacturer: {medicine.manufacturer}</p>
            
            <p className="text-slate-600 text-sm mt-6 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {medicine.description || "No description provided. This medicine is fully certified and sourced from official licensed producers."}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="border border-slate-100 rounded-xl p-3 bg-white">
                <span className="text-xs text-slate-400 block font-semibold">Dosage</span>
                <span className="text-slate-800 font-bold text-sm mt-0.5 block">{medicine.dosage || "N/A"}</span>
              </div>
              <div className="border border-slate-100 rounded-xl p-3 bg-white">
                <span className="text-xs text-slate-400 block font-semibold">Packaging</span>
                <span className="text-slate-800 font-bold text-sm mt-0.5 block">{medicine.packaging || "N/A"}</span>
              </div>
            </div>

            {medicine.requiresPrescription && (
              <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs flex gap-2 items-start">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold">Prescription Policy Information:</span>
                  <p className="mt-1">This is a restricted medicine. You must upload a valid doctor's prescription in your profile and wait for our administrators to approve it before placing an order.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs text-slate-400 font-bold block">Unit Price</span>
                <span className="text-slate-800 font-extrabold text-3xl">${medicine.price.toFixed(2)}</span>
              </div>
              
              {!isOutOfStock && (
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-1">Quantity</span>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button onClick={handleDecrement} className="p-2.5 hover:bg-slate-200 transition text-slate-600"><Minus className="w-4 h-4" /></button>
                    <span className="px-4 font-bold text-slate-800 text-sm">{quantity}</span>
                    <button onClick={handleIncrement} className="p-2.5 hover:bg-slate-200 transition text-slate-600"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition duration-200 ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
            
            {!isOutOfStock && (
              <span className="text-[11px] text-slate-400 font-bold mt-2 block text-center">
                {medicine.stockQuantity} units available in stock.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetails;
