"use client"
import { useEffect, useState, useRef } from "react";
import { ALL_ASSETS, ASSET_DETAILS, INTERVALS } from "@repo/assets/index";
import Chart from "@/components/Chart";
import PriceCard from "@/components/PriceCard";

type Price = {
  prev: number;
  buyPrice: number;
  sellPrice: number;
};

export default function Home() {
  const chartRef = useRef<HTMLDivElement>(null);
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
  const connected = false;

  useEffect(() => {
    const interval = setInterval(() => {
    setVisiblePrices((prev) => 
      Object.fromEntries(
        ALL_ASSETS.map((asset) => {
          let previous;
          if(prev[asset].sellPrice === 0){
            previous = currPricesRef.current[asset].prev
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
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   console.log(visiblePrices["solusdt"])
  // }, [visiblePrices])

  useEffect(() => {
    if (!connected){
      const socket = new WebSocket('ws://localhost:8080');
      
      socket.onopen = function(event) {
        console.log('WebSocket connection opened:', event);
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
        // console.log(currPricesRef.current["solusdt"])
      }
    }
  }, [])


  return (
    <div className="h-svh w-screen flex flex-col overflow-x-hidden overflow-y ">
      <div className="w-full h-[70px] border-b-3 border-[#181818] mx-3 flex items-center">
        <img src="stonkX_white.png" className="object-contain h-[50%] mr-1" />
        <div className="text-white text-3xl font-bold mt-2 mr-2">StonkX</div>
      </div>
      <div className="w-full flex h-full">
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
        <div className="w-full h-full">
          <Chart selectedAsset={selectedAsset} selectedDuration={selectedDuration} setSelectedDuration={setSelectedDuration}  />
        </div>
        <div className="h-full min-w-[25%] border-l-3 border-[#181818]">

        </div>
      </div>
    </div>
  );
}