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

export default function AaveWithdraw() {
  const [searchParams] = useSearchParams();

  const withdrawTokenAddress = searchParams.get("withdrawTokenAddress") || "";
  const amount = searchParams.get("amount") || "";
  const { address, isConnected } = useAccount();

  const [withdrawCompleted, setWithdrawCompleted] = React.useState(false);
  const [withdrawAaveHash, setWithdrawAaveHash] = React.useState(null);

  const { data: withdrawToken } = useToken({ address: withdrawTokenAddress });
  const { chain } = useNetwork();

  const [poolAddress, setPoolAddress] = React.useState(null);
  useEffect(() => {
    if (chain?.id === 1) {
      setPoolAddress(AaveMainnetPoolAddress);
    } else if (chain?.id === 42161) {
      setPoolAddress(AaveArbitrumPoolAddress);
    }
  }, [chain]);

  const weiWithdrawTokenAmount = parseUnits(
    amount,
    withdrawToken?.decimals || 18
  );

  //function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external
  const { config: withdrawAaveConfig } = usePrepareContractWrite({
    address: poolAddress,
    abi: AavePoolABI,
    functionName: "withdraw",
    args: [withdrawTokenAddress, weiWithdrawTokenAmount, address],
  });

  const { write: withdrawAave } = useContractWrite({
    ...withdrawAaveConfig,
    onSuccess: (data) => {
      onWithdrawSuccess(data);
      console.log(data);
    },
  });

  const onWithdrawSuccess = (data) => {
    console.log("Success withdraw from AAVE");
    setWithdrawCompleted(true);
    setWithdrawAaveHash(data);
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
            <p className="textWrapper">AAVE Withdraw:{withdrawTokenAddress}</p>
            <p className="textWrapper">
              Amount: {amount} {withdrawToken?.symbol}
            </p>
            <div className="divCentered">
              <button
                className="App-send-Button"
                onClick={() => {
                  console.log("withdrawAave");
                  withdrawAave?.();
                }}
              >
                Withdraw from AAVE
              </button>
            </div>
            <Web3Button />
            {withdrawCompleted && (
              <div className="textWrapper">
                Successfully withdraw {amount} {withdrawToken?.symbol} from
                AAVE.
                {chain?.id === 1 && (
                  <div>
                    <a
                      href={`https://etherscan.io/tx/${withdrawAaveHash?.hash}`}
                    >
                      Etherscan
                    </a>
                  </div>
                )}
                {chain?.id === 42161 && (
                  <div>
                    <a
                      href={`https://arbiscan.io/tx/${withdrawAaveHash?.hash}`}
                    >
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
