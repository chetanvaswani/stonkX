"use client"
import { useEffect, useState } from "react";


export default function Home() {
  const [prices, setPrices] = useState({})
  const connected = false;
  if (!connected){
    const socket = new WebSocket('ws://localhost:8080');
    
    socket.onopen = function(event) {
      console.log('WebSocket connection opened:', event);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(data);
    }
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        
      </main>
    </div>
  );
}
