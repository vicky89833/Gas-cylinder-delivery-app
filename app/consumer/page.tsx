"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Types for our location data
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  type?: "user_location" | "staff_location";
  sender_type?: string;
}

export default function User() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState("Waiting for delivery");
  const socketRef = useRef<WebSocket | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const staffMarkerRef = useRef<google.maps.Marker | null>(null);
  const staffPathRef = useRef<google.maps.Polyline | null>(null);
  const pathCoordinatesRef = useRef<google.maps.LatLngLiteral[]>([]);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    const initMap = () => {
      const map = new window.google.maps.Map(mapRef.current!, {
        center: { lat: 28.6139, lng: 77.2090 }, // Default to New Delhi
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });
      mapInstanceRef.current = map;

      // Initialize WebSocket connection
      setupWebSocket();
      
      // Start tracking user location
      startUserTracking();
    };

    const setupWebSocket = () => {
      const socketUrl = "ws://localhost:8765/user";
      socketRef.current = new WebSocket(socketUrl);

      socketRef.current.onopen = () => {
        setConnectionStatus("connected");
        console.log("WebSocket connection established");
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data: LocationData = JSON.parse(event.data);
          
          if (data.type === "staff_location") {
            // Update staff position and path
            updateStaffPosition(data);
            setDeliveryStatus("Delivery in progress");
          }
          
          // Update last update time
          const updateTime = new Date(data.timestamp || Date.now()).toLocaleTimeString();
          setLastUpdate(updateTime);
          
        } catch (error) {
          console.error("Error parsing WebSocket data:", error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket connection closed");
        setConnectionStatus("disconnected");
        // Attempt to reconnect after 5 seconds
        setTimeout(setupWebSocket, 5000);
      };
    };

    const startUserTracking = () => {
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const userLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date(position.timestamp).toISOString()
            };
            
            updateUserPosition(userLocation);
            
            // Send location to server if connected
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify(userLocation));
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    const updateUserPosition = (location: LocationData) => {
      if (!mapInstanceRef.current) return;
      
      const position = {
        lat: location.latitude,
        lng: location.longitude
      };
      
      if (!userMarkerRef.current) {
        // Create new marker if it doesn't exist
        userMarkerRef.current = new google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: "Your Location",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new google.maps.Size(40, 40)
          }
        });
        
        // Center the map on the user's location
        mapInstanceRef.current.panTo(position);
      } else {
        // Update existing marker position
        userMarkerRef.current.setPosition(position);
      }
    };

    const updateStaffPosition = (data: LocationData) => {
      if (!mapInstanceRef.current) return;
      
      const position = {
        lat: data.latitude,
        lng: data.longitude
      };
      
      // Add to path coordinates
      pathCoordinatesRef.current.push(position);
      
      // Update or create staff marker
      if (!staffMarkerRef.current) {
        staffMarkerRef.current = new google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: "Delivery Staff",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new google.maps.Size(40, 40)
          }
        });
      } else {
        staffMarkerRef.current.setPosition(position);
      }
      
      // Update or create path polyline
      if (!staffPathRef.current) {
        staffPathRef.current = new google.maps.Polyline({
          path: pathCoordinatesRef.current,
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 3,
          map: mapInstanceRef.current
        });
      } else {
        staffPathRef.current.setPath(pathCoordinatesRef.current);
      }
    };

    if (!window.google?.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCc7prRXiL3u675NzBodZ03CYZYld8_GPU`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-10 sm:p-20 font-sans">
      {/* Header */}
      <header className="text-2xl sm:text-3xl font-bold row-start-1 text-center">
        Indane Gas Delivery Tracking
      </header>

      {/* Main content */}
      <main className="row-start-2 w-full flex flex-col justify-center items-center gap-6">
        {/* Status information */}
        <div className="w-full max-w-2xl flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              deliveryStatus.includes("Delivered") 
                ? "bg-green-100 text-green-800" 
                : deliveryStatus.includes("Waiting") 
                  ? "bg-yellow-100 text-yellow-800" 
                  : "bg-blue-100 text-blue-800"
            }`}>
              {deliveryStatus}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Connection:</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              connectionStatus === "connected" 
                ? "bg-green-100 text-green-800" 
                : connectionStatus === "error" 
                  ? "bg-red-100 text-red-800" 
                  : "bg-gray-100 text-gray-800"
            }`}>
              {connectionStatus}
            </span>
          </div>
          {lastUpdate && (
            <div className="text-sm text-gray-600">
              Last update: {lastUpdate}
            </div>
          )}
        </div>
        
        {/* Map container */}
        <div
          ref={mapRef}
          className="w-full max-w-4xl h-[400px] sm:h-[500px] rounded-lg shadow-lg border border-gray-300 relative"
        >
          {/* Loading indicator */}
          {!mapInstanceRef.current && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="animate-pulse text-gray-500">Loading map...</div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="row-start-3 flex gap-8 items-center justify-center">
        <Link href="/" className="text-sm sm:text-base hover:underline hover:underline-offset-4">
          Home
        </Link>
        <Link href="/about" className="text-sm sm:text-base hover:underline hover:underline-offset-4">
          About
        </Link>
      </footer>
    </div>
  );
}