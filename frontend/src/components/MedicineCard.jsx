import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Plus, Eye, Sparkles, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import API from '../services/api';

const MedicineCard = ({ medicine, onAddToCartSuccess }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isOutOfStock = medicine.stockQuantity <= 0;
  const isLowStock = medicine.stockQuantity > 0 && medicine.stockQuantity <= 10;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to add items to your cart.', 'warning');
      window.location.href = '/login';
      return;
    }
    if (user.role === 'ADMIN') {
      showToast('Admins cannot add items to the cart.', 'error');
      return;
    }

    try {
      await API.post('/cart/add', {
        medicineId: medicine.medicineId,
        quantity: 1
      });
      showToast(`${medicine.name} has been added to your cart!`, 'success');
      window.dispatchEvent(new Event('cart-updated'));
      onAddToCartSuccess?.();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add item to cart.', 'error');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group">
      
      {/* Badges Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
        {/* Rx Requirement badge */}
        {medicine.requiresPrescription && (
          <span className="bg-amber-500 text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md shadow-amber-500/10">
            <AlertCircle className="w-3 h-3" /> Rx Required
          </span>
        )}

        {/* Product Type badge */}
        <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm ${
          medicine.productType === 'PHARMACY_PRODUCT' 
            ? 'bg-teal-50 text-teal-700 border border-teal-100' 
            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
        }`}>
          {medicine.productType === 'PHARMACY_PRODUCT' ? (
            <>
              <Sparkles className="w-2.5 h-2.5" /> General Care
            </>
          ) : (
            <>
              <Activity className="w-2.5 h-2.5" /> Medicine
            </>
          )}
        </span>

        {/* Stock Level Warning badges */}
        {isOutOfStock ? (
          <span className="bg-rose-500 text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-md shadow-rose-500/15">
            Out of stock
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-500 text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-md shadow-amber-500/15 animate-pulse">
            Only {medicine.stockQuantity} Left
          </span>
        ) : (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-sm">
            In Stock
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 pt-16 flex-1 flex flex-col">
        <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">{medicine.manufacturer}</span>
        <h3 className="font-bold text-slate-800 text-base sm:text-lg mt-1.5 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-1">
          {medicine.name}
        </h3>
        <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {medicine.description || "No description available."}
        </p>

        <div className="mt-5 flex gap-5 text-[11px] text-slate-400 font-semibold border-t border-slate-50 pt-4">
          <span>Dosage: <strong className="text-slate-600 font-bold">{medicine.dosage || "N/A"}</strong></span>
          <span>Pack: <strong className="text-slate-600 font-bold">{medicine.packaging || "N/A"}</strong></span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-slate-50/40 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-slate-800 font-extrabold text-lg sm:text-xl">${medicine.price.toFixed(2)}</span>
        <div className="flex gap-2">
          <Link
            to={`/medicines/${medicine.medicineId}`}
            className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 p-2.5 rounded-xl transition-all shadow-sm"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold ${
              isOutOfStock 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-95'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;
