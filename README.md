# OSO Web3 Plugin Documentation

Welcome to the documentation for the OSO Web3 plugin! This guide will help you understand how to integrate web3 functionality into your frontend application using the OSO Web3 plugin in combination with the Wagmi library.

## Introduction

The OSO Web3 plugin enables you to interact with web3 on the frontend while leveraging OSO on the backend to handle user messages. Think of it as integrating a ChatGPT plugin with web3 capabilities. By following the examples and instructions in this documentation, you'll be able to seamlessly incorporate web3 functionality into your frontend application.

The OSO Web3 plugin provides the following features and hooks to simplify web3 integration:

1. **Passing Information from OSO to Frontend**: Information from the backend (OSO) can be transferred to the frontend using query parameters. To simplify this process, you can use the `useSearchParams` hook from the `react-router-dom` library. Read more about it in the [React Router dom documentation](https://reactrouter.com/web/api/Hooks/useparams).

2. **Getting Client/Provider**: To access various properties related to an account and its connection status, you can use the `useAccount` hook from the Wagmi library. Refer to the [useAccount documentation](https://wagmi.sh/react/hooks/useAccount) for more details.

3. **Reading Smart Contract Variables**: The `useContractRead` hook from the Wagmi library allows you to fetch data from smart contracts without changing the state. Learn more about it in the [useContractRead documentation](https://wagmi.sh/react/hooks/useContractRead).

4. **Sending Transactions with Smart Contracts (Write)**: Use the `useContractWrite` hook from the Wagmi library when you need to interact with a smart contract to change its state. Check out the [useContractWrite documentation](https://wagmi.sh/react/hooks/useContractWrite) for further information.

5. **Sending Raw Transactions**: The `useSendTransaction` hook from the Wagmi library enables you to send raw transactions to the Ethereum network. Refer to the [useSendTransaction documentation](https://wagmi.sh/react/hooks/useSendTransaction) for detailed usage instructions.

6. **Interacting with ERC20 Tokens**: The `useToken` hook, also from the Wagmi library, is designed specifically for fetching ERC20 token information. Explore the [useToken documentation](https://wagmi.sh/react/hooks/useToken) for more information.

Now that you have an overview of the features and hooks provided by the OSO Web3 plugin, let's dive into the specifics of each one. Happy coding!

## 1. Passing Information from OSO to Frontend

To transfer information from the backend (OSO) to the frontend, query parameters can be utilized. The `useSearchParams` hook from the `react-router-dom` library simplifies this process. Visit the [React Router dom documentation](https://reactrouter.com/web/api/Hooks/useparams) to learn more about this hook.

```javascript
import { useSearchParams } from 'react-router-dom';

function MyComponent() {
  const searchParams = useSearchParams();

  const username = searchParams.get('username');
  const role = searchParams.get('role');

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <p>Your role is: {role}</p>
    </div>
  );
}
```

By using the `useSearchParams` hook, you can easily access the query parameters and extract them for display or processing within your component.

## 2. Getting Client/Provider

To access various properties related to an account and its connection status, the `useAccount` hook from the Wagmi library can be utilized. Refer to the [useAccount documentation](https://wagmi.sh/react/hooks/useAccount) for a comprehensive guide on using this hook.

```javascript
import { useAccount } from 'wagmi';

function App() {
  const account = useAccount();
  
  if (account.isConnecting) return <div>Connecting…</div>
  if (account.isDisconnected) return <div>Disconnected</div>
  return <div>Connected account: {account.address}</div>
}
```

The `useAccount` hook returns an account object with various properties related to the account's status. You can use these properties to provide relevant information to your users based on their account connection status.

## 3. Reading Smart Contract Variables

The `useContractRead` hook from the Wagmi library allows you to fetch data from smart contracts without changing the state. For detailed usage instructions and examples, consult the [useContractRead documentation](https://wagmi.sh/react/hooks/useContractRead).

```javascript
import { useContractRead } from 'wagmi';

function App() {
  const { data, isLoading } = useContractRead({
    address: '0xabc...',
    abi: '<Your Contract ABI>',
    functionName: 'balanceOf',
    args: ['0xdef...'], 
  });

  if (isLoading) return <div>Loading…</div>
  return <div>Balance: {data}</div>
}
```

By utilizing the `useContractRead` hook, you can efficiently fetch and display the balance of a specific ERC20 token for a given address.

## 4. Sending Transactions with Smart Contracts (Write)

For interacting with a smart contract to change its state, the `useContractWrite` hook from the Wagmi library is recommended. Refer to the [useContractWrite documentation](https://wagmi.sh/react/hooks/useContractWrite) for more information on how to use this hook effectively.

```javascript
import { useContractWrite } from 'wagmi';

function App() {
  const { data, isLoading, isError, write } = useContractWrite({
    address: '0xabc...', // the address of your contract
    abi: '<Your Contract ABI>', 
    functionName: 'updateState', 
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error updating state</div>;

  return <button onClick={() => write()}>Update State</button>;
}
```

The `useContractWrite` hook enables you to send a transaction to call the `updateState` function of a contract deployed at the specified address.

## 5. Sending Raw Transactions

The `useSendTransaction` hook from the Wagmi library allows you to send raw transactions to the Ethereum network. For more information on how to send raw transactions, refer to the [useSendTransaction documentation](https://wagmi.sh/react/hooks/useSendTransaction).

```javascript
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi';

function App() {
  const prepareSendTransaction = usePrepareSendTransaction();
  const sendTransaction = useSendTransaction();

  const handleSendTransaction = async () => {
    const preparedTx = await prepareSendTransaction({
      to: '0xabc...',
      value: '0x123...',
      gasPrice: '0x456...',
      gasLimit: '0x789...',
      data: '0xdef...',
    });

    const result = await sendTransaction(preparedTx);
    console.log('Transaction sent:', result);
  };

  return <button onClick={handleSendTransaction}>Send Transaction</button>;
}
```

With the `useSendTransaction` hook, you can prepare a transaction using the `usePrepareSendTransaction` hook and then send it to the Ethereum network.

## 6. Interacting with ERC20 Tokens

To fetch ERC20 token information, the `useToken` hook from the Wagmi library is specifically designed. For more details, refer to the [useToken documentation](https://wagmi.sh/react/hooks/useToken).

```javascript
import { useToken } from 'wagmi';

function App() {
  const { data, isLoading, isError } = useToken({
    address: '0xabc...', // the address of the token contract
  });

  if (isLoading) return <div>Loading…</div>;
  if (isError) return <div>Error fetching token data</div>;
  return <div>Token: {data?.symbol}</div>;
}
```

Utilize the `useToken` hook to fetch and display information about an ERC20 token deployed at the specified address.

Now that you have a clear understanding of the different features and hooks provided by the OSO Web3 plugin in combination with the Wagmi library, you can seamlessly integrate web3 functionality into your frontend application. Happy coding!

For more detailed information and examples, be sure to consult the documentation for each specific hook provided by the Wagmi library.
