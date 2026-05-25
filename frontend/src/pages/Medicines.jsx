import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import MedicineCard from '../components/MedicineCard';
import { Search, Loader2, Sparkles, Activity, Layers } from 'lucide-react';

const Medicines = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Filtering States sync'd with search parameters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');

  useEffect(() => {
    // Sync state with URL params
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedType(searchParams.get('type') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      let endpoint = '/medicines';
      
      if (searchQuery.trim() !== '') {
        endpoint = `/medicines/search?query=${encodeURIComponent(searchQuery)}`;
      } else {
        const params = [];
        if (selectedCategory) {
          params.push(`categoryId=${selectedCategory}`);
        }
        if (selectedType) {
          params.push(`productType=${selectedType.toUpperCase()}`);
        }
        if (params.length > 0) {
          endpoint = `/medicines?${params.join('&')}`;
        }
      }

      const response = await API.get(endpoint);
      setMedicines(response.data);
    } catch (err) {
      console.error("Failed to fetch medicines", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [selectedCategory, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMedicines();
  };

  const handleCategoryClick = (catId) => {
    setSearchQuery('');
    const newParams = {};
    if (selectedType) newParams.type = selectedType;
    
    if (selectedCategory === catId.toString()) {
      setSelectedCategory('');
      setSearchParams(newParams);
    } else {
      setSelectedCategory(catId.toString());
      newParams.category = catId.toString();
      setSearchParams(newParams);
    }
  };

  const handleTypeTabClick = (type) => {
    setSearchQuery('');
    const newParams = {};
    if (selectedCategory) newParams.category = selectedCategory;

    if (type === '') {
      setSelectedType('');
      setSearchParams(newParams);
    } else {
      setSelectedType(type);
      newParams.type = type;
      setSearchParams(newParams);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 sm:px-8 bg-slate-50/20 min-h-[90vh]">
      
      {/* Header section */}
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Healthcare Catalog</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Find verified prescription medicines or browse general pharmacy products.</p>
        </div>

        {/* Product Type Tabs */}
        <div className="bg-white border border-slate-200/80 p-1.5 rounded-2xl flex gap-1 shadow-sm shrink-0">
          <button
            onClick={() => handleTypeTabClick('')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedType === ''
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Products</span>
          </button>
          <button
            onClick={() => handleTypeTabClick('medicine')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedType === 'medicine'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Medicines</span>
          </button>
          <button
            onClick={() => handleTypeTabClick('pharmacy_product')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedType === 'pharmacy_product'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>General Care</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Filter Sidebar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 h-fit space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase mb-3">Browse Categories</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  const newParams = {};
                  if (selectedType) newParams.type = selectedType;
                  setSearchParams(newParams);
                  setSearchQuery('');
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === '' 
                    ? 'bg-slate-100 text-slate-800 border border-slate-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.categoryId}
                  onClick={() => handleCategoryClick(cat.categoryId)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                    selectedCategory === cat.categoryId.toString() 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                  }`}
                >
                  {cat.categoryName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Products Listing */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog by name, description, or manufacturer..."
                className="w-full bg-white border border-slate-200/80 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm font-semibold transition text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-2xl transition shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/25 text-sm shrink-0"
            >
              Search
            </button>
          </form>

          {/* Catalog Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
          ) : medicines.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-24 text-center">
              <span className="text-5xl filter drop-shadow-sm">🔍</span>
              <h3 className="text-slate-700 font-bold text-lg mt-4">No Products Found</h3>
              <p className="text-slate-400 text-sm mt-1.5 leading-relaxed max-w-sm mx-auto">
                No items match your selected filters. Try changing category tabs or searching for another keyphrase.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medicines.map((medicine) => (
                <MedicineCard
                  key={medicine.medicineId}
                  medicine={medicine}
                  onAddToCartSuccess={fetchMedicines}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Medicines;
