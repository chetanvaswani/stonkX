import React, {useState} from "react"
import { FaUserCircle } from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Nav({user}: any){
    const router = useRouter();
    const [moreDetailsOpen, setMoreDetailsOpen] = useState(false);

    const handleLogout = () => {
        axios.get("http://localhost:3001/logout", 
            {withCredentials: true}
        ).then((res) => {
            if (res.status === 200){
                router.push("/signin")
            }
        }).catch(() => {
            console.log("error loging out user")
            // have to put in alert
        })
    }

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
                    <FaUserCircle className="size-10 stroke-1 cursor-pointer" onClick={() => {
                        setMoreDetailsOpen(prev => !prev)
                    }} />
                    <div className={`absolute top-[65px] border-1 border-gray-300 rounded-md divide-y divide-gray-300 right-[20px] w-[300px] h-fit bg-[#181818] ${moreDetailsOpen ? "flex flex-col" : "hidden"}`}>
                        <div className="flex flex-col items-start justify-between p-3">
                            <div className="text-gray-200 text-sm">Logged in as:</div>
                            <div className="font-bold">{user?.email}</div>
                        </div>
                        <div className="flex items-center justify-between cursor-pointer p-3" onClick={handleLogout}>
                            <div className="font-semibold text-lg"> Logout </div>
                            <TbLogout2 className="size-6" />
                        </div> 
                    </div>
                </div>
            </div>
        </div>
    )
}