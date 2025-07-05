import HeroSectionOne from "@/components/hero-section-demo-1"
import { Input } from "@/components/ui/input"
import { useSocket } from "@/context/SocketProvider";
import { useCallback, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";




export const LandingPage=()=>{
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();
    const socket = useSocket();
    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token as string);
    //@ts-ignore
    const username = decodedToken.id;
    
    const handleJoin = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        socket?.emit("join-room",{roomId,username})
        console.log({username,roomId});
    }, [roomId,socket]);

    const handleRoomJoin = useCallback((data:any)=>{
        if(data.roomId){
            navigate(`/room/${data.roomId}`);
        }
    },[])
    useEffect(()=>{
        socket?.on("room-join",handleRoomJoin)
        return()=>{
            socket?.off("room-join",handleRoomJoin)
        }
    },[socket])
    return(
        <>
        <form action="" onSubmit={handleJoin} className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        
             <Input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="RoomId" />
             <button type="submit"   className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            Join
          </button>
        </form>
        <HeroSectionOne />
        </>
    )
}
