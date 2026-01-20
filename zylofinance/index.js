const xrpl = require("xrpl");

async function payForMint() {
    // Connect to the XRPL Testnet
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    const wallet = xrpl.Wallet.fromSeed("sEdTw5Kx98HGhmV2J34wtxbTUBdchvs");
    
    // YOUR EXTRACTED REFERENCE (Without the 0x prefix)

    const tx = {
        "TransactionType": "Payment",
        "Account": wallet.address,
        "Amount": xrpl.xrpToDrops("10.04"),
        "Destination": "r4uKJRy9mjxGHw1yzS1SrtaKCUwT66MCcP",
        "Memos": [
            {
                "Memo": {
                    "MemoType": Buffer.from("fasset", "utf8").toString("hex").toUpperCase(),
                    "MemoData": "0000000000000000000000000000000000000000000000000000000000d7f2e7".toUpperCase()
                }
            }
        ]
    };

    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    console.log("XRP Payment Validated!", result.result.hash);
    await client.disconnect();
}

payForMint();