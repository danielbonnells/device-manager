'use client';

import { useEffect, useState, useMemo } from "react";
import * as React from 'react'
import { Device } from "@/app/models/device";
import { Stop } from "@/app/models/stop";
import { GoogleMapsEmbed } from '@next/third-parties/google'
import { Station } from "@/app/models/station";
import { RouteTopic } from "@/app/models/routeTopic";


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
  const [currentRouteTopic, setCurrentRouteTopic] = useState<RouteTopic | undefined>(undefined);


  useEffect(() => {
    if (!id) {
      console.log("ID is not yet available, skipping fetch.");
      return;
    }

    async function getDevice() {
      const res = await fetch(`http://localhost:5231/api_dm/Devices/device?id=${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setDevice(data);
        console.log(data)
      } else {
        console.error("Failed to fetch device data 3");
      }
    }

    getDevice();
    handleStations();

  }, [id]);

  // Add this new useEffect block below your existing one:
  useEffect(() => {
    // Skip filtering if the search box is empty or not yet initialized
    if (searchText === null || stations === null) return;

    // Set a timer for 300ms
    const timeoutId = setTimeout(() => {
      const search = searchText.toUpperCase();

      const filteredStations = stations.filter(s => {
        return s.toUpperCase().includes(search);
      });

      // Only update the actual filtered list state here, after the delay
      setStationsFiltered(filteredStations);

    }, 300); // Wait 300ms before running the filtering

    // Cleanup function: If the user types again before 300ms, clear the old timer
    return () => clearTimeout(timeoutId);

  }, [searchText, stations]);

  async function getStations(stopName: string = "") {
    return await fetch(`http://localhost:5231/api_dm/Devices/get-stop?stopName=${stopName}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  }
//http://localhost:5231
  async function addStop(routeTopic: string = "") {
    return await fetch(`http://localhost:5231/api_dm/Devices/add-stop?routeTopics=${routeTopic}&deviceId=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  }

  async function removeStop(routeTopic: string = "") {
    return await fetch(`http://localhost:5231/api_dm/Devices/delete-stop?routeTopics=${routeTopic}&deviceId=${id}`, {
      method: 'DELETE',
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
      console.log(data)
    } else {
      console.error("Failed to fetch device data 1");
    }
  }

  async function handleStation(stopName: string) {
    var res = await getStations(stopName);
    if (res.ok) {
      const data = await res.json();
      setCurrentStation(data);
      console.log(data)
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

  async function handleAddStop(event: any) {
    event.preventDefault();

    const routeId = event.target.value;
    const stopId = currentStation?.routes[routeId];
    const direction = "N";

    const res = await addStop(`${stopId}/${routeId}/${direction}`);
      if (res.ok) {
      const data = await res.json();
      setDevice(data);
      // console.log(data)
    } else {
      console.error("Failed to add station");
    }
  }
    async function handleRemoveStop(event: any) {
      event.preventDefault();
      console.log(event.target.value)

      const res = await removeStop(event.target.value);
      if (res.ok) {
        const data = await res.json();
        setDevice(data);
        // console.log(data)
      } else {
        console.error("Failed to delete station");
      }
    }

    const hasSubwayStops = device?.routeTopics && device?.routeTopics.length > 0;

    // 1. MEMOIZE THE MAP & STATION DETAILS
    // This section will ONLY re-render when 'currentStation' changes.
    // Typing in the search box (updating searchText) will now be ignored by this block.
    const stationDetailSection = useMemo(() => {
      if (!currentStation) return null;

      return (
        <div className="flex flex-col border-2 border-gray-300 p-8 rounded-2xl">
          <h2 className="text-2xl border-b-2 border-gray-300">
            {currentStation.stopName} - {currentStation.line}
          </h2>
          <div className="flex">
            {Object.entries(currentStation?.routes ?? {}).map(([key, value]) => (
              <div key={key} className="flex flex-col m-4 ml-0">
                <div className={"train-" + key + "-icon" + " flex justify-center items-center text-white font-bold w-20 h-20 text-6xl rounded-full hover:grayscale-100"}>
                  <span className="">{key}</span>
                </div>
                <div className="flex justify-around mt-2 mb-2 w-full">
                    {['N', 'S'].map((direction) => (
                        <label key={direction} className="flex items-center space-x-1 cursor-pointer">
                           {/*  <input
                                type="checkbox"
                                // Use the state to check if this direction is selected
                                checked={selectedDirections[routeKey]?.[direction] ?? false} 
                                onChange={() => handleDirectionToggle(routeKey, direction)}
                                className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black"
                            /> */}
                            <span className="text-sm font-medium text-gray-900">{direction}</span>
                        </label>
                    ))}
                </div>
                <button onClick={handleAddStop} value={key} 
                  className="w-full bg-black text-white rounded-sm font-bold text-xl mb-4 p-4 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">Add</button>
              </div>
            ))}

          </div>
          {/* {device &&
            <button onClick={handleAddStop} disabled={device.routeTopics.length >= 5}
              className="w-full bg-black text-white rounded-sm font-bold text-xl mb-4 p-4 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">Subscribe</button>
          } */}

          <div className="rounded-2xl overflow-hidden border-2">
            <GoogleMapsEmbed
              apiKey="AIzaSyB_ZMs1NqBBP6zzQVLG59nrO6-9R9xVUEE"
              height={200}
              width="100%"
              mode="view"
              center={currentStation?.gtfsLatitude + "," + currentStation?.gtfsLongitude}
              zoom="16"
            />
          </div>

        </div>
      );
    }, [currentStation]); // Dependency: Only update if currentStation changes


    // 2. MEMOIZE THE SUBSCRIBED STATIONS LIST
    // This prevents the bottom list from flickering when you type.
    const subscribedStationsSection = useMemo(() => {
      // if (!hasSubwayStops) return null;

      return (
        <div className="flex flex-col">
          <div>
            <h2 className="text-2xl border-b-2 border-gray-300">Subscribed Stations</h2>
            {device?.routeTopics?.length}/5
          </div>
          {device?.routeTopics.map(stop => (
            <div  key={stop.stopId} className="flex flex-col">
              <p>{stop.stopName}{' '}
                <a href={`https://www.google.com/maps/search/?api=1&query=${stop.stopLat},${stop.stopLon}`}
                  className="underline hover:text-blue-400"
                  target="_blank" rel="noopener"
                >View on Google Maps</a>
              </p>
              <button onClick={handleRemoveStop} value={stop.stopId} className="cursor-pointer text-2xl bg-red-600 p-4">X</button>
            </div>
          ))}
        </div>
      );
    }, [device, hasSubwayStops]); // Dependency: Only update if device data changes


    // 3. YOUR RETURN BLOCK
    // We insert the variables {stationDetailSection} and {subscribedStationsSection}
    return (
      <div className='flex flex-wrap flex-col content-center m-8'>
        <h1 className='text-4xl mb-4'>{device?.name}</h1>
        <div className="flex  border-4 border-green-500 rounded-2xl p-8 w-full">
          {
            <div className="flex flex-col">
              <h2 className="text-2xl">Subway Stations</h2>
              <div className="flex">
                {/* The Input remains here, uncontrolled by useMemo so it can update fast */}
                <input
                  type="text"
                  onChange={updateResults}
                  value={searchText}
                  placeholder="Search for a station name or number"
                  className='flex-1 border-2 text-2xl p-8 m-4 rounded-md bg-white focus:ring-green-500 focus:outline-none focus:ring-2 focus:ring-offset-0'
                />
              </div>

              <div className="flex flex-col items-start overflow-y-scroll max-h-96 m-4 mb-12">
                {stationsFiltered?.map(station => {
                  return <button key={station} value={station}
                    onClick={updateMap}
                    className="flex flex-col p-4 border-b-1 border-b-gray-300 w-full text-start cursor-pointer hover:bg-green-500">{station}
                  </button>
                })}
              </div>

              {!stationsFiltered?.length && <p>No stations found.</p>}

              {/* INSERT MEMOIZED MAP HERE */}
              {stationDetailSection}
            </div>
          }

          {/* INSERT MEMOIZED SUBSCRIBED LIST HERE */}
          {subscribedStationsSection}

        </div>
      </div>
    );
  }


