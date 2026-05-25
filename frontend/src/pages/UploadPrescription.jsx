import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Loader2, Calendar } from 'lucide-react';

const UploadPrescription = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [message, setMessage] = useState(null);
  const [msgType, setMsgType] = useState('success');

  const fetchPrescriptions = async () => {
    try {
      const response = await API.get('/prescriptions');
      setPrescriptions(response.data);
    } catch (err) {
      console.error("Failed to load prescriptions", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      triggerMessage("Please select a file first.", "error");
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post('/prescriptions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      triggerMessage("Prescription uploaded successfully. Awaiting admin review.", "success");
      setFile(null);
      // Reset the file input element manually
      e.target.reset();
      fetchPrescriptions();
    } catch (err) {
      triggerMessage(err.response?.data?.message || "Failed to upload prescription. Make sure it's under 10MB.", "error");
    } finally {
      setUploading(false);
    }
  };

  const triggerMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMsgType(type);
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">APPROVED</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full">REJECTED</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">PENDING REVIEW</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Upload Column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-slate-800">Upload prescription</h1>
          <p className="text-slate-400 mt-2 text-sm">Provide a photo/PDF of your medical doctor's note.</p>
        </div>

        <form onSubmit={handleUploadSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          {message && (
            <div className={`p-4 rounded-xl text-xs font-semibold ${
              msgType === 'success' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'
            }`}>
              {message}
            </div>
          )}

          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center transition cursor-pointer relative bg-slate-50/50">
            <input
              type="file"
              accept=".pdf,image/*"
              required
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <span className="text-slate-700 font-bold block text-sm">Click to choose a file</span>
            <span className="text-slate-400 text-xs mt-1 block">Supports PDF, PNG, JPG (Max 10MB)</span>
          </div>

          {file && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-600 shrink-0" />
              <div className="overflow-hidden">
                <span className="text-slate-700 font-bold text-sm block truncate">{file.name}</span>
                <span className="text-slate-400 text-xs font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition duration-200 w-full"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Upload Document'
            )}
          </button>
        </form>
      </div>

      {/* History Column */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="font-extrabold text-slate-800 text-xl">Upload History</h3>

        {loadingList ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
            <span className="text-4xl block mb-4">📄</span>
            <h4 className="text-slate-700 font-bold text-base">No Prescriptions Uploaded</h4>
            <p className="text-slate-400 text-xs mt-1">Upload records when checking out restricted products.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((p) => (
              <div
                key={p.prescriptionId}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex justify-between items-center hover:shadow-md transition duration-200"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <a
                      href={`http://localhost:8080${p.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-slate-800 text-sm hover:text-emerald-600 transition hover:underline"
                    >
                      Prescription #{p.prescriptionId}
                    </a>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-semibold mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(p.uploadedAt).toLocaleDateString()}</span>
                      {p.verifiedBy && (
                        <>
                          <span>•</span>
                          <span>Verified by: {p.verifiedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {getStatusBadge(p.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPrescription;
