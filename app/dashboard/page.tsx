'use client'; // client component must NOT be async

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState<boolean>(false);
  const [plusSign, setPlusSign] = useState<any>(null);

  useEffect(() => {
    async function getMe() {
      const res = await fetch('http://localhost:5231/api_dm/Users/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        console.log(data)
      } else {
        console.log('Unauthorized', res.status);
        // optional: redirect to login page
      }
    }

    getMe();
    setPlusSign(true);
  }, []);

  const handleRegistrationResponse = async (response: any) => {
    // Attempt to parse the JSON body
    let responseData: any = {};
    try {
        responseData = await response.json();
    } catch (e) {
        // Handle non-JSON responses if necessary
    }

    // Check the Status Code
    if (response.status === 201) {
        // New device successfully created
        alert('✅ Success! Device registered.');
        console.log(responseData.device);
    } else if (response.status === 200) {
        // Device already existed for this user
        alert('⚠️ Info: Device was already registered to your account.');
    } else if (response.status === 409) {
        // Device is registered to another user (Conflict)
        alert(`❌ Error: ${responseData.Message}`); // Shows "This device is already registered to another user."
    } else if (response.status === 401) {
        // Unauthorized
        alert('❌ Error: You must be logged in to register a device.');
    } else {
        // Handle other errors (e.g., 400 Bad Request if validation fails)
        alert('An unexpected error occurred during registration.');
        console.error(responseData);
    }
};
   async function registerDevice(e: any) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const res = await fetch('http://localhost:5231/api_dm/Devices/register', {
        method: 'POST',
        credentials: 'include',
        body: formData
      }).then(handleRegistrationResponse).catch(error => {
        console.error('Network Error:', error);
        alert('A network error prevented the request.');
        });
    }
    const handleRegistrationState = () => {
        setShowRegistrationForm(!showRegistrationForm);
    }
  return (
    <div className='flex flex-wrap flex-col p-8'>
        <div className='flex justify-between'>
            <h1 className='text-4xl ml-4 pt-8 pb-4 font-bold tracking-tighter content-end'>Devices</h1>
            <button className=' bg-green-500 drop-shadow-md drop-shadow-green-200 font-bold text-2xl rounded-2xl m-4 p-8 cursor-pointer' 
                onClick={() => {handleRegistrationState(); setPlusSign(!plusSign)}}>{plusSign == true ? 'Add +' : 'Close'}
            </button>
        </div>
       { !user?.devices.length ? <p className='text-2xl m-4'>You have no registered devices. Click the Add button to register!</p> :
          user.devices.map((device: any) => {
                return <div key={device.id} className='p-8 bg-gray-50 m-4 rounded-2xl hover:drop-shadow-lg'>
                            <h2 className='text-2xl'>{device.name}</h2>
                            <p>{device.id} | <a href={`/dashboard/device/${device.id}`}
                                className="underline hover:text-blue-400"
                                >View Settings</a>
                            </p>
                    </div>
            })
      }
      {showRegistrationForm && 
      <form autoComplete="off" className='flex flex-col m-4 p-8 rounded-2xl bg-gray-50 drop-shadow-2xl' onSubmit={registerDevice}>
        <label htmlFor="Name" className='font-bold mt-4'>Device Name</label>
        <input id='Name' name='Name' type='text' className='border-2 p-2 rounded-md bg-white focus:ring-green-500 focus:outline-none focus:ring-2 focus:ring-offset-0'></input>
        <label htmlFor="TempCode" className='font-bold mt-4'>Temporary Code</label>
        <input id='TempCode' name='TempCode' type='text' className='border-2 p-2 rounded-md bg-white focus:ring-green-500 focus:outline-none focus:ring-2 focus:ring-offset-0'></input>
        <div className='flex justify-end'>
        <button className=' bg-green-500 drop-shadow-md drop-shadow-green-200 font-bold rounded-lg  cursor-pointer m-4 p-4 mr-0 content-end' type='submit'>Register Device</button>
        </div>
      </form>}
     
    </div>
  );
}
