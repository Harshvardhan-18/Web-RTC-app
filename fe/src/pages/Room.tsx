import { useSocket } from "@/context/SocketProvider"
import { useCallback, useEffect, useState, useRef } from "react";
import peer from "@/service/peer";

export const Room=()=>{
    const socket=useSocket();
    const [remoteSocketId,setRemoteSocketId]=useState<string|null>(null);
    const [localStream,setLocalStream]=useState<MediaStream|null>(null);
    const [remoteStream,setRemoteStream]=useState<MediaStream|null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    //@ts-ignore
    const handleUserJoined=useCallback(({username,socketId})=>{
        console.log(`${username} joined the room with id ${socketId}`);
        setRemoteSocketId(socketId);
    },[])
    

    const handleCall=useCallback(async()=>{
        let stream = localStream;
        if (!stream) {
            stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
            setLocalStream(stream);
        }
        // Add tracks if not already added
        stream.getTracks().forEach(track => {
            peer.peer.addTrack(track, stream);
        });
        console.log("tracks added",stream);
        console.log(stream.getTracks());
        console.log("Sender video track:", stream.getVideoTracks()[0]);
        const offer=await peer.getOffer();
        socket?.emit("call-user",{
            offer,
            to:remoteSocketId,
        })
    },[remoteSocketId,socket,localStream])

    useEffect(() => {
        if (videoRef.current && localStream) {
            videoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);


    //@ts-ignore
    const handleIncomingCall=useCallback(async({from,offer})=>{
        setRemoteSocketId(from);
        let stream = localStream;
        if(!stream){
            stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
            setLocalStream(stream);
        }
        stream.getTracks().forEach(track => {
            peer.peer.addTrack(track, stream);
        });
        const answer=await peer.getAnswer(offer);
        socket?.emit("call-accepted",{to:from,answer}); 
    },[localStream,socket])


    useEffect(() => {
        const handleTrack = (event: RTCTrackEvent) => {
            if (event.streams && event.streams[0]) {
                console.log("Remote stream received",event.streams[0].getTracks());
                setRemoteStream(event.streams[0]);
                const videoTrack = event.streams[0].getVideoTracks()[0];
                console.log("Receiver video track:", videoTrack, "muted:", videoTrack?.muted, "enabled:", videoTrack?.enabled);
            }
        };
        peer.peer.addEventListener('track', handleTrack);
        return () => {
            peer.peer.removeEventListener('track', handleTrack);
        };
    }, []);

    useEffect(() => {
        console.log("Attaching ICE listener to peer:", peer.peer);
        const iceHandler = () => {
            console.log('ICE state:', peer.peer.iceConnectionState);
        };
        peer.peer.addEventListener('iceconnectionstatechange', iceHandler);
        return () => {
            peer.peer.removeEventListener('iceconnectionstatechange', iceHandler);
        };
    }, []);

    //@ts-ignore
    const handleCallAccepted=useCallback(({from,answer})=>{
        peer.setRemoteDescription(answer);
        console.log("Call accepted");
        
        
    },[localStream])

    useEffect(()=>{
        socket?.on("user-joined",handleUserJoined);
        socket?.on("incoming-call",handleIncomingCall);
        socket?.on("call-accepted",handleCallAccepted);

        return ()=>{
            socket?.off("user-joined",handleUserJoined);
            socket?.off("incoming-call",handleIncomingCall);
            socket?.off("call-accepted",handleCallAccepted);

        }
    },[handleUserJoined,socket,handleIncomingCall,handleCallAccepted])

    useEffect(() => {
        peer.peer.addEventListener('icecandidate', event => {
            console.log('ICE candidate event:', event.candidate);
            if (event.candidate) {
                socket?.emit('ice-candidate', { to: remoteSocketId, candidate: event.candidate });
            }
        });
        return () => {
            peer.peer.removeEventListener('icecandidate', event => {
                if (event.candidate) {
                    socket?.emit('ice-candidate', { to: remoteSocketId, candidate: event.candidate });
                }
            });
        };
    }, [remoteSocketId, socket]);

    useEffect(() => {
        socket?.on('ice-candidate', ({ candidate }) => {
            console.log('Received ICE candidate:', candidate);
            peer.peer.addIceCandidate(new RTCIceCandidate(candidate));
        });
        return () => {
            socket?.off('ice-candidate');
        };
    }, [socket]);

    return(
        <div>
            
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            <h1>Room</h1>
            {remoteSocketId?<div>
                        <h4>Connected</h4>
                        <button onClick={handleCall} className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">Call</button>
                        </div>:<h4>No one is here</h4>}
            
            </div>
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            {localStream && (
                <div>
                <h1>Local Stream</h1>
                <video
                    ref={videoRef}
                    height={300}
                    width={300}
                    autoPlay
                    playsInline
                    muted
                />
                </div>
            )}
            {remoteStream && (
                <div>
                <h1>Remote Stream</h1>
                <video
                    ref={remoteVideoRef}
                    height={300}
                    width={300}
                    autoPlay
                    playsInline
                    
                />
                {/* Unmute button */}
                </div>
            )}
            </div>
        </div> 
    )
}