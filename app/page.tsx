"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./homepage.module.css";
import Calendar from "../components/Calendar";
import ShiftNav from "../components/ShiftNav";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);

  // Initialize from URL on mount
  useEffect(() => {
    const shifts = searchParams.get('shifts');
    if (shifts) {
      setSelectedShifts(shifts.split(','));
    }
  }, [searchParams]);

  const toggleShift = (shiftName: string) => {
    const next = selectedShifts.includes(shiftName) 
      ? selectedShifts.filter(s => s !== shiftName) 
      : [...selectedShifts, shiftName];
    
    setSelectedShifts(next);
    
    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      params.set('shifts', next.join(','));
    } else {
      params.delete('shifts');
    }
    router.replace(`/?${params.toString()}`, { scroll: false });
  };
  
  return (
  <main className={styles.pageWrapper}>
    <aside className={styles.sidebar}>
      <div className={styles.sidebarFixed}>
        <ShiftNav selectedShifts={selectedShifts} onToggle={toggleShift} />
      </div>
    </aside>
    <div className={styles.content}>
      <Calendar selectedShifts={selectedShifts} />
    </div>
  </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
