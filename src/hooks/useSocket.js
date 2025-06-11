import { useState, useEffect } from "react";
import { getSocket } from "../lib/socket";

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    if (s) {
      setIsConnected(s.connected);

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);

      return () => {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
      };
    }
  }, []);

  return { socket, isConnected };
};

export default useSocket;
