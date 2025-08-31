import React from "react"
import { useEffect, useState, useRef } from "react";
import {
    createChart,
    CandlestickSeries,
    ChartOptions,
    DeepPartial,
    IChartApi,
    Time,
    CandlestickSeriesOptions,
    IChartApiBase,
    ISeriesApi
  } from "lightweight-charts";
import axios from "axios";
import { ASSET_DETAILS, INTERVALS } from "@repo/assets/index";


interface chartValuesInterface{
    open: number,
    close: number,
    high: number,
    low: number,
    time: Date
}

export default function Chart({selectedAsset, selectedDuration, setSelectedDuration}: {
    selectedAsset: string,
    selectedDuration: string,
    setSelectedDuration: (duration: string) => void
}){
    // const [candlestickSeries, setCandlestickSeries] = useState<ISeriesApi<any> | null>(null);
    const chartRef = useRef<HTMLDivElement>(null);
    // const [chartInit, setChartInit] = useState(false)
    const [currentCandles, setCurrentCandles] = useState<any[]>([]);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);


    useEffect(() => {
        const URL = "http://localhost:3001/getCandles";
        const endTime = new Date();
        const startTime = new Date(Number(endTime) - 30000 * 60);
        axios.get(`${URL}?asset=${selectedAsset}&duration=${selectedDuration}&startTime=${startTime}&endTime=${endTime}`)
          .then((res) => {
            const candles = res.data.data.candles.reverse(); ;
            console.log(candles)
            setCurrentCandles([
              ...candles.map((candle: any) => {
                return {
                  open: Number(candle.open),
                  close: Number(candle.close),
                  high: Number(candle.high),    
                  low: Number(candle.low),
                  time: ((Date.parse(candle.bucket)/1000))
                }
              })
            ])
          }).catch((err) => {
            console.log(err)
          });
      }, [selectedAsset, selectedDuration])

    useEffect(() => {
        if (!chartRef.current) return

        let chartOptions: DeepPartial<ChartOptions>;
        chartOptions= { 
            layout: { textColor: 'gray', background: { color: '#0a0a0a' }, panes: { enableResize: true} },
            grid: { 
                horzLines: { color: "#181818" },
                vertLines: { color: "#181818" }
            } 
        };

        const chart = (createChart(chartRef.current, chartOptions));

        candlestickSeriesRef.current = (chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
            wickUpColor: '#26a69a', wickDownColor: '#ef5350'
        }))
        // candlestickSeriesRef.current.setData([
        //     ...currentCandles
        // ])
        chart.timeScale().fitContent();
    }, [])

      useEffect(() => {
        if (!candlestickSeriesRef.current) return
        if (currentCandles.length == 0) return
        console.log(currentCandles)
        candlestickSeriesRef.current.setData((currentCandles as any))
      }, [currentCandles])

    return (
        <div className="h-[50%] border-b-3 border-[#181818] flex flex-col p-3 justify-evenly">
        <div className="flex gap-5 items-end justify-between h-[5%]">
          <div className="text-xl font-bold flex items-center gap-2 bg-[#181818] py-1 px-2 rounded-md">
            <img src={ASSET_DETAILS[selectedAsset].image} className="h-[20px] w-[20px]" />
            {ASSET_DETAILS[selectedAsset].name}
          </div>
          <div className="flex gap-1 bg-[#181818] p-1 px-1 rounded-md">
            {
                INTERVALS.map((interval) => {
                return (
                    <div key={interval} 
                        className={`cursor-pointer font-bold flex px-2 ${interval === selectedDuration ? "text-black bg-gray-100 rounded-md": "text-gray-400"}`}
                        onClick={() => {
                            setSelectedDuration(interval)
                        }}
                    >
                    {interval.replace("minutes", "m").replace("hour", "hr").replace("minute", "m").replace("day", "d").replace("week", "w").replace("month", "M")}
                    </div>
                )
                })
            }
          </div>
        </div>
        <div ref={chartRef} className="w-full h-[80%] border-1 border-[#181818] rounded-sm"></div>       
      </div>
    )
}