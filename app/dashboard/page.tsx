'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState<boolean>(false);
  const [plusSign, setPlusSign] = useState<boolean>(true);

  useEffect(() => {
    async function getMe() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api_dm/Users/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        console.log('Unauthorized', res.status);
      }
    }

    getMe();
  }, []);

  const handleRegistrationResponse = async (response: any) => {
    let responseData: any = {};
    try {
      responseData = await response.json();
    } catch (e) {}

    if (response.status === 201) {
      alert('✅ Success! Device registered.');
      // Refresh user data or update local state here
      window.location.reload(); 
    } else if (response.status === 200) {
      alert('⚠️ Info: Device was already registered to your account.');
    } else if (response.status === 409) {
      alert(`❌ Error: ${responseData.Message}`);
    } else if (response.status === 401) {
      alert(`❌ Error: ${responseData.Message}`);
    } else {
      alert('An unexpected error occurred during registration.');
    }
  };

  async function registerDevice(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api_dm/Devices/register`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
      .then(handleRegistrationResponse)
      .catch(error => {
        console.error('Network Error:', error);
        alert('A network error prevented the request.');
      });
  }

  const handleRegistrationState = () => {
    setShowRegistrationForm(!showRegistrationForm);
    setPlusSign(!plusSign);
  };

  return (
    <div className='min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900'>
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-4xl font-extrabold tracking-tight text-slate-900'>Devices</h1>
            <p className="text-slate-500 mt-1">Manage and monitor your connected hardware.</p>
          </div>
          <button 
            className={`flex items-center gap-2 px-6 py-3 font-bold text-lg rounded-xl transition-all shadow-sm cursor-pointer ${
              plusSign 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            onClick={handleRegistrationState}
          >
            {plusSign ? (
              <>
                <span>Add</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
              </>
            ) : 'Close'}
          </button>
        </div>

        {/* Registration Form Card */}
        {showRegistrationForm && (
          <div className="mb-10 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-900 p-4 text-white font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Register New Device
            </div>
            <form autoComplete="off" className='p-8 grid grid-cols-1 md:grid-cols-2 gap-6' onSubmit={registerDevice}>
              <div className="flex flex-col gap-2">
                <label htmlFor="Name" className='text-sm font-bold text-slate-700 uppercase tracking-wider'>Device Nickname</label>
                <input 
                  id='Name' 
                  name='Name' 
                  type='text' 
                  placeholder="e.g. Living Room Display"
                  className='w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none'
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="TempCode" className='text-sm font-bold text-slate-700 uppercase tracking-wider'>Pairing Code</label>
                <input 
                  id='TempCode' 
                  name='TempCode' 
                  type='text' 
                  placeholder="6-digit code from device"
                  className='w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none'
                />
              </div>
              <div className='md:col-span-2 flex justify-end mt-2'>
                <button 
                  className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-emerald-100' 
                  type='submit'
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Device List */}
        <div className="grid grid-cols-1 gap-4">
          {!user?.devices || user.devices.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <p className='text-xl font-medium text-slate-600'>No registered devices found.</p>
              <p className='text-slate-400 mb-6'>Click the "Add" button to pair your first device.</p>
            </div>
          ) : (
            user.devices.map((device: any) => (
              <div 
                key={device.id} 
                className='group p-6 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between hover:border-emerald-400 hover:shadow-md transition-all duration-200'
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <h2 className='text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors'>{device.name}</h2>
                    <p className="text-sm font-mono text-slate-400">ID: {device.id}</p>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center gap-4">
                  <Link 
                    href={`/dashboard/device/${device.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                  >
                    Settings
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}