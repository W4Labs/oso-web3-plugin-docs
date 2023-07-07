import { useEffect } from "react";
import {
  useAccount,
  useToken,
  useContractWrite,
  usePrepareContractWrite,
  useNetwork,
} from "wagmi";
import { parseUnits } from "viem";
import * as React from "react";
import "../App.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Web3Button } from "@web3modal/react";
import {
  AaveArbitrumPoolAddress,
  AaveMainnetPoolAddress,
} from "../helpers/ContractAddresses";
import { AavePoolABI } from "../abis/AavePoolABI";

export default function AaveBorrow() {
  const [searchParams] = useSearchParams();

  const borrowTokenAddress = searchParams.get("borrowTokenAddress") || "";
  const amount = searchParams.get("amount") || "";
  const { address, isConnected } = useAccount();

  const [borrowCompleted, setBorrowCompleted] = React.useState(false);
  const [borrowAaveHash, setBorrowAaveHash] = React.useState(null);

  const { data: borrowToken } = useToken({ address: borrowTokenAddress });
  const { chain } = useNetwork();

  const [poolAddress, setPoolAddress] = React.useState(null);
  useEffect(() => {
    if (chain?.id === 1) {
      setPoolAddress(AaveMainnetPoolAddress);
    } else if (chain?.id === 42161) {
      setPoolAddress(AaveArbitrumPoolAddress);
    }
  }, [chain]);

  const weiBorrowTokenAmount = parseUnits(amount, borrowToken?.decimals || 18);

  // function borrow(address asset, uint256 amount, uint256 interestRateMode(stable:1,variable:2), uint16 referralCode, address onBehalfOf)
  const { config: borrowAaveConfig } = usePrepareContractWrite({
    address: poolAddress,
    abi: AavePoolABI,
    functionName: "borrow",
    args: [borrowTokenAddress, weiBorrowTokenAmount, 2, 0, address],
  });

  const { write: borrowAave } = useContractWrite({
    ...borrowAaveConfig,
    onSuccess: (data) => {
      onBorrowSuccess(data);
      console.log(data);
    },
  });

  const onBorrowSuccess = (data) => {
    console.log("Success borrow from AAVE");
    setBorrowCompleted(true);
    setBorrowAaveHash(data);
  };

  const navigate = useNavigate();
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  });
  if (isConnected) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="divCentered">
            <p className="textWrapper">AAVE borrow:{borrowTokenAddress}</p>
            <p className="textWrapper">
              Amount: {amount} {borrowToken?.symbol}
            </p>
            <div className="divCentered">
              <button
                className="App-send-Button"
                // disabled={!amount || !toTokenAddress || !fromTokenAddress}
                onClick={() => {
                  console.log("borrowAave");
                  borrowAave?.();
                }}
              >
                Borrow from AAVE
              </button>
            </div>
            <Web3Button />
            {borrowCompleted && (
              <div className="textWrapper">
                Successfully borrow {amount} {borrowToken?.symbol} from AAVE.
                {chain?.id === 1 && (
                  <div>
                    <a href={`https://etherscan.io/tx/${borrowAaveHash?.hash}`}>
                      Etherscan
                    </a>
                  </div>
                )}
                {chain?.id === 42161 && (
                  <div>
                    <a href={`https://arbiscan.io/tx/${borrowAaveHash?.hash}`}>
                      Arbiscan
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
      </div>
    );
  }
}
