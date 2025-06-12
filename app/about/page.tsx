"use client";

import Link from "next/link";

export default function About() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-10 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="text-2xl sm:text-3xl font-bold row-start-1">
        Indane Gas Delivery Tracking
      </header>

      {/* Main content */}
      <main className="row-start-2 w-full max-w-3xl p-6 text-center space-y-6">
        <h1 className="text-4xl font-bold text-blue-700">About Us</h1>

        <p className="text-lg text-gray-700 leading-relaxed text-justify indent-8">
            Welcome to our <strong>LPG Gas Delivery Tracking App</strong> – your reliable partner 
            for staying informed about your gas cylinder deliveries. We understand how important 
            it is to have a seamless and timely LPG supply, especially when it powers your kitchen 
            and your day-to-day life.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed text-justify indent-8">
            Our platform is designed to help customers monitor their LPG bookings, 
            track delivery status in real-time, and receive timely notifications — 
            all from the convenience of their mobile or desktop device. Whether you're 
            managing a single household or overseeing deliveries for a larger facility, 
            we make the process simple, transparent, and efficient.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed text-justify indent-8">
            With features like <em>order history</em>, <em>delivery ETA</em>, and <em>smart alerts</em>, 
            we aim to ensure you’re never caught off guard without fuel. Join thousands of 
            satisfied users and make your LPG experience smoother, smarter, and stress-free.
        </p>
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
