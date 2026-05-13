'use client';

import { useEffect, useState, useMemo } from "react";
import * as React from 'react'
import { Device } from "@/app/models/device";
import { GoogleMapsEmbed } from '@next/third-parties/google'
import { Station } from "@/app/models/station";
import TimezoneSelect from "@/components/timezoneselect";
import TimePicker from "@/components/timepicker";

export default function DevicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = React.use(params)
  const [device, setDevice] = useState<Device | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [stations, setStations] = useState<string[] | null>(null);

  const [stationsFiltered, setStationsFiltered] = useState<string[] | null>(null);

  const [currentStation, setCurrentStation] = useState<Station | undefined>(undefined);

  const [selectedDirections, setSelectedDirections] = useState<Record<string, Record<string, boolean>>>({});

  const [brightnessLevel, setBrightnessLevel] = useState<string | null>(null);

  const [startDimTime, setStartDimTime] = useState<string>("");
  const [endDimTime, setEndDimTime] = useState<string>("");

  useEffect(() => {
    if (!id) {
      console.log("ID is not yet available, skipping fetch.");
      return;
    }

    async function getDevice() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api_dm/Devices/device?id=${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setDevice(data);
        // console.log(data)
      } else {
        console.error("Failed to fetch device data 3");
      }
    }

    getDevice();
    handleStations();

  }, [id]);

  useEffect(() => {
    if (searchText === null || stations === null) return;

    const timeoutId = setTimeout(() => {
      const search = searchText.toUpperCase();

      const filteredStations = stations.filter(s => {
        return s.toUpperCase().includes(search);
      });

      setStationsFiltered(filteredStations);

    }, 300);

    return () => clearTimeout(timeoutId);

  }, [searchText, stations]);

  useEffect(() => {
    if (!currentStation || !device) return;

    const preselected: Record<string, Record<string, boolean>> = {};

    device.routeTopics.forEach(rt => {
      if (Object.values(currentStation.routes).some(r => r.gtfsStopId === rt.stopId)) {
        if (!preselected[rt.routeId]) preselected[rt.routeId] = {};
        preselected[rt.routeId][rt.direction] = true;
      }
    });

    setSelectedDirections(preselected);
  }, [currentStation, device]);

  async function getStations(stopName: string = "") {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api_dm/Devices/get-stop?stopName=${stopName}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  }

  async function addStop(routeTopic: string = "") {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api_dm/Devices/add-stop?routeTopics=${routeTopic}&deviceId=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  }

  async function removeStop(routeTopic: string = "") {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api_dm/Devices/delete-stop?routeTopics=${routeTopic}&deviceId=${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  }

  async function updateBrightness(brightnessLevel: number) {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api_dm/Devices/set-brightness?brightnessLevel=${brightnessLevel}&deviceId=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  }

  async function updateGmt(gmt: string) {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api_dm/Devices/set-gmt?gmt=${gmt}&deviceId=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  }

  async function setDimTime(startTime: string, endTime: string) {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api_dm/Devices/set-dim-times?startTime=${startTime}&endTime=${endTime}&deviceId=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  }

  async function handleStations() {
    var res = await getStations();
    if (res.ok) {
      const data = await res.json();
      setStations(data);
      setStationsFiltered(data)
      // console.log(data)
    } else {
      console.error("Failed to fetch device data 1");
    }
  }

  async function handleStation(stopName: string) {
    var res = await getStations(stopName);
    if (res.ok) {
      const data = await res.json();
      setCurrentStation(data);
      // console.log(data)
    } else {
      console.error("Failed to fetch device data 2");
    }
  }

  const updateMap = (event: any) => {
    event.preventDefault();
    handleStation(event.target.value);
  }

  const updateResults = (event: any) => {
    setSearchText(event.target.value);
  }

  const handleDirectionToggle = (routeKey: string, direction: string) => {
    setSelectedDirections(prev => ({
      ...prev,
      [routeKey]: {
        ...prev[routeKey],
        [direction]: !(prev[routeKey]?.[direction] ?? false),
      }
    }));
  };

  const handleBrightness = async () => {
    const level = Number(brightnessLevel);

    if (level < 1 || level > 15) {
      alert("Brightness level must be between 1 and 15.");
      return;
    }

    var res = await updateBrightness(level);
    if (res.ok) {
      const data = await res.json();
      // console.log(data)
    } else {
      console.error("Failed to fetch device data 3");
    }
  };

  const handleGmt = async (gmt: any) => {
    var res = await updateGmt(gmt);
    if (res.ok) {
      const data = await res.json();
      // console.log(data)
    } else {
      console.error("Failed to fetch device data 4");
    }
  };

  const handleDimTime = async () => {
    // console.log(startDimTime, endDimTime);
    var res = await setDimTime(startDimTime, endDimTime);
    if (res.ok) {
      const data = await res.json();
      // console.log(data)
    } else {
      console.error("Failed to fetch device data 4");
    }
  };

  async function handleAddStop(event: any) {
    event.preventDefault();

    const routeId = event.target.value;
    const stopId = currentStation?.routes[routeId].gtfsStopId;

    const north = selectedDirections[routeId]?.['N'] ?? false;
    const south = selectedDirections[routeId]?.['S'] ?? false;
    const direction = north && south ? "BOTH" : north ? "N" : south ? "S" : "";

    if (direction === "") {
      alert("Please choose a direction for your route by clicking on one or both of the checkboxes.");
      return;
    }

    const res = await addStop(`${stopId}/${routeId}/${direction}`);
    if (res.ok) {
      const data = await res.json();
      setDevice(data);
    } else {
      console.error("Failed to add station");
    }
  }

  async function handleRemoveStop(event: any) {
    event.preventDefault();
    const stopValue = event.currentTarget.value;
    // console.log(stopValue)

    const res = await removeStop(stopValue);
    if (res.ok) {
      const data = await res.json();
      setDevice(data);
    } else {
      console.error("Failed to delete station");
    }
  }

  

  const hasSubwayStops = device?.routeTopics && device?.routeTopics.length > 0;

  const stationDetailSection = useMemo(() => {
    if (!currentStation) return null;

    return (
      <div className="flex flex-col bg-slate-50 border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm mt-6">
        <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-6">
          {currentStation.stopName} <span className="text-slate-400 font-medium ml-2">| {currentStation.line}</span>
        </h2>
        
        <div className="flex flex-wrap gap-6 mb-8">
          {Object.entries(currentStation?.routes ?? {}).map(([key, value]) => {
            const bothAdded = ['N', 'S'].every(dir =>
              device?.routeTopics.some(rt => rt.stopId === value.gtfsStopId && rt.routeId === key && rt.direction === dir)
            );

            return (
              <div key={key} className="flex flex-col items-center bg-white border border-slate-200 p-5 rounded-xl shadow-sm w-full max-w-[200px]">
                <div className={`train-${key}-icon flex justify-center items-center text-white font-bold w-16 h-16 text-4xl rounded-full shadow-sm bg-slate-800 mb-4 transition-transform hover:scale-105`}>
                  <span>{key}</span>
                </div>
                
                <div className="flex flex-col gap-3 w-full mb-6">
                  {[
                    { key: 'N', label: value.northDirectionLabel },
                    { key: 'S', label: value.southDirectionLabel }
                  ].map(({ key: direction, label }) => {
                    const alreadyAdded = device?.routeTopics.some(
                      rt => rt.stopId === value.gtfsStopId && rt.routeId === key && rt.direction === direction
                    );

                    return (
                      <label key={direction} className={`flex items-start space-x-3 ${alreadyAdded ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-slate-50'} p-2 rounded-lg transition-colors`}>
                        <input
                          type="checkbox"
                          checked={selectedDirections[key]?.[direction] ?? false}
                          onChange={() => !alreadyAdded && handleDirectionToggle(key, direction)}
                          disabled={alreadyAdded}
                          className="mt-1 w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-slate-700 leading-tight">{label}</span>
                      </label>
                    );
                  })}
                </div>
                
                <button
                  onClick={handleAddStop}
                  value={key}
                  disabled={bothAdded}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold py-2.5 px-4 transition-colors disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                  {bothAdded ? 'Added' : 'Add Route'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <GoogleMapsEmbed
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}
            height={250}
            width="100%"
            mode="view"
            center={currentStation?.gtfsLatitude + "," + currentStation?.gtfsLongitude}
            zoom="16"
          />
        </div>
      </div>
    );
  }, [currentStation, selectedDirections, device]);

  const subscribedStationsSection = useMemo(() => {
    return (
      <div className="flex flex-col mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Subscribed Stations</h2>
          <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">
            {device?.routeTopics?.length || 0} / 10
          </span>
        </div>
        
        <div className="space-y-3">
          {device?.routeTopics.map(stop => (
            <div key={stop.stopId + stop.routeId + stop.direction} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-emerald-300 transition-colors group">
              <div className="flex flex-col">
                <p className="font-semibold text-slate-800">
                  {stop.stopName} <span className="text-slate-400 font-normal mx-1">•</span> {stop.routeId} ({stop.directionLabel})
                </p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${stop.stopLat},${stop.stopLon}`}
                  className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 w-max"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View on Google Maps
                </a>
              </div>
              <button 
                onClick={handleRemoveStop} 
                value={`${stop.stopId}/${stop.routeId}/${stop.direction}`} 
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Remove stop"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          ))}
          {(!device?.routeTopics || device.routeTopics.length === 0) && (
             <p className="text-slate-500 italic p-4 text-center border border-dashed border-slate-300 rounded-xl">No stations subscribed yet.</p>
          )}
        </div>
      </div>
    );
  }, [device, hasSubwayStops]); 

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-10'>
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8">
          <h1 className='text-4xl font-extrabold tracking-tight text-slate-900'>
            {device?.name || 'Loading Device...'}
          </h1>
          <p className="text-slate-500 mt-2">Manage your device settings and subscribed subway stations.</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Left Column: Stations Management */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Subway Stations</h2>
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                onChange={updateResults}
                value={searchText}
                placeholder="Search for a station name or line..."
                className='w-full pl-11 pr-4 py-3 text-lg border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none shadow-sm'
              />
            </div>

            <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <div className="flex flex-col overflow-y-auto max-h-64 divide-y divide-slate-200">
                {stationsFiltered?.map(station => (
                  <button 
                    key={station} 
                    value={station}
                    onClick={updateMap}
                    className="w-full text-left px-5 py-3 text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors focus:bg-emerald-50 focus:outline-none"
                  >
                    {station}
                  </button>
                ))}
                {stationsFiltered?.length === 0 && (
                  <p className="p-5 text-slate-500 text-center">No stations found matching your search.</p>
                )}
              </div>
            </div>

            {stationDetailSection}
            {subscribedStationsSection}

          </section>

          {/* Right Column: Device Settings */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col space-y-10">
            
            {/* Brightness */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Brightness</h2>
              <p className="text-slate-500 text-sm mb-4">Set the display brightness level (1-15).</p>
              <div className="flex items-center gap-4">
                <input 
                  type="number"
                  min={1}
                  max={15}
                  value={brightnessLevel ?? ''}
                  onChange={(e) => setBrightnessLevel(e.target.value)}
                  className="w-24 px-4 py-2.5 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm"
                  placeholder="1-15"
                />
                <button 
                  onClick={handleBrightness} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Update
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Timezone */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Timezone Configuration</h2>
              <p className="text-slate-500 text-sm mb-5">Adjust the GMT offset. Check DST to automatically apply Daylight Saving Time.</p>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <TimezoneSelect onChange={(ms) => handleGmt(ms)} />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Night Mode */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Night Mode</h2>
              <p className="text-slate-500 text-sm mb-5">Enter start and end times for night mode. The display will dim to its lowest brightness setting during this window.</p>
              
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex flex-col w-full">
                  <label className="text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                  <TimePicker value={startDimTime} onChange={setStartDimTime} />
                </div>
                
                <div className="hidden sm:block text-slate-300 font-light text-4xl mt-6">
                  &rarr;
                </div>
                
                <div className="flex flex-col w-full">
                  <label className="text-sm font-semibold text-slate-700 mb-2">End Time</label>
                  <TimePicker value={endDimTime} onChange={setEndDimTime} />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleDimTime}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-8 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                >
                  Save Schedule
                </button>
              </div>
            </div>

          </section>

        </div>
      </div>
    </div>
  );
}