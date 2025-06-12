"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleStaffClick = (e: React.MouseEvent) => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken) {
      e.preventDefault();
      router.push('/login');
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-10 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="text-2xl sm:text-3xl font-bold row-start-1">
        Indane Gas Delivery Tracking
      </header>

      <main className="row-start-2 w-full flex flex-col items-center gap-6">
        <div className="flex gap-6">
          <Link
            href="/staff"
            onClick={handleStaffClick}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center min-w-[120px]"
          >
            Staff
          </Link>
          <Link
            href="/consumer"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center min-w-[120px]"
          >
            Consumer
          </Link>
        </div>
      </main>

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
