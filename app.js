let { Biconomy } = require("@biconomy/mexa");
let Web3 = require("web3");
require("dotenv").config();

let sigUtil = require("eth-sig-util"); // additional dependency 

const contractAddr = "0x582c986ab9d1fd8E44d1B76DD4452953B6f89B90";
const contractAbi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getQuote","outputs":[{"internalType":"string","name":"currentQuote","type":"string"},{"internalType":"address","name":"currentOwner","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTrustedForwarder","outputs":[{"internalType":"address","name":"forwarder","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"forwarder","type":"address"}],"name":"isTrustedForwarder","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"quote","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"newQuote","type":"string"}],"name":"setQuote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trustedForwarder","type":"address"}],"name":"setTrustedForwarder","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const privkey = process.env.PRIVATE_KEY;
const newQuote = "testttt123";

async function main() {
    const customProvider = new Web3.providers.HttpProvider('https://matic-mumbai.chainstacklabs.com');
    const biconomyWithWeb3 = new Biconomy(
        customProvider,
        {apiKey: "kAsdpiRAy.c9d8b991-99cf-499b-9af5-546f4d01a8fd", debug: true, contractAddresses: [contractAddr]}
    );
    const web3 = new Web3(biconomyWithWeb3);
    
    let contract = new web3.eth.Contract(contractAbi, contractAddr);
    let userAddress = process.env.ACCOUNT_ADDRESS;
    let privateKey = privkey;

    let txParams = {
        "from": userAddress,
        //gasLimit is optional or can be pre estimated for your method call before passing
        "gasLimit": web3.utils.toHex(300000), 
        "to": contractAddr,
        //optional. Note: Native meta transactions would not work if your method call is expecting ether value transfer and has checkes on msg.value
        "value": "0x0", 
        //Call your target method. here we are calling setQuote() method of our contract
        "data": contract.methods.setQuote(newQuote).encodeABI(), 
    };

    console.log(">>>mark1")
    const signedTx = await web3.eth.accounts.signTransaction(txParams, `0x${privateKey}`);
    console.log(">>>mark2")
    const forwardData = await biconomy.getForwardRequestAndMessageToSign(signedTx.rawTransaction);

    // const signature = sigUtil.personalSign(new Buffer.from(privateKey, 'hex'), { data: forwardData.personalSignatureFormat });
    let {signature} = web3.eth.accounts.sign("0x" + forwardData.personalSignatureFormat.toString("hex"), privateKey);

    let rawTransaction = signedTx.rawTransaction;

    let data = {
    signature: signature,
    forwardRequest: forwardData.request,
    rawTransaction: rawTransaction,
    signatureType: biconomy.PERSONAL_SIGN //optional. mexa will assume personal signature by default if this is omitted
    };

    // Get the transaction Hash using the Event Emitter returned
    // web3.eth.sendSignedTransaction(data)
    // .on('transactionHash', (hash)=> {
    // console.log(`Transaction hash is ${hash}`)
    // })
    // .once('confirmation', (confirmation, receipt)=> {
    // console.log(`Transaction Confirmed.`);
    // console.log(receipt);
    // //do Something
    // });

    /********* OR *********/

    // Use any one of the methods below to check for transaction confirmation
    // USING PROMISE
    let receipt = await web3.eth.sendSignedTransaction(data, (error, txHash)=>{
        if(error) {
            return console.error(error);
        }
        console.log(txHash);
    });
}


main()