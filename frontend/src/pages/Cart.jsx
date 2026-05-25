import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../components/Toast';
import { Trash2, ShoppingBag, ArrowRight, AlertCircle, Loader2, Minus, Plus, ShieldAlert } from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { showToast } = useToast();

  const fetchCart = async () => {
    try {
      const response = await API.get('/cart');
      setCartItems(response.data);
    } catch (err) {
      setError("Failed to retrieve cart items.");
      showToast("Failed to retrieve cart items.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (cartId) => {
    try {
      await API.delete(`/cart/remove/${cartId}`);
      setCartItems(cartItems.filter(item => item.cartId !== cartId));
      
      // Dispatch custom update event for Navbar
      window.dispatchEvent(new Event('cart-updated'));
      showToast("Item removed from your cart.", "success");
    } catch (err) {
      showToast("Failed to remove item from cart.", "error");
    }
  };

  const handleQuantityChange = async (cartId, newQty, stockQty) => {
    if (newQty <= 0) {
      handleRemove(cartId);
      return;
    }
    if (newQty > stockQty) {
      showToast(`Cannot add more items. Only ${stockQty} items are available in stock.`, "warning");
      return;
    }

    try {
      await API.put(`/cart/update/${cartId}?quantity=${newQty}`);
      
      // Update local cart state
      setCartItems(prev =>
        prev.map(item => (item.cartId === cartId ? { ...item, quantity: newQty } : item))
      );

      // Dispatch update event for Navbar count
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update quantity.", "error");
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

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 sm:px-8 bg-slate-50/20 min-h-[90vh]">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Shopping Cart</h1>
        <p className="text-slate-500 mt-1.5 text-sm">Review items, adjust quantities, and confirm prescriptions before checkout.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-xl shadow-slate-100/50 max-w-xl mx-auto py-16">
          <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            🛒
          </div>
          <h2 className="text-slate-855 font-bold text-xl tracking-tight">Your Cart is Empty</h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-sm mx-auto">
            You haven't added any pharmaceutical items or wellness products to your cart yet. Sourced from verified clinical pharmacies.
          </p>
          <Link
            to="/medicines"
            className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition inline-flex items-center gap-2 text-sm"
          >
            Browse Store Catalog <ArrowRight className="w-4 h-4 animate-pulse" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cartId}
                className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 hover:shadow-md transition duration-200"
              >
                {/* Left Side: Product Description */}
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100/30 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                    💊
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-850 text-base leading-snug">{item.name}</h3>
                    <p className="text-[11px] text-slate-400 font-extrabold tracking-wide uppercase mt-0.5">{item.dosage} • {item.packaging}</p>
                    <div className="flex gap-2.5 items-center mt-2.5">
                      <span className="text-slate-850 font-bold text-sm">${item.price.toFixed(2)} each</span>
                      {item.requiresPrescription && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-100 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-500" /> Rx Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Quantity Adjusters & Total Cost */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-50 pt-4 sm:pt-0 gap-3">
                  <span className="text-slate-800 font-extrabold text-base sm:text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                  
                  <div className="flex items-center gap-4">
                    {/* Quantity Selector buttons */}
                    <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                      <button
                        onClick={() => handleQuantityChange(item.cartId, item.quantity - 1, item.stockQuantity)}
                        className="text-slate-500 hover:bg-white hover:text-slate-700 p-1.5 rounded-lg transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-extrabold text-slate-800 px-3 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.cartId, item.quantity + 1, item.stockQuantity)}
                        className="text-slate-500 hover:bg-white hover:text-slate-700 p-1.5 rounded-lg transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.cartId)}
                      className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl border border-transparent hover:border-rose-100 transition"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Cart Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50 h-fit space-y-6">
            <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-50 pb-3 uppercase tracking-wide text-sm">Order Summary</h3>
            
            <div className="space-y-4 text-xs font-bold">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Items</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimated Delivery</span>
                <span className="text-emerald-600">FREE</span>
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between font-extrabold text-slate-800 text-lg">
                <span>Est. Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            {requiresRx && (
              <div className="bg-amber-50/70 border border-amber-200/50 text-amber-900 p-4.5 rounded-2xl text-xs flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-amber-800">Prescription Upload Required</span>
                  <p className="mt-1.5 leading-relaxed text-amber-700">
                    This order contains clinical medicines. You must have an approved prescription in your account to successfully checkout and place this order.
                  </p>
                  <Link to="/prescription/upload" className="text-emerald-700 hover:text-emerald-800 font-extrabold mt-2.5 inline-flex items-center gap-1 hover:underline">
                    Upload prescription now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            <Link
              to="/checkout"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/25 transition duration-200 w-full text-sm shrink-0"
            >
              <ShoppingBag className="w-4.5 h-4.5" /> 
              <span>Proceed to Checkout</span>
            </Link>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;
