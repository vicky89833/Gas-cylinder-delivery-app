"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function User() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    const initMap = () => {
      const map = new window.google.maps.Map(mapRef.current!, {
        center: { lat: 28.6139, lng: 77.2090 }, // Default to New Delhi
        zoom: 12,
      });

      // Initialize WebSocket connection
      socketRef.current = new WebSocket("wss://your-socket-server-url");

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { latitude, longitude } = data;

          // Clear previous markers
          markersRef.current.forEach(marker => marker.setMap(null));
          markersRef.current = [];

          // Add new marker
          const marker = new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map,
            title: "Current Delivery Location",
          });

          markersRef.current.push(marker);
          map.setCenter({ lat: latitude, lng: longitude });
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    if (!window.google?.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = initMap;
      script.onerror = () => console.error("Google Maps script failed to load");
      document.head.appendChild(script);
    } else {
      initMap();
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, []);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-10 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="text-2xl sm:text-3xl font-bold row-start-1">
        Indane Gas Delivery Tracking
      </header>

      {/* Main content */}
      <main className="row-start-2 w-full flex justify-center items-center">
        <div
          ref={mapRef}
          className="w-full h-[400px] rounded-lg shadow-lg border border-gray-300"
        />
      </main>

      {/* Footer */}
      <footer className="row-start-3 flex gap-8 items-center justify-center">
        <Link
          href="/"
          className="text-sm sm:text-base hover:underline hover:underline-offset-4"
        >
          Home
        </Link>
        <Link
          href="/about"
          className="text-sm sm:text-base hover:underline hover:underline-offset-4"
        >
          About
        </Link>
      </footer>
    </div>
  );
}
