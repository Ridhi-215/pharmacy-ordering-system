import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { ShoppingCart, LogOut, User, LayoutDashboard, Pill, ClipboardList, FileSignature, Menu, X, Search, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  // Search and Category Dropdown states
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  // Dynamic Cart Item Count Listener
  const fetchCartCount = async () => {
    if (user && user.role === 'CUSTOMER') {
      try {
        const response = await API.get('/cart');
        const count = response.data.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      } catch (err) {
        console.error("Failed to load cart count", err);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();

    // Listen to custom cart-updated events across components
    window.addEventListener('cart-updated', fetchCartCount);
    return () => {
      window.removeEventListener('cart-updated', fetchCartCount);
    };
  }, [user, location]);

  // Fetch Categories for Dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Category Dropdown */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-emerald-600 font-extrabold text-xl sm:text-2xl hover:opacity-95 transition-opacity">
              <span className="text-3xl filter drop-shadow-sm">⚕️</span>
              <span className="tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                PharmaCare
              </span>
            </Link>

            {/* Categories Dropdown for Desktop */}
            <div className="hidden md:relative md:block">
              <button
                onClick={() => setShowCatDropdown(!showCatDropdown)}
                onBlur={() => setTimeout(() => setShowCatDropdown(false), 200)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 font-bold text-sm transition-colors py-2 px-3 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCatDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCatDropdown && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    to="/medicines"
                    className="block px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 text-xs font-bold transition-colors"
                  >
                    All Products
                  </Link>
                  <div className="border-t border-slate-50 my-1"></div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.categoryId}
                      to={`/medicines?category=${cat.categoryId}`}
                      className="block px-4 py-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 text-xs font-bold transition-colors"
                    >
                      {cat.categoryName}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/medicines" className="hidden md:block text-slate-600 hover:text-emerald-600 font-bold text-sm transition-colors py-2">
              Shop Products
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative w-full max-w-xs xl:max-w-sm mx-6">
            <input
              type="text"
              placeholder="Search health products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl py-2 pl-4 pr-10 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-xs font-semibold"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-600 transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Menu Options */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Admin Menu */}
                {user.role === 'ADMIN' && (
                  <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 p-1 rounded-xl">
                    <Link
                      to="/admin"
                      className="text-slate-600 hover:text-emerald-600 hover:bg-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold text-[11px] transition"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/admin/medicines"
                      className="text-slate-600 hover:text-emerald-600 hover:bg-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold text-[11px] transition"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>Products</span>
                    </Link>
                    <Link
                      to="/admin/orders"
                      className="text-slate-600 hover:text-emerald-600 hover:bg-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold text-[11px] transition"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Orders</span>
                    </Link>
                  </div>
                )}

                {/* Customer Menu */}
                {user.role === 'CUSTOMER' && (
                  <>
                    <div className="flex flex-col text-right leading-tight bg-emerald-50 border border-emerald-100/50 px-3 py-1 rounded-xl text-emerald-800 text-[10px] font-bold">
                      <span className="text-xs text-emerald-700">{user.loyaltyPoints || 0}</span>
                      <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-extrabold">Reward Pts</span>
                    </div>

                    <Link
                      to="/cart"
                      className="text-slate-600 hover:text-emerald-600 p-2.5 rounded-xl border border-slate-100 hover:bg-emerald-50/40 transition relative group"
                      title="Shopping Cart"
                    >
                      <ShoppingCart className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white animate-scale-in">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {/* Profile Card & Logout */}
                <Link
                  to="/profile"
                  className="text-slate-700 hover:text-emerald-600 py-1.5 px-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition flex items-center gap-1.5 text-xs font-bold"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{user.fullName.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-rose-500 hover:text-white p-2 rounded-xl border border-rose-100 hover:bg-rose-500 hover:border-rose-500 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-slate-600 hover:text-emerald-600 font-bold px-3 py-2 rounded-xl text-xs transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 shadow-lg">
          {/* Search bar inside drawer */}
          <form onSubmit={handleSearchSubmit} className="relative w-full py-1">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-4 pr-10 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs font-semibold"
            />
            <button type="submit" className="absolute right-3 top-4.5 text-slate-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <Link
            to="/medicines"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-bold px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition"
          >
            Shop Products
          </Link>

          {user && user.role === 'CUSTOMER' && (
            <>
              <Link
                to="/prescription/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 font-bold px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition"
              >
                Upload Prescription
              </Link>
              <Link
                to="/orders/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 font-bold px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition"
              >
                Order History
              </Link>
            </>
          )}

          {user && user.role === 'ADMIN' && (
            <div className="border-t border-slate-100 pt-3 space-y-1">
              <span className="block text-slate-400 text-[10px] font-bold tracking-wider uppercase px-3 mb-2">Admin Dashboard</span>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 font-bold px-3 py-2 rounded-xl hover:bg-slate-50 transition"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/medicines"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 font-bold px-3 py-2 rounded-xl hover:bg-slate-50 transition"
              >
                Products
              </Link>
            </div>
          )}

          {user ? (
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-3">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-slate-750 font-bold px-3 py-2 rounded-xl hover:bg-slate-50 transition text-sm"
              >
                <User className="w-5 h-5 text-slate-500" />
                <span>{user.fullName}</span>
                {user.role === 'CUSTOMER' && (
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {user.loyaltyPoints || 0} pts
                  </span>
                )}
              </Link>

              {user.role === 'CUSTOMER' && (
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-slate-700 font-bold px-3 py-2 rounded-xl hover:bg-slate-50 transition text-sm"
                >
                  <ShoppingCart className="w-5 h-5 text-slate-500" />
                  <span>Shopping Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 font-semibold py-3 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-4 flex gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center text-slate-700 border border-slate-200 font-bold py-2.5 rounded-xl text-sm transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-md"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
