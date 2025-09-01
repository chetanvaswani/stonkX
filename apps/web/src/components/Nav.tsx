import React from "react"
import { FaUserCircle } from "react-icons/fa";

export default function Nav(){
    return (
        <div className="w-full h-[70px] border-b-3 border-[#181818] px-3 flex items-center justify-between">
            <div className="w-full h-[70px] flex items-center">
                <img src="stonkX_white.png" className="object-contain h-[50%] mr-1" />
                <div className="text-white text-3xl font-bold mt-2 mr-2">StonkX</div>
            </div>
            <div className="flex gap-4 h-full w-fit items-center justify-center">
                <div className="h-[60%] w-fit px-2 py-5 border-1 gap-2 border-gray-400 flex justify-center items-center rounded-md">
                    <span className="text-md font-semibold">Balance:</span>
                    <span className="text-lg font-bold">$5000</span>
                </div>
                <div>
                    <FaUserCircle className="size-10 stroke-1 cursor-pointer" />
                </div>
            </div>
        </div>
    )
}