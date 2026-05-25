import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../components/Toast';
import { FileSignature, Check, X, ExternalLink, Calendar, User, Eye, AlertCircle, ShieldAlert } from 'lucide-react';

const ManagePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPrescriptions = async () => {
    try {
      const response = await API.get('/prescriptions');
      setPrescriptions(response.data);
    } catch (err) {
      console.error("Failed to load prescriptions", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchPrescriptions();
      setLoading(false);
    };
    init();
  }, []);



  const handleApprove = async (id) => {
    try {
      await API.put(`/prescriptions/${id}/approve`);
      showToast("Prescription approved successfully.", "success");
      fetchPrescriptions();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to approve prescription.", "error");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason (optional):');
    if (reason === null) return;

    try {
      const params = reason.trim() ? { reason: reason.trim() } : {};
      await API.put(`/prescriptions/${id}/reject`, null, { params });
      showToast("Prescription rejected.", "error");
      fetchPrescriptions();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reject prescription.", "error");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">APPROVED</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full">REJECTED</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">PENDING</span>;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Manage Prescriptions</h1>
          <p className="text-slate-400 mt-2">Verify customer prescriptions for restricted medicines and regulate purchases.</p>
        </div>
      </div>



      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <span className="text-4xl block mb-4">📑</span>
          <h3 className="text-slate-800 font-bold text-lg">No Prescriptions Uploaded</h3>
          <p className="text-slate-400 text-sm mt-1">Uploaded customer medical prescriptions will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase font-extrabold bg-slate-50/50">
                  <th className="p-5">Prescription ID</th>
                  <th className="p-5">Customer Name</th>
                  <th className="p-5">Uploaded Date</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Verified By</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {prescriptions.map((p) => {
                  const fullUrl = `http://localhost:8080${p.fileUrl}`;
                  return (
                    <tr key={p.prescriptionId} className="hover:bg-slate-50/30 transition">
                      <td className="p-5 font-bold text-slate-800">
                        #Rx-200{p.prescriptionId}
                        {p.orderId && (
                          <span className="block text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-150 rounded-full px-2 py-0.5 mt-1 w-fit">
                            Order #100{p.orderId}
                          </span>
                        )}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-700">{p.userFullName}</span>
                        </div>
                      </td>
                      <td className="p-5 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{new Date(p.uploadedAt).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        {getStatusBadge(p.status)}
                      </td>
                      <td className="p-5 text-xs text-slate-400 font-semibold italic">
                        {p.verifiedBy || 'Not Verified'}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl transition flex items-center gap-1.5 font-bold text-xs shadow-sm border border-slate-200"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>

                          {p.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(p.prescriptionId)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition flex items-center gap-1 font-bold text-xs shadow-sm shadow-emerald-100"
                                title="Approve Prescription"
                              >
                                <Check className="w-4 h-4" />
                                <span className="hidden sm:inline">Approve</span>
                              </button>
                              <button
                                onClick={() => handleReject(p.prescriptionId)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition flex items-center gap-1 font-bold text-xs border border-red-100"
                                title="Reject Prescription"
                              >
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline">Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePrescriptions;
