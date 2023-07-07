import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import React from "react";
import { SendEthPage } from "./SendEthPage";

export default function SwapPage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  });
  const { isConnected } = useAccount();
  if (isConnected) {
    return (
      <div className="App">
        <header className="App-header">
          <SendEthPage />
        </header>
      </div>
    );
  }
}
