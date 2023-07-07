/* eslint-disable no-unused-vars */
import {
  erc20ABI,
  useAccount,
  useNetwork,
  usePrepareSendTransaction,
  usePublicClient,
  useSendTransaction,
  useToken,
  useWaitForTransaction,
} from "wagmi";
import { formatUnits, hexToBigInt, parseUnits } from "viem";
import { useEffect } from "react";
import * as React from "react";
import "../App.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Web3Button } from "@web3modal/react";
import {
  buildTxForApproveTradeWithRouter,
  buildTxForSwap,
  quote,
  spender1InchAddress,
} from "../helpers/swapHelpers";
import { arbitrum } from "viem/chains";

const tele = window.Telegram.WebApp;

export function SwapTokenPage() {
  const { address: userAddress, isConnected } = useAccount();
  const { chain } = useNetwork();
  const navigate = useNavigate();
  useEffect(() => {
    tele.ready();
    tele.expand();
  });
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  });

  const [searchParams] = useSearchParams();

  const [allowance, setAllowance] = React.useState(0);
  const [outputAmount, setOutputAmount] = React.useState(0);
  const [fromLogoUri, setFromLogoUri] = React.useState(null);
  const [toLogoUri, setToLogoUri] = React.useState(null);
  const [needApprove, setNeedApprove] = React.useState(false);
  const [approveInProgress, setApproveInProgress] = React.useState(false);

  const fromTokenAddress = searchParams.get("fromTokenAddress") || "";
  const toTokenAddress = searchParams.get("toTokenAddress") || "";
  // const [amount, setAmount] = React.useState(searchParams.get("amount") || "");
  const amount = searchParams.get("amount") || "";

  const [slippage, setSlippage] = React.useState(
    searchParams.get("slippage") || 0.5
  );

  const { data: toTokenData } = useToken({
    address: toTokenAddress,
    chainId: chain?.id,
  });

  const { data: fromTokenData } = useToken({
    address: fromTokenAddress,
    chainId: chain?.id,
  });

  const pubClient = usePublicClient();

  const amountBN = parseUnits(amount, fromTokenData?.decimals);
  // let needApprove = allowance < amountBN;

  const getAllowance1Inch = async () => {
    if (spender1InchAddress) {
      const publicClient = pubClient;
      const currentAllowance = await publicClient.readContract({
        address: fromTokenAddress,
        abi: erc20ABI,
        functionName: "allowance",
        args: [userAddress, spender1InchAddress],
      });
      setAllowance(currentAllowance);
    }
  };

  const [approveTx, setApproveTx] = React.useState(null);
  const [swapTx, setSwapTx] = React.useState(null);

  const { config: configApprove } = usePrepareSendTransaction({
    to: approveTx?.to,
    data: approveTx?.data,
    gasPrice: approveTx?.gasPrice,
    value: approveTx?.value,
  });

  const { data: approveData, sendTransaction: sendApproveTx } =
    useSendTransaction({
      ...configApprove,
      onSuccess(data) {
        console.log("approve success", data);
        setApproveInProgress(false);
        setNeedApprove(false);
      },
      onError(error) {
        console.log("approve error", error);
        setApproveInProgress(false);
      },
    });

  async function runApprove() {
    const maxUint256 = hexToBigInt(
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    );
    try {
      const tx = await buildTxForApproveTradeWithRouter(
        fromTokenAddress,
        maxUint256,
        chain?.id
      );
      setApproveTx(tx);
    } catch (error) {}
  }

  const { config: configSwap } = usePrepareSendTransaction({
    to: swapTx?.to,
    data: swapTx?.data,
    gasPrice: swapTx?.gasPrice,
    value: swapTx?.value,
    onSuccess(data) {},
    onError(error) {},
  });

  const { data: swapData, sendTransaction: sendSwapTx } =
    useSendTransaction(configSwap);

  const {
    data: swapWaitData,
    isLoading: swapLoadingTx,
    isSuccess: swapSuccess,
  } = useWaitForTransaction(swapData);
  async function runSwap() {
    try {
      const tx = await buildTxForSwap(
        userAddress,
        fromTokenAddress,
        toTokenAddress,
        parseUnits(amount, fromTokenData?.decimals),
        slippage,
        chain?.id
      );
      setSwapTx(tx);
    } catch (error) {}
  }

  async function getQuote() {
    const amountBN = parseUnits(amount, fromTokenData?.decimals);
    console.log("amountBN", amountBN);

    const res = await quote(
      fromTokenAddress,
      toTokenAddress,
      amountBN,
      chain?.id
    );
    const outputAmount = formatUnits(res?.toTokenAmount, res?.toToken.decimals);
    setOutputAmount(outputAmount);
    setFromLogoUri(res?.fromToken.logoURI);
    setToLogoUri(res?.toToken.logoURI);
  }

  useEffect(() => {
    getQuote();
  }, []);

  useEffect(() => {
    // let needApprove = allowance < amountBN;
    if (allowance < amountBN) {
      setNeedApprove(true);
    } else {
      setNeedApprove(false);
    }
    getAllowance1Inch();
    runApprove();
    runSwap();
  }, [allowance]);

  ///!todo: change after finished
  const data = { hash: swapWaitData?.transactionHash };
  ///

  if (swapSuccess) {
    tele.MainButton.setText("Finish")
      .show()
      .onClick(function () {
        const set_hash = data?.hash;
        const dataToBot = JSON.stringify({ hash_result: set_hash });
        tele.sendData(dataToBot);
        tele.close();
      });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // Perform your action or update state here
      getAllowance1Inch();
    }, 5000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="divCentered">
      <p className="textWrapper">
        From: {amount} {fromTokenData?.symbol}
        {fromLogoUri && (
          <img src={fromLogoUri} alt="logo" className="tokenLogo" />
        )}
      </p>
      <p className="textWrapper">
        To: {outputAmount} {toTokenData?.symbol}
        {toLogoUri && <img src={toLogoUri} alt="logo" className="tokenLogo" />}
      </p>
      <div className="divCentered">
        {needApprove && (
          <button
            className="App-send-Button"
            disabled={!amount || !toTokenAddress || !fromTokenAddress}
            onClick={async () => {
              try {
                console.log("approve", approveInProgress);
                setApproveInProgress(true);
                console.log("approve", approveInProgress);
                sendApproveTx?.();
              } catch (error) {
                console.log("approve error", error);
                setApproveInProgress(false);
              }
            }}
          >
            {needApprove && !approveInProgress ? "Approve" : ""}
            {approveInProgress ? "Approving..." : ""}
          </button>
        )}
        {!needApprove && (
          <button
            className="App-send-Button"
            disabled={!amount || !toTokenAddress || !fromTokenAddress}
            onClick={async () => {
              try {
                sendSwapTx?.();
              } catch (error) {}
            }}
          >
            {swapLoadingTx ? "Swapping" : "Swap"}
          </button>
        )}
      </div>
      <Web3Button />
      {swapSuccess && (
        <div className="textWrapper">
          Successfully swapped {amount} {fromTokenData?.symbol} to{" "}
          {outputAmount} {toTokenData?.symbol} {toTokenData?.symbol}
          {chain?.id === 1 && (
            <div>
              <a href={`https://etherscan.io/tx/${data?.hash}`}>Etherscan</a>
            </div>
          )}
          {chain?.id === 42161 && (
            <div>
              <a href={`https://arbiscan.io/tx/${data?.hash}`}>Arbiscan</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
