import { useState, useCallback, useEffect } from "react";
import {
  isAllowed,
  setAllowed,
  getAddress,
  requestAccess
} from "@stellar/freighter-api";

export function useFreighter() {
  const [pubKey, setPubKey] = useState("");
  const [error, setError] = useState("");

  const checkAllowed = async () => {
    try {
      if (await isAllowed()) {
        const response = await getAddress();
        if (response.address) {
          setPubKey(response.address);
        } else if (typeof response === "string") {
            setPubKey(response);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkAllowed();
  }, []);

  const connect = useCallback(async () => {
    try {
      await setAllowed();
      let addressStr = "";
      
      try {
        const response = await requestAccess();
        if (response.address) {
            addressStr = response.address;
        } else if (typeof response === "string") {
            addressStr = response;
        }
      } catch (e) {
          const response = await getAddress();
          if (response.address) {
            addressStr = response.address;
          } else if (typeof response === "string") {
            addressStr = response;
          }
      }
      
      if (addressStr) {
        setPubKey(addressStr);
        setError(""); // Clear error on successful connect
      } else {
        setError("User did not approve the connection or address not found.");
      }
    } catch (e) {
      setError(e.message || "Failed to connect to Freighter.");
      console.error(e);
    }
  }, []);

  return { pubKey, connect, error, checkAllowed };
}
