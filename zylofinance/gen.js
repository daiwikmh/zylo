import { Client, Wallet } from "xrpl";

async function main() {
    const client = new Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    // This generates a wallet AND funds it with 1,000 Test XRP automatically
    const { wallet, balance } = await client.fundWallet();
    
    console.log("--- USE THESE CREDENTIALS ---");
    console.log("Seed:   ", wallet.seed);    // Use this in your index.js
    console.log("Address:", wallet.address);
    console.log("Balance:", balance, "XRP");
    
    await client.disconnect();
}
main();