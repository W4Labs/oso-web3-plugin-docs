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

export default function AaveSupply() {
  const [searchParams] = useSearchParams();

  const supplyTokenAddress = searchParams.get("supplyTokenAddress") || "";
  const amount = searchParams.get("amount") || "";
  const { data: signer } = useWalletClient();
  const { address, isConnected } = useAccount();

  const [supplyCompleted, setSupplyCompleted] = React.useState(false);
  const [supplyAaveHash, setSupplyAaveHash] = React.useState(null);

  const { data: supplyToken } = useToken({ address: supplyTokenAddress });
  const { chain } = useNetwork();

  const [poolAddress, setPoolAddress] = React.useState(null);
  useEffect(() => {
    if (chain?.id === 1) {
      setPoolAddress(AaveMainnetPoolAddress);
    } else if (chain?.id === 42161) {
      setPoolAddress(AaveArbitrumPoolAddress);
    }
  }, [chain]);

  const { data: supplyTokenAllowance } = useContractRead({
    address: supplyTokenAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, poolAddress],
  });

  const weiSupplyTokenAmount = parseUnits(amount, supplyToken?.decimals || 18);

  const needApprove = supplyTokenAllowance < weiSupplyTokenAmount;

  // supplyAave(address, signer);
  const maxUint256 =
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  const { config: approveAaveConfig } = usePrepareContractWrite({
    address: supplyTokenAddress,
    abi: erc20ABI,
    functionName: "approve",
    args: [poolAddress, maxUint256],
  });

  const { write: approveAave } = useContractWrite(approveAaveConfig);

  //function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external
  const { config: supplyAaveConfig } = usePrepareContractWrite({
    address: poolAddress,
    abi: AavePoolABI,
    functionName: "supply",
    args: [supplyTokenAddress, weiSupplyTokenAmount, address, 0],
  });

  const { write: supplyAave } = useContractWrite({
    ...supplyAaveConfig,
    onSuccess: (data) => {
      onSuppliedSuccess(data);
      console.log(data);
    },
  });

  useEffect(() => {
    if (!signer) return;
    // supplyAave(address, signer);
  }, [address, signer]);

  const onSuppliedSuccess = (data) => {
    console.log("Success supply to AAVE");
    setSupplyCompleted(true);
    setSupplyAaveHash(data);
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
            <p className="textWrapper">AAVE Supply:{supplyTokenAddress}</p>
            <p className="textWrapper">
              Amount: {amount} {supplyToken?.symbol}
            </p>
            <div className="divCentered">
              <button
                className="App-send-Button"
                // disabled={!amount || !toTokenAddress || !fromTokenAddress}
                onClick={() => {
                  if (needApprove) {
                    approveAave?.();
                  } else {
                    supplyAave?.();
                  }
                }}
              >
                {needApprove ? "Approve AAVE" : "Supply to AAVE"}
              </button>
            </div>
            <Web3Button />
            {supplyCompleted && (
              <div className="textWrapper">
                Successfully supplied {amount} {supplyToken?.symbol} to AAVE.
                {chain?.id === 1 && (
                  <div>
                    <a href={`https://etherscan.io/tx/${supplyAaveHash?.hash}`}>
                      Etherscan
                    </a>
                  </div>
                )}
                {chain?.id === 42161 && (
                  <div>
                    <a href={`https://arbiscan.io/tx/${supplyAaveHash?.hash}`}>
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
