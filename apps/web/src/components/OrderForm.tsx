import React, { useEffect } from "react"
import { useState } from "react"
import { ASSET_DETAILS } from "@repo/assets/index";
import Dropdown from "./Dropdown";
import { GrSubtract } from "react-icons/gr";
import { GrAdd } from "react-icons/gr";
import axios from "axios";


export default function OrderForm({selectedAsset}:{
    selectedAsset: string
}){
    const [leverageInlcuded, setLeverageIncluded] = useState(false);
    const [formType, setFormType] = useState<"quantity" | "amount" | "leverage" | null>("quantity");
    const [formData, setFormData] = useState({
        tradeBy: "quantity",
        asset: selectedAsset,
        margin: 0,
        type: "buy",
        leverage: 1,
        quantity: 0,
        stopLoss: null,
        takeProfit: null
    });
    const [leverageInfo, setLeverageInfo] = useState({
        options: [5, 10, 20, 100],
        currIndex: 0
    })

    useEffect(() => {
        setFormData({
            ...formData,
            asset: selectedAsset
        })
    }, [selectedAsset])

    useEffect(() => {
        if (!leverageInlcuded){
            setFormType("quantity")
            setFormData({
                ...formData,
                leverage: 1,
                tradeBy: "quantity"
            })
        } else{
            setFormType("leverage")
            setFormData({
                ...formData,
                leverage: leverageInfo.options[leverageInfo.currIndex],
                tradeBy: "amount"
            })
        }
    }, [leverageInlcuded])

    useEffect(() => {
        setFormData({
            ...formData,
            quantity: 0,
            margin: 0
        })
    }, [formType])

    const placeOrder = () => {
        console.log(formData)
        axios.post("http://localhost:3001/api/v1/order/open", {
            ...formData
        }, {withCredentials: true}).then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        });
    }

    return (
        <div className="w-full h-full flex flex-col gap-4 py-3 px-5">

            <div className="text-xl font-bold flex items-center gap-2 rounded-md">
                <img src={ASSET_DETAILS[selectedAsset].image} className="h-[20px] w-[20px]" />
                {ASSET_DETAILS[selectedAsset].name}
            </div>

            <div className="w-full h-[60px] p-2 flex bg-black rounded-md border-[0.5px] border-[#181818]">
                <div className={`h-full w-[50%] flex items-center cursor-pointer justify-center font-bold ${formData.type === "buy" ? "bg-[#00B54C]" : false} rounded-md`} onClick={() => {
                    setFormData({
                        ...formData,
                        type: "buy"
                    })
                }}>
                    BUY
                </div>
                <div className={`h-full w-[50%] flex items-center cursor-pointer justify-center font-bold rounded-md ${formData.type === "sell" ? "bg-red-500" : false}`} onClick={() => {
                    setFormData({
                        ...formData,
                        type: "sell"
                    })
                }}>
                    SELL
                </div>
            </div>

            <div className="flex items-center h-[50px] px-4 border-[#181818] border-2 rounded-md justify-between" onClick={() => {
                setLeverageIncluded((prev) => !prev)
            }}>
                <span className="text-md font-bold">Include Leverage:</span>
                <input type="checkbox" checked={leverageInlcuded} onChange={() => {
                    setLeverageIncluded((prev) => !prev)
                }} className="sr-only peer" />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full
                    rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                    after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600">
                </div>
            </div>

            <div>
                <Dropdown onChange={(chosenOption) => {
                    if (chosenOption === "quantity" || chosenOption === "amount")
                    setFormType(chosenOption)
                }} options={["quantity", "amount"]} hidden={leverageInlcuded} selected={formType} />
            </div>
            {
                formType === "quantity" ? 
                // when form type is quantity
                <div className="">
                    <input type="number" placeholder="Enter Quantity" className={`border-[#181818] border-2 h-[50px] w-full p-3 focus:outline-0 rounded-md`} onChange={(e) => {
                        setFormData( {
                            ...formData,
                            quantity: Number(e.target.value)
                        })
                    }} />
                </div> : 
                // when form type is amount or leverage
                <div className="">
                    <input type="number" placeholder="Enter Amount" className={`border-[#181818] border-2 h-[50px] w-full p-3 focus:outline-0 rounded-md`}  onChange={(e) => {
                        setFormData( {
                            ...formData,
                            margin: Number(e.target.value)
                        })
                    }} />
                </div>
            }
            {
                formType === "leverage" ?
                <div className="border-2 border-[#181818] h-[50px] w-full rounded-md p-3 flex items-center justify-between font-semibold">
                    <div><GrSubtract onClick={() => {
                        if (leverageInfo.currIndex !== 0){
                            setLeverageInfo({
                                ...leverageInfo,
                                currIndex: leverageInfo.currIndex - 1
                            })
                        }
                    }} className={`text-white size-4 stroke-3 cursor-pointer ${leverageInfo.currIndex === 0 ? "opacity-35" : false}`}/></div>
                    <div className="text-lg">{leverageInfo.options[leverageInfo.currIndex]}x</div>
                    <div><GrAdd className={`text-white size-4 stroke-3 cursor-pointer ${leverageInfo.currIndex === leverageInfo.options.length - 1 ? "opacity-35" : false}`} onClick={() => {
                        if (leverageInfo.currIndex !== leverageInfo.options.length - 1){
                            setLeverageInfo({
                                ...leverageInfo,
                                currIndex: leverageInfo.currIndex + 1
                            })
                        }
                    }}/></div>
                </div>
                : false
            }

            <div className={`w-full h-[50px] flex justify-center items-center rounded-md font-bold text-lg ${formData.type === "buy"? "bg-[#00B54C]" : "bg-red-500"} `} onClick={() => {
                placeOrder()
            }} >
                Place {formData.type} order
            </div>
        </div>
    )
}