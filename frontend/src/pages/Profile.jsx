import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Award, ShieldAlert } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 sm:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">Your Profile</h1>
        <p className="text-slate-400 mt-2">Manage contact info and loyalty points dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Loyalty card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between aspect-[4/3] md:aspect-auto md:h-64">
          <div>
            <Award className="w-10 h-10 text-emerald-300" />
            <h3 className="font-extrabold text-lg mt-4">Loyalty Reward Points</h3>
            <p className="text-emerald-100 text-xs mt-1">Earned on your orders</p>
          </div>
          <div>
            <span className="text-5xl font-extrabold tracking-tight">{user.loyaltyPoints || 0}</span>
            <span className="text-xs text-emerald-200 block mt-2 font-bold uppercase tracking-wider">Active Points Balance</span>
          </div>
          <div className="absolute right-0 bottom-0 text-[10rem] opacity-5 select-none translate-x-12 translate-y-12">
            🏅
          </div>
        </div>

        {/* Profile Card details */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-50 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" /> Account Information
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-xs text-slate-400 font-semibold block">Full Name</span>
                <span className="text-slate-800 font-bold text-sm block mt-0.5">{user.fullName}</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-xs text-slate-400 font-semibold block">Role</span>
                <span className="text-slate-800 font-bold text-sm block mt-0.5">{user.role}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-xs text-slate-400 font-semibold block">Email Address</span>
                  <span className="text-slate-800 font-bold text-sm block mt-0.5 truncate">{user.email}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Phone Number</span>
                  <span className="text-slate-800 font-bold text-sm block mt-0.5">{user.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex gap-3">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Default Shipping Address</span>
                <span className="text-slate-800 font-bold text-sm block mt-1 leading-relaxed">{user.address || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
