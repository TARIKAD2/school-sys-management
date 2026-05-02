import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      const token = localStorage.getItem("psms_token");
      socketRef.current = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
        auth: { token },
      });

      socketRef.current.on("connect", () => {
        console.log("WebSocket connect: Authenticated & Synced");
      });

      socketRef.current.on("disconnect", () => {
        console.log("WebSocket disconnect");
      });
    }

    return () => {
      // We don't necessarily disconnect here because Provider mounts high up
      // but if the component unmounts for some reason, we could cleanup.
      // Easiest is to let context hold the singleton.
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
