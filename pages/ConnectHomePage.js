//import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Button } from "@web3modal/react";
//import { configureChains, createConfig, WagmiConfig } from 'wagmi'
//import { arbitrum, mainnet, polygon } from 'wagmi/chains'
import { useAccount } from "wagmi";
import { useEffect } from "react";
import "../App.css";
import { saveUserData } from "../helpers/dbHelpers";
import { useSearchParams } from "react-router-dom";

// const projectId = process.env.WALLET_CONNECT_PROJECT_ID
// const chains = [mainnet, polygon]

// const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])

const tele = window.Telegram.WebApp;

// const wagmiConfig = createConfig({
//     autoConnect: false,
//     connectors: w3mConnectors({
//         projectId,
//         version: 1,
//         chains
//     }),
//     publicClient
// })

// const ethereumClient = new EthereumClient(wagmiConfig, chains)

export default function ConnectHomePage() {
  const [searchParams] = useSearchParams();

  const user_id = searchParams.get("user_id");
  const uuid4 = searchParams.get("uuid4");
  const transaction_type = searchParams.get("transaction_type");

  const { address, isConnected } = useAccount();
  useEffect(() => {
    tele.ready();
    tele.expand();
  });

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Perform the desired action here
      console.log(`Updating wallet address: "${address}"`);
      if (address) {
        saveUserData(user_id, address, transaction_type);
      }
    }, 1000); // Set the desired delay in milliseconds

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [address]);

  if (!user_id || !uuid4 || !transaction_type) {
    return (
      <div className="App">
        <header className="App-header">
          <h3>Invalid URL</h3>
          <>User Id, UUID or Transaction type is missing</>
        </header>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="App">
        <header className="App-header">
          {/* <WagmiConfig config={wagmiConfig}>
        <Web3Button />
      </WagmiConfig>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} /> */}
          <Web3Button />
        </header>
      </div>
    );
  }

  tele.MainButton.setText("Finish")
    .show()
    .onClick(function () {
      const data = JSON.stringify({ address: address });
      tele.sendData(data);
      tele.close();
    });
  return (
    <div className="App">
      <header className="App-header">
        {/* <WagmiConfig config={wagmiConfig}>
      <div>
              
              <h3>Wallet Connected</h3>
              <p>Address: {address}</p>
              <Web3Button />
      </div> 
        
      </WagmiConfig>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} /> */}
        <div>
          <h3>Wallet Connected</h3>
          <p>Address: {address}</p>
          <Web3Button />
        </div>
      </header>
    </div>
  );
}
