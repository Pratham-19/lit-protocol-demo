import {
  LitNodeClient,
  checkAndSignAuthMessage,
  decryptToString,
  encryptString,
} from "@lit-protocol/lit-node-client";
import { useState } from "react";

export default function Home() {
  const [cipherText, setCipherText] = useState("");
  const [dataToEncryptHash, setDataToEncryptHash] = useState("");
  const [decryptedData, setDecryptedData] = useState("");
  const data = {
    name: "test",
    description: "test",
    image: "test",
  };

  const chain = "mumbai";

  const evmContractConditions = [
    {
      // conditionType: "evmContract",
      contractAddress: "0xF657A4950aa10Cf64ccCCE49AAB0b04eDB0D0b9b",
      functionName: "canUserDecrypt",
      functionParams: [":userAddress", "8"],
      functionAbi: {
        inputs: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "dealId",
            type: "bytes32",
          },
        ],
        name: "canUserDecrypt",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      chain,
      returnValueTest: {
        comparator: "=",
        value: "true",
      },
    },
  ];
  const litNodeClient = new LitNodeClient({
    alertWhenUnauthorized: false,
    litNetwork: "cayenne",
  });
  const encrypt = async () => {
    await litNodeClient.connect();

    const authSig = await checkAndSignAuthMessage({
      chain,
    });

    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        evmContractConditions,
        authSig,
        chain: "ethereum",
        dataToEncrypt: JSON.stringify(data),
      },
      litNodeClient
    );
    setCipherText(ciphertext);
    setDataToEncryptHash(dataToEncryptHash);
  };
  const decrypt = async () => {
    await litNodeClient.connect();
    const authSig = await checkAndSignAuthMessage({ chain });
    console.log("jwfsff", {
      evmContractConditions,
      ciphertext: cipherText,
      dataToEncryptHash,
      authSig,
      chain,
    });
    const decryptedString = decryptToString(
      {
        evmContractConditions,
        ciphertext: cipherText,
        dataToEncryptHash,
        authSig,
        chain,
      },
      litNodeClient
    );
    // setDecryptedData(decryptedString as string);
    console.log(decryptedString);
  };

  return (
    <main className="mx-auto mt-10  text-center">
      <h2>Encrpyt & Decrypt Data on the Blockchain with Lit</h2>
      <div className="flex flex-grow justify-center space-x-10">
        <div className="flex flex-col justify-center items-center space-y-4">
          <h3 className="mt-10">Data to Encrypt</h3>
          <pre className="bg-slate-600 rounded-xl w-fit p-3">
            {JSON.stringify(data, null, 1)}
          </pre>
        </div>
        <div className="flex flex-col justify-center items-center space-y-4">
          <h3 className="mt-10">Encrypted Data</h3>
          <pre className="bg-slate-600 rounded-xl w-fit p-3">
            <h2 className="text-ellipsis">
              Ciphertext: {cipherText.slice(0, 10)}...
            </h2>
            DataToEncryptHash: {dataToEncryptHash.slice(0, 10)}...
          </pre>
        </div>
        <div className="flex flex-col justify-center items-center space-y-4">
          <h3 className="mt-10">Decrypted Data</h3>
          <pre className="bg-slate-600 rounded-xl w-fit p-3">
            {JSON.stringify(decryptedData, null, 1)}
          </pre>
        </div>
      </div>
      <div className="flex justify-center items-center space-x-9">
        <button
          onClick={encrypt}
          className="bg-white p-3 rounded-xl mt-10 text-black"
        >
          Encrypt
        </button>
        <button
          onClick={decrypt}
          className="bg-white p-3 rounded-xl mt-10 text-black"
        >
          Decrypt
        </button>
      </div>
    </main>
  );
}
