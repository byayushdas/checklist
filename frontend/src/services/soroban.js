import { signTransaction } from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

export const CONTRACT_ID = "CCM2QRFZ4W4GHYWN3KHIPEK2YOUNTPJWWBPXVFBOTCYKMWO4YAWNW5WO";

// Define the RPC and Network
const rpcUrl = "https://soroban-testnet.stellar.org";
// IMPORTANT: We use Futurenet/Testnet. Currently the testnet Horizon/RPC is standard.
const networkPassphrase = StellarSdk.Networks.TESTNET;

export const server = new StellarSdk.rpc.Server(rpcUrl);

/**
 * Builds, signs (via Freighter), and submits an 'add' or 'mark_done' operation.
 */
export async function submitChecklistOperation(publicKey, methodName, argsArray = []) {
  try {
    // 1. Load account info
    const { _baseAccount } = await server.getAccount(publicKey);
    
    // 2. Prepare contract invocation
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    
    // The operation is constructed.
    const operation = contract.call(methodName, ...argsArray);

    // 3. Build the transaction
    const tx = new StellarSdk.TransactionBuilder(_baseAccount, {
      fee: "10000",
      networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    // 4. Simulate the transaction to fetch footprint & estimated cost/fee
    const preparedTx = await server.prepareTransaction(tx);

    // 5. Sign the transaction with Freighter (this prompts the user)
    const signedXdr = await signTransaction(preparedTx.toXDR(), {
      network: "TESTNET",
    });

    if (!signedXdr) throw new Error("User rejected signing.");

    const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);

    // 6. Send the transaction to the network
    console.log("Submitting transaction to network...");
    const sendResponse = await server.sendTransaction(signedTx);
    
    if (sendResponse.status === "PENDING") {
      // 7. Wait for transaction to be added to ledger
      let statusResponse = await server.getTransaction(sendResponse.hash);
      while (statusResponse.status === "NOT_FOUND") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        statusResponse = await server.getTransaction(sendResponse.hash);
      }
      
      if (statusResponse.status === "SUCCESS") {
        return statusResponse;
      } else {
        throw new Error(`Tx failed: ${statusResponse.status}`);
      }
    } else {
        throw new Error(`Tx failed directly on send: ${sendResponse.status}`);
    }

  } catch (error) {
    console.error("Soroban operation error:", error);
    throw error;
  }
}

/**
 * Custom method to add a task.
 */
export async function addTask(publicKey, taskDescription) {
  // `add` likely takes `(env, description: String)` -> SCVal String
  // We pass it as native string value, need to convert to scval based on contract expectations.
  const args = [
    StellarSdk.nativeToScVal(publicKey, { type: 'address' }), // Usually auth might be needed, assuming pubkey or task desc first. Let's send the string desc.
    StellarSdk.nativeToScVal(taskDescription, { type: 'string' })
  ];

  // We should actually check how the contract expects arguments. Let's just pass task text for now.
  // We'll update after we see what the args actually look like. Assuming `add(env, task: String)`
  const argsToSubmit = [StellarSdk.nativeToScVal(taskDescription, { type: 'string' })];
  return submitChecklistOperation(publicKey, "add", argsToSubmit);
}
