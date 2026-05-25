import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Pill, Plus, Edit2, Trash2, X, Loader2, AlertCircle } from 'lucide-react';

const ManageMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // Form Fields
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dosage, setDosage] = useState('');
  const [packaging, setPackaging] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [manufacturer, setManufacturer] = useState('');

  const fetchMedicines = async () => {
    try {
      const response = await API.get('/medicines');
      setMedicines(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchMedicines(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setCategoryId('');
    setName('');
    setDescription('');
    setDosage('');
    setPackaging('');
    setPrice('');
    setStockQuantity('');
    setRequiresPrescription(false);
    setManufacturer('');
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (medicine) => {
    setEditingId(medicine.medicineId);
    setCategoryId(medicine.category.categoryId);
    setName(medicine.name);
    setDescription(medicine.description);
    setDosage(medicine.dosage);
    setPackaging(medicine.packaging);
    setPrice(medicine.price);
    setStockQuantity(medicine.stockQuantity);
    setRequiresPrescription(medicine.requiresPrescription);
    setManufacturer(medicine.manufacturer);
    setError(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      categoryId: parseInt(categoryId),
      name,
      description,
      dosage,
      packaging,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity),
      requiresPrescription,
      manufacturer
    };

    try {
      if (editingId) {
        await API.put(`/medicines/${editingId}`, payload);
      } else {
        await API.post('/medicines', payload);
      }
      setShowModal(false);
      fetchMedicines();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save medicine data. Ensure all fields are valid.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await API.delete(`/medicines/${id}`);
        fetchMedicines();
      } catch (err) {
        alert("Failed to delete medicine.");
      }
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Manage Medicines</h1>
          <p className="text-slate-400 mt-2">Create new pharmacy inventory entries, update details, or delete items.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-md transition shrink-0 text-sm"
        >
          <Plus className="w-5 h-5" /> Add New Medicine
        </button>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4 sm:p-5">Name</th>
                <th className="p-4 sm:p-5">Category</th>
                <th className="p-4 sm:p-5">Price</th>
                <th className="p-4 sm:p-5">Stock</th>
                <th className="p-4 sm:p-5">Rx Policy</th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {medicines.map((m) => (
                <tr key={m.medicineId} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 sm:p-5">
                    <span className="font-bold text-slate-800 block">{m.name}</span>
                    <span className="text-slate-400 text-xs block">{m.manufacturer} • {m.dosage}</span>
                  </td>
                  <td className="p-4 sm:p-5">
                    <span className="text-slate-500 font-semibold">{m.category.categoryName}</span>
                  </td>
                  <td className="p-4 sm:p-5">
                    <span className="text-slate-800 font-bold">${m.price.toFixed(2)}</span>
                  </td>
                  <td className="p-4 sm:p-5">
                    <span className={`font-bold ${m.stockQuantity <= 5 ? 'text-red-500' : 'text-slate-600'}`}>
                      {m.stockQuantity}
                    </span>
                  </td>
                  <td className="p-4 sm:p-5">
                    {m.requiresPrescription ? (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">Rx Required</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full">OTC</span>
                    )}
                  </td>
                  <td className="p-4 sm:p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(m)}
                        className="text-blue-500 hover:bg-blue-50 p-2 rounded-xl transition border border-transparent hover:border-blue-100"
                        title="Edit Medicine"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.medicineId)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition border border-transparent hover:border-red-100"
                        title="Delete Medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg">
                {editingId ? 'Edit Medicine' : 'Add New Medicine'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl flex gap-2 items-start text-xs font-semibold">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">Medicine Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-semibold text-sm transition"
                    placeholder="e.g. Paracetamol"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">Category</label>
                  <select
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-emerald-500 font-semibold text-sm transition"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">Dosage</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-semibold text-sm transition"
                    placeholder="e.g. 500mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">Packaging</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-semibold text-sm transition"
                    placeholder="e.g. Strip of 10 Tablets"
                    value={packaging}
                    onChange={(e) => setPackaging(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-semibold text-sm transition"
                    placeholder="e.g. 4.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-semibold text-sm transition"
                    placeholder="e.g. 100"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5">Manufacturer</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-semibold text-sm transition"
                    placeholder="e.g. Pfizer"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5">Description</label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-semibold text-sm transition"
                  placeholder="Enter medicine summary or side effect warnings..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <input
                  type="checkbox"
                  id="rx"
                  checked={requiresPrescription}
                  onChange={(e) => setRequiresPrescription(e.target.checked)}
                  className="accent-emerald-600 w-4 h-4"
                />
                <label htmlFor="rx" className="text-slate-700 text-xs font-bold select-none cursor-pointer">
                  Requires Doctor's Approved Prescription (Rx)
                </label>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-50 pt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-3 rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-md text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMedicines;
