import {
  useAccount,
  useToken,
  usePrepareContractWrite,
  erc20ABI,
  useContractWrite,
} from "wagmi";
import { parseEther, parseUnits } from "viem";
import { useEffect } from "react";
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import * as React from "react";
import "../App.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Web3Button } from "@web3modal/react";

const tele = window.Telegram.WebApp;

export function SendEthPage() {
  const { isConnected } = useAccount();
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [toAddress, setToAddress] = React.useState(
    searchParams.get("toAddress") || ""
  );
  //const [debouncedTo] = useDebounce(to, 500)

  const [amount, setAmount] = React.useState(searchParams.get("amount") || "");
  //const [debouncedAmount] = useDebounce(amount, 500)
  const [tokenAddress, setTokenAddress] = React.useState(
    searchParams.get("tokenAddress") || ""
  );

  //useTOken
  const { data: tokenData } = useToken({
    address: tokenAddress,
  });
  //   console.log(tokenData);

  const unit = tokenData?.symbol || "ETH";

  //transfer token to address
  const { config: transferConfig } = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: "transfer",
    args: [toAddress, parseUnits(amount, tokenData?.decimals)],
  });
  //   console.log(transferPrepareSuccess);
  const { write } = useContractWrite(transferConfig);
  // const { config } = usePrepareSendTransaction({
  //     request: {
  //     to,
  //     value: parseEther(debouncedAmount),
  //     },
  // })

  //start:this is to bypass the error of usePrepareSendTransaction when the amount is larger than the balance
  let sendEthAmount;
  if (tokenAddress) {
    sendEthAmount = "0";
  } else {
    sendEthAmount = amount;
  }
  //end

  // const { config } = usePrepareSendTransaction({
  //     request: {
  //     to,
  //     value: parseEther(debouncedAmount),
  //     },

  // })
  const { config } = usePrepareSendTransaction({
    to: toAddress,
    value: parseEther(sendEthAmount),
    onSuccess(data) {
      console.log("Success from prepare", data);
      console.log(data?.hash);
    },
    onError(error) {
      console.log("Error from prepare", error);
    },
  });

  const { data, sendTransaction } = useSendTransaction(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess(data) {
      console.log("Success", data);
      console.log(data?.hash);
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  function runSendTransaction() {
    try {
      if (tokenAddress) {
        console.log("sending token");
        write?.();
      } else {
        console.log("sending eth");
        sendTransaction?.();
      }
    } catch (error) {
      console.log("error from try catch me", error);
    }
  }
  if (isSuccess) {
    tele.MainButton.setText("Finish")
      .show()
      .onClick(function () {
        const set_hash = data?.hash;
        const dataToBot = JSON.stringify({ hash_result: set_hash });
        tele.sendData(dataToBot);
        tele.close();
      });
  }

  return (
    <div className="divCentered">
      <p className="textWrapper">To: {toAddress}</p>
      <p className="textWrapper">
        Amount: {amount} {unit}
      </p>
      <div className="divCentered">
        <button
          className="App-send-Button"
          disabled={!amount || !toAddress || !sendTransaction}
          onClick={runSendTransaction}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
      <Web3Button />
      {isSuccess && (
        <div className="textWrapper">
          Successfully sent {amount} {unit} to {toAddress}
          <div>
            <a href={`https://etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </div>
  );
}
