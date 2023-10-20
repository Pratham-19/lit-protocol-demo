import {
  LitNodeClient,
  checkAndSignAuthMessage,
  decryptToString,
  encryptString,
} from "lit-node-latest";
import * as LitJsSdk from "lit-node";
import { SetStateAction, useState } from "react";

export default function Home() {
  const [cipherText, setCipherText] = useState("");
  const [dataToEncryptHash, setDataToEncryptHash] = useState("");
  const [decryptedData, setDecryptedData] = useState("");
  const [encryptedStringV2, setEncryptedStringV2] = useState<Blob>();
  const [encryptedSymmetricKeyV2, setEncryptedSymmetricKeyV2] = useState("");
  const data = {
    name: "test",
    description: "test",
    image: "test",
  };

  const chain = "polygon";

  const evmContractConditions = [
    {
      contractAddress: "0xF657A4950aa10Cf64ccCCE49AAB0b04eDB0D0b9b",
      functionName: "canUserDecrypt",
      functionParams: [
        ":userAddress",
        "0xf4ff2fed1541df288ec818a5c58ff6b48fba8fcedfc53c3c4ab992882b0711f7",
      ],
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
        key: "",
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
        chain,
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
    decryptToString(
      {
        evmContractConditions,
        ciphertext: cipherText,
        dataToEncryptHash,
        authSig,
        chain,
      },
      litNodeClient
    )
      .then((res: any) => {
        setDecryptedData(res);
      })
      .catch((e: any) => console.error(e));
  };
  const encrpytV2 = async () => {
    const client = new LitJsSdk.LitNodeClient({
      alertWhenUnauthorized: false,
    });
    await client.connect();

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
      JSON.stringify(data)
    );
    setEncryptedStringV2(encryptedString);
    const encryptedSymmetricKey = await client.saveEncryptionKey({
      evmContractConditions,
      symmetricKey,
      authSig,
      chain,
    });
    console.log(encryptedString, encryptedSymmetricKey);
    // setEncryptedSymmetricKeyV2(encryptedSymmetricKey);
  };
  const decrpytV2 = async () => {
    const client = new LitJsSdk.LitNodeClient({
      network: "serrano",
    });
    await client.connect();
    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    const symmetricKey = await client.getEncryptionKey({
      evmContractConditions,
      toDecrypt: encryptedSymmetricKeyV2,
      chain,
      authSig,
    });

    const decryptedString = await LitJsSdk.decryptString(
      encryptedStringV2 as Blob,
      symmetricKey
    );

    console.log(decryptedString);
  };
  return (
    <main className="mx-auto mt-10  text-center">
      <h2>Encrpyt & Decrypt Data on the Blockchain with Lit</h2>
      <div className="flex flex-grow justify-center space-x-10">
        <div className="flex flex-col justify-center items-center space-y-4">
          <h3 className="mt-10">Data to Encrypt</h3>
          <pre className="bg-slate-600 rounded-xl p-3 ">
            {JSON.stringify(data, null, 1)}
          </pre>
        </div>
        <div className="flex flex-col justify-center items-center space-y-4">
          <h3 className="mt-10">Encrypted Data</h3>
          <pre className="bg-slate-600 rounded-xl p-3">
            <h2 className="text-ellipsis">
              Ciphertext: {cipherText.slice(0, 10)}...
            </h2>
            DataToEncryptHash: {dataToEncryptHash.slice(0, 10)}...
          </pre>
        </div>
        <div className="flex flex-col justify-center items-center space-y-4">
          <h3 className="mt-10">Decrypted Data</h3>
          <pre className="bg-slate-600 rounded-xl w-20 p-3">
            {JSON.stringify(decryptedData, null, 1)}
          </pre>
        </div>
      </div>
      <div className="flex justify-center items-center space-x-9">
        <button
          onClick={encrpytV2}
          className="bg-white p-3 rounded-xl mt-10 text-black"
        >
          Encrypt V2
        </button>
        <button
          onClick={encrypt}
          className="bg-white p-3 rounded-xl mt-10 text-black"
        >
          Encrypt V3
        </button>
        <button
          onClick={decrpytV2}
          className="bg-white p-3 rounded-xl mt-10 text-black"
        >
          Decrypt V2
        </button>
        <button
          onClick={decrypt}
          className="bg-white p-3 rounded-xl mt-10 text-black"
        >
          Decrypt V3
        </button>
      </div>
    </main>
  );
}
