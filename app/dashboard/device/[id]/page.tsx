'use client';

import { useEffect, useState } from "react";
import * as React from 'react'
import { Device } from "@/app/models/device";


export default function DevicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

    const { id } = React.use(params)
    const [device, setDevice] = useState<Device | null>(null);
    
    useEffect(() => {
        if (!id) {
            console.log("ID is not yet available, skipping fetch.");
            return; 
        }

        async function getDevice() {
            const res = await fetch(`http://localhost:5231/api/Devices/device?id=${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

            if (res.ok) {
                const data = await res.json();
                setDevice(data);
                console.log(data)
            } else {
                console.error("Failed to fetch device data");
            }
        }
        
        getDevice();
    
    }, [id]);


    const hasSubwayStops = device?.stops && device?.stops.length > 0
    
  return (
    <div className='flex flex-wrap flex-col content-center'>
      <h1 className='text-4xl'>{device?.name}</h1>
      {hasSubwayStops && 
      <h2 className="text-2xl">Subway Stations</h2>
      }
      {hasSubwayStops &&
      device?.stops.map(stop => {
          return <p key={stop.stopId} className="flex flex-col">{stop.stopName}{' '}
            <a href={`https://www.google.com/maps/search/?api=1&query=${stop.stopLat},${stop.stopLon}`}
              className="underline hover:text-blue-400"
              target="_blank" rel="noopener"
            >View on Google Maps</a>
          </p>
        })
      }

        {/* 

            Settings Form Goes Here
            Saved to Server
            Sent to Device via MQTT
            Saved on Device

        */}

    </div>
  );
}
