"use client"
import { useEffect, useState, useRef } from "react";
import { ALL_ASSETS } from "@repo/assets/index";
import Chart from "@/components/Chart";
import PriceCard from "@/components/PriceCard";
import OrderForm from "@/components/OrderForm";
import Nav from "@/components/Nav";
import { useRouter } from "next/navigation";
import axios from "axios";

type Price = {
  prev: number;
  buyPrice: number;
  sellPrice: number;
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(ALL_ASSETS[0]);
  const [selectedDuration, setSelectedDuration] = useState("1minute");
  const currPricesRef = useRef<Record<string, Price>>(
    ALL_ASSETS.reduce((acc, asset) => {
      acc[asset] = { 
        buyPrice: 0,
        sellPrice: 0,
        prev: 0
      };
      return acc;
    }, {} as Record<string, Price>)
  );
  const [visiblePrices, setVisiblePrices] = useState<Record<string, Price>>(currPricesRef.current);
  const [positionView, setPositionView] = useState<"open" | "pending" | "close">("open")
  const connected = false;

  useEffect(() => {
    axios.get("http://localhost:3001/api/v1/me", 
      { withCredentials: true }
    ).then((res) => {
      if (res.status === 200){
        setUser(res.data.data.user)
      }
      console.log(res)
    }).catch(() => {
      router.push("/signin")
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
    setVisiblePrices((prev) => 
      Object.fromEntries(
        ALL_ASSETS.map((asset) => {
          let previous;
          if(prev[asset].sellPrice === 0){
            previous = currPricesRef.current[asset].prev
          } else if (currPricesRef.current[asset].sellPrice === prev[asset].sellPrice){
            previous = prev[asset].prev
          } else {
            previous = prev[asset].sellPrice
          }
          return [
            asset,
            {
              buyPrice: currPricesRef.current[asset].buyPrice,
              sellPrice: currPricesRef.current[asset].sellPrice,
              prev: previous
            },
          ]})
        )
      );
    }, 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!connected){
      const socket = new WebSocket('ws://localhost:8080');
      
      socket.onopen = function(event) {
        // console.log('WebSocket connection opened:', event);
      };
  
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        // console.log(data);
        const previousPrice = (currPricesRef.current[data.symbol])
        // console.log(previousPrice.sellPrice,  Number(data.sellPrice).toFixed(2))
        currPricesRef.current = ({
          ...currPricesRef.current,
          [data.symbol]: {
            buyPrice: Number(data.buyPrice).toFixed(2),
            sellPrice: Number(data.sellPrice).toFixed(2),
            prev: Number(previousPrice.sellPrice),
          }
        })
      }
    }
  }, [])


  return (
    <div className="h-svh w-full flex flex-col overflow-x-hidden overflow-y-hidden ">
      <Nav user={user} />
      <main className="w-full flex h-full">

        {/* left section */}
        <div className="w-[25%] min-w-[300px] py-5 border-r-3 border-[#181818] flex flex-col gap-3 items-center ">
          {
            ALL_ASSETS.map((asset) => {
              return (
                  <div key={asset} className="w-full flex flex-col items-center" onClick={() => {
                    setSelectedAsset(asset)
                  }}>  
                    <PriceCard asset={asset} increase={(visiblePrices[asset].sellPrice >= visiblePrices[asset].prev!)} buyPrice={visiblePrices[asset].buyPrice} sellPrice={visiblePrices[asset].sellPrice} />
                  </div>
              )
            })
          }
        </div>

        {/* middle section */}
        <div className="w-full h-full">
          <div className="h-[50%]">
            <Chart selectedAsset={selectedAsset} selectedDuration={selectedDuration} setSelectedDuration={setSelectedDuration}  />
          </div>
          <div className="h-[50%] px-3 py-4 ">
              <div className="w-fit p-2 bg-[#181818] flex items-center justify-evenly rounded-md " >
                <div onClick={() => {
                  setPositionView("open")
                }} className={`px-5 py-1 rounded-md cursor-pointer font-semibold ${positionView === "open" ? "text-white border-1 border-gray-400" : "text-gray-400"}`}>Open Orders</div>
                <div onClick={() => {
                  setPositionView("pending")
                }} className={`px-5 py-1 rounded-md cursor-pointer font-semibold ${positionView === "pending" ? "text-white border-1 border-gray-400" : "text-gray-400"}`}>Pending Orders</div>
                <div onClick={() => {
                  setPositionView("close")
                }} className={`px-5 py-1 rounded-md cursor-pointer font-semibold ${positionView === "close" ? "text-white border-1 border-gray-400" : "text-gray-400"}`} >Closed Orders</div>
              </div>
          </div>
        </div>

        {/* right section */}
        <div className="h-full min-w-[25%] border-l-3 border-[#181818]">
          <OrderForm selectedAsset={selectedAsset} />
        </div>

      </main>
    </div>
  );
}