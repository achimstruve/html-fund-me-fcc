//const { ethers } = require("ethers") // require doesn't work in frontend js
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("Connected to Metamask account!")
        connectButton.innerHTML = "Connected"
        console.log(ethers)
    } else {
        fundButton.innerHTML = "Please Install Metamask!"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}..`)
    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // signer / wallet / someone to sign it
        const signer = provider.getSigner()
        console.log(signer)
        // contract to interact with -> ABI and contract address
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const txResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount) })
            await listenForTransactionMine(txResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(txResponse, provider) {
    console.log(`Mining ${txResponse.hash}...`)
    // listen for this transaction to finish..
    // using a Promise function that takes a function as input parameter
    // putting resolve() into the provider.once function means that it waits until the listener gets the value
    // use the reject input/parameter to define the case where we have a timeout
    return new Promise((resolve, reject) => {
        provider.once(txResponse.hash, (txReceipt) => {
            console.log(`Completed with ${txReceipt.confirmations} confirmations`)
            resolve()
        }) // () => {} this is an anonymous function that gets called to listen to the blockchain
    })
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing funds..")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const txResponse = await contract.withdraw()
            await listenForTransactionMine(txResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}
