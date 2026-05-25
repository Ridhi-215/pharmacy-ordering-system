import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Clock, HeartHandshake, ArrowRight, Pill, Sparkles, Activity, ShieldAlert } from 'lucide-react';

const Home = () => {
  const categories = [
    { id: 1, name: 'Analgesics', desc: 'Relief from body pains, headaches, and fevers.', color: 'from-blue-500 to-indigo-600', icon: '💊' },
    { id: 2, name: 'Antibiotics', desc: 'Prescription bacterial infection treatments.', color: 'from-emerald-500 to-teal-600', icon: '🧫' },
    { id: 3, name: 'Vitamins & Supplements', desc: 'Daily nutrients for immune health.', color: 'from-amber-500 to-orange-600', icon: '🍊' },
    { id: 4, name: 'Cardiologic', desc: 'Blood pressure and heart medications.', color: 'from-rose-500 to-red-600', icon: '❤️' },
    { id: 5, name: 'Antidiabetic', desc: 'Insulin and blood sugar regulators.', color: 'from-cyan-500 to-blue-600', icon: '🍭' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-700 text-white py-20 px-6 sm:px-12 lg:px-24 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl transform -translate-x-20 translate-y-20"></div>

        <div className="max-w-5xl mx-auto z-10 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8">
            <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/20 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Your Professional Digital Pharmacy
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mt-5 leading-tight tracking-tight">
              Genuine Medicines & <br />Daily Health Products
            </h1>
            <p className="text-emerald-100 text-lg mt-6 max-w-2xl leading-relaxed">
              Order verified prescription medications and general healthcare products safely online. Fast delivery directly to your door with real-time pharmacist support.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/medicines"
                className="bg-white text-teal-800 font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:bg-emerald-50 transition duration-300 flex items-center gap-2"
              >
                Browse Shop <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/prescription/upload"
                className="bg-teal-900/40 border border-teal-200/30 hover:bg-teal-900/60 text-white font-semibold px-8 py-3.5 rounded-2xl transition duration-300"
              >
                Upload Prescription
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-4 hidden lg:flex justify-center">
            <div className="text-[12rem] select-none filter drop-shadow-lg animate-bounce duration-[4000ms]">
              🩺
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/50 flex gap-4 items-start hover:shadow-md transition">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl border border-emerald-100/50"><ShieldCheck className="w-6 h-6" /></div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">100% Genuine</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">Sourced directly from verified distributors and global pharmaceutical brands.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/50 flex gap-4 items-start hover:shadow-md transition">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl border border-emerald-100/50"><Truck className="w-6 h-6" /></div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Express Home Delivery</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">Safe packaging and rapid delivery directly to your door.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/50 flex gap-4 items-start hover:shadow-md transition">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl border border-emerald-100/50"><Clock className="w-6 h-6" /></div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Quick Approvals</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">Swift reviews for prescription uploads by our registered medical admins.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/50 flex gap-4 items-start hover:shadow-md transition">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl border border-emerald-100/50"><HeartHandshake className="w-6 h-6" /></div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Loyalty Points</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">Earn points automatically on every checkout and redeem them for rewards.</p>
          </div>
        </div>
      </section>

      {/* Product Categories Split Section (Medicines vs Pharmacy Products) */}
      <section className="max-w-7xl mx-auto py-8 px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-emerald-600 font-bold text-xs tracking-widest uppercase">Explore Our Categories</span>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">Two Primary Departments</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">Browse products across our two distinct categories to find exactly what you need.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Card 1: Prescription & OTC Medicines */}
          <div className="bg-gradient-to-br from-white to-emerald-50/20 border border-slate-100 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-[0.03] transform translate-x-8 translate-y-8 select-none group-hover:scale-105 transition-transform duration-500">
              <Pill className="w-64 h-64 text-emerald-800" />
            </div>
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 mb-6">
              <Pill className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Prescription & OTC Medicines</h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Find essential therapeutic medications, analgesics, cardiologics, antibiotics, and antidiabetics. Some require an approved prescription upload.
            </p>
            <div className="mt-8">
              <Link
                to="/medicines?type=medicine"
                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-bold text-sm tracking-wide gap-1 group-hover:gap-2 transition-all"
              >
                Shop Medicines
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: General Pharmacy Products */}
          <div className="bg-gradient-to-br from-white to-teal-50/20 border border-slate-100 p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-[0.03] transform translate-x-8 translate-y-8 select-none group-hover:scale-105 transition-transform duration-500">
              <Sparkles className="w-64 h-64 text-teal-800" />
            </div>
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100 mb-6">
              <Sparkles className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Vitamins, Personal Care & PPE</h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Explore wellness supplements, daily multivitamins, protein powders, sanitizers, protective masks, and personal hygiene essentials. 100% prescription-free.
            </p>
            <div className="mt-8">
              <Link
                to="/medicines?type=pharmacy_product"
                className="inline-flex items-center text-teal-600 hover:text-teal-700 font-bold text-sm tracking-wide gap-1 group-hover:gap-2 transition-all"
              >
                Shop Daily Essentials
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto pb-24 px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-emerald-600 font-bold text-xs tracking-widest uppercase">Browse Therapeutic Areas</span>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">Browse by Medical Category</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">Explore targeted areas of health, nutrition, and treatment options.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/medicines?category=${cat.id}`}
              className="bg-white rounded-3xl p-6 border border-slate-100/50 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl group-hover:scale-110 transition duration-300">
                {cat.icon}
              </div>
              <h3 className="font-bold text-slate-800 mt-5 group-hover:text-emerald-600 transition text-sm sm:text-base tracking-tight">{cat.name}</h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>
      
    </div>
  );
};

export default Home;
