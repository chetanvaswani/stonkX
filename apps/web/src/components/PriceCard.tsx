import React from "react";
import { ASSET_DETAILS } from "@repo/assets/index";
import { HiAtSymbol } from "react-icons/hi";
import Loader from "./Loader";

export default function PriceCard({buyPrice, asset, sellPrice, increase}: {
    buyPrice: number,
    asset: string,
    sellPrice: number,
    increase: boolean
}){
    // console.log(buyPrice, asset, sellPrice)
    return (
        <div className="w-[90%] p-4 bg-[#181818] h-content hover:opacity-80 rounded-md text-white flex flex-col gap-2 cursor-pointer">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src={ASSET_DETAILS[asset].image} className="rounded-full h-[22px] min-w-[22px] mr-2" />
                    <div className="text-lg font-bold">{ASSET_DETAILS[asset].name}</div>
                </div>
                <div className="flex items-center text-sm font-semibold text-gray-500">
                    {/* <span>symbol:</span> */}
                    <HiAtSymbol />
                    <span>{asset}</span>
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div className="flex justify-between items-center ">
                    <div className="font-normal text-sm">Bid Price:</div>
                    <div className={`text-base font-bold ${increase? "text-green-400" : "text-red-300"}`}>
                        {
                            Number(buyPrice) > 0 ? <span>{buyPrice}</span> : 
                            <Loader />
                        }
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="font-normal text-sm">Ask Price:</div>
                    <div className={`text-base font-bold ${increase? "text-green-400" : "text-red-300"}`}>
                        {
                            Number(sellPrice) > 0 ? <span>{sellPrice}</span> : 
                            <Loader />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}