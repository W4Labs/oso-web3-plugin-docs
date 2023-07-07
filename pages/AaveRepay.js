import { useEffect } from "react";
import {
  useAccount,
  useToken,
  useWalletClient,
  erc20ABI,
  useContractRead,
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

export default function AaveRepay() {
  const [searchParams] = useSearchParams();

  const repayTokenAddress = searchParams.get("repayTokenAddress") || "";
  const amount = searchParams.get("amount") || "";
  const { data: signer } = useWalletClient();
  const { address, isConnected } = useAccount();

  const [repayCompleted, setRepayCompleted] = React.useState(false);
  const [repayAaveHash, setRepayAaveHash] = React.useState(null);

  const { data: repayToken } = useToken({ address: repayTokenAddress });
  const { chain } = useNetwork();

  const [poolAddress, setPoolAddress] = React.useState(null);
  useEffect(() => {
    if (chain?.id === 1) {
      setPoolAddress(AaveMainnetPoolAddress);
    } else if (chain?.id === 42161) {
      setPoolAddress(AaveArbitrumPoolAddress);
    }
  }, [chain]);

  const { data: repayTokenAllowance } = useContractRead({
    address: repayTokenAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, poolAddress],
  });

  const weiRepayTokenAmount = parseUnits(amount, repayToken?.decimals || 18);

  const needApprove = repayTokenAllowance < weiRepayTokenAmount;

  // repayAave(address, signer);
  const maxUint256 =
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  const { config: approveAaveConfig } = usePrepareContractWrite({
    address: repayTokenAddress,
    abi: erc20ABI,
    functionName: "approve",
    args: [poolAddress, maxUint256],
  });

  const { write: approveAave } = useContractWrite(approveAaveConfig);

  const { config: repayAaveConfig } = usePrepareContractWrite({
    address: poolAddress,
    abi: AavePoolABI,
    functionName: "repay",
    args: [repayTokenAddress, weiRepayTokenAmount, address, 0],
  });

  const { write: repayAave } = useContractWrite({
    ...repayAaveConfig,
    onSuccess: (data) => {
      onRepaySuccess(data);
    },
  });

  useEffect(() => {
    if (!signer) return;
    // repayAave(address, signer);
  }, [address, signer]);

  const onRepaySuccess = (data) => {
    setRepayCompleted(true);
    setRepayAaveHash(data);
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
            <p className="textWrapper">AAVE Repay:{repayTokenAddress}</p>
            <p className="textWrapper">
              Amount: {amount} {repayToken?.symbol}
            </p>
            <div className="divCentered">
              <button
                className="App-send-Button"
                // disabled={!amount || !toTokenAddress || !fromTokenAddress}
                onClick={() => {
                  if (needApprove) {
                    approveAave?.();
                  } else {
                    repayAave?.();
                  }
                }}
              >
                {needApprove ? "Approve AAVE" : "Repay to AAVE"}
              </button>
            </div>
            <Web3Button />
            {repayCompleted && (
              <div className="textWrapper">
                Successfully supplied {amount} {repayToken?.symbol} to AAVE.
                {chain?.id === 1 && (
                  <div>
                    <a href={`https://etherscan.io/tx/${repayAaveHash?.hash}`}>
                      Etherscan
                    </a>
                  </div>
                )}
                {chain?.id === 42161 && (
                  <div>
                    <a href={`https://arbiscan.io/tx/${repayAaveHash?.hash}`}>
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
