"use client"
import InputBox from "@/components/InputBox";
import Button from "@/components/Button";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function signup(){
    const router = useRouter()
    const URL = "http://localhost:3001/api/v1/signup"
    const alerDivtRef= useRef<HTMLInputElement | null>(null);
    let timeout: ReturnType<typeof setTimeout>;
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmation: ""
    });
    const [disabled, setDisabled] = useState(true);
    const [ buttonText, setButtonText ] = useState("Create an Account")

    const uppercaseWords = (str: string )=> str.replace(/^(.)|\s+(.)/g, c => c.toUpperCase());

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }, 250)
    };

    useEffect(() => {
        if ((formData.password === formData.confirmation) && formData.password.length > 0){
            setDisabled(false)
            if (alerDivtRef.current) {
                alerDivtRef.current.innerText = "";
            }
        }
        else if (!(formData.password === formData.confirmation) && formData.confirmation.length > 0){
            setDisabled(true)
            if (alerDivtRef.current) {
                alerDivtRef.current.innerText = "Passwords Do Not Match";
            }
        }
    }, [formData.password, formData.confirmation])

    const handleSignup = async () => {
        setDisabled(true)
        setButtonText("Creating an account for you...")
        if (!(formData.password === formData.confirmation)){
            if (alerDivtRef.current) {
                alerDivtRef.current.innerText = "Passwords Do Not Match";
            }
            setButtonText("Create an Account")
            setDisabled(false)
            return
        }
        axios.post(URL, {
            email: formData.email,
            password: formData.password
        },
        { withCredentials: true }
        ).then((res) => {
            console.log(res)
            if(res.data.success){
                if (alerDivtRef.current) {
                    alerDivtRef.current.innerText = "Signup Successful.";
                }
                setButtonText("Redirecting to the login page...")
                setTimeout(() => {
                    setButtonText("Create an Account")
                    setDisabled(false)
                }, 1500)
                router.push("/")
            }
        }).catch((err) => {
            setButtonText("Create an Account")
            setDisabled(false)
            let msg: string;
            msg = "Invalid request"
            if (err.response.status === 403){
                msg = err.response.data.data
            } else if (err.response.status === 400){
                msg = err.response.data.data.message
            }
            if (alerDivtRef.current) {
                alerDivtRef.current.innerText = `${uppercaseWords(msg)}. Please try again.`;
            }
        })
    }

    return(
      <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col justify-center align-center">
            <div className="w-full h-[95%] flex flex-col gap-5 items-center justify-start mt-15">
                <div className="flex gap-1">
                    <img src="/stonkX_white.png" className="h-[35px] w-[35px]"/>
                    <div className="text-white text-4xl font-semibold">StonkX</div>
                </div>
                <div className="h-fit w-[85%] bg-[#181818] rounded-md p-5 sm:w-110" >
                    <div className="flex w-full items-center justify-center flex-col ">
                        <div className="text-white font-semibold text-2xl text-center">Create New Account</div>
                        <div className="text-gray-300 font-semibold text-base text-center">It's quick and easy.</div>
                    </div>
                    <div className="text-gray-400 border border-gray-200 my-6" />
                    <div className="flex flex-col gap-6" >
                        <InputBox title="Email" name="email" height={12} maxLength={50} onChange={handleInputChange} />
                        <InputBox title="Password" type="password" name="password" height={12} maxLength={50} onChange={handleInputChange}  />
                        <InputBox title="Confirm Password" type="password" name="confirmation" height={12} maxLength={50} onChange={handleInputChange} onKeyDown={(e) => {
                            if(e.key === "Enter"){
                                console.log("enter is pressed")
                                handleSignup();
                            }
                        }}/>
                        <div className="text-center text-gray-400 text-sm" ref={alerDivtRef} > </div>
                        <Button variant="primary" size="lg" text={buttonText} onClick={handleSignup} disabled={disabled} />
                        <div className="text-gray-400 border border-gray-200 " />
                        <div className="flex justify-center">
                            <Button variant="secondary" size="lg" text="Login using existing Account" onClick={() => {
                                router.push("/signin")
                            }} />
                        </div>
                    </div>
                </div>
        </div>
        <div className=" w-full h-[5%] bg-[#0a0a0a] border-t-3 border-[#181818] flex items-center justify-center">
            <div className="w-[90%] h-full flex justify-center items-center sm:w-[80%]">
                <p className="text-gray-300 font-light text-xs sm:text-base ">&copy;2025: A project by
                    <a href="https://chetanvaswani.netlify.app" className="text-white hover:underline" target="_blank" > Chetan Vaswani </a> for super30.
                </p>
            </div>
        </div>
      </div>
    )
}