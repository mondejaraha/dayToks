import Web3 from "web3";
import subastasArtifact from "../../build/contracts/Subastas.json";

const App = {
  web3: null,
  account: null,
  meta: null,
  subastasContract: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      console.log('Network ID:', networkId);
      const deployedNetwork = subastasArtifact.networks[networkId];

      this.subastasContract = new web3.eth.Contract(
        subastasArtifact.abi,
        deployedNetwork.address,
      );

      //console.log(this.subastasContract);
      //console.log(this.meta);
      this.mostrarCuenta();
      this.getTotalBalance();
      this.showMinter();
      this.getHighestBidder();
      this.getDeadLine();
      this.getConnectedAccount();

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
      console.log(accounts);

      this.refreshBalance();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  mostrarCuenta: async function () {
    const { getMinter } = this.subastasContract.methods;
    const minter = await getMinter().call();
    console.log("Este es el minter:", minter);
  },

  showMinter: async function () {
    const { getMinter } = this.subastasContract.methods;
    const minter = await getMinter().call();
    document.getElementById("minter").innerHTML = "Minter: " + minter;
  },

  getTotalBalance: async function () {
    const { getBalance } = this.subastasContract.methods;
    const balance = await getBalance().call();
    console.log("Este es el balance del contrato:", balance);
  },

  getConnectedAccount: async function () {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (this.account != accounts[0]) {
      this.account = accounts[0];
      console.log('Total accounts:', accounts.length, 'First account:', this.account);
    }
  },

  createBid: async function () {
    const { createBid } = this.subastasContract.methods;
    let result = await createBid(1).send({ from: this.account });
    console.log("Resultado transacción", result);
  },

  placeBid: async function () {
    let tokenId = document.getElementById("tokenId").value;
    let bidAmountinEther = document.getElementById("bidAmount").value;
    console.log("token id: ", tokenId);
    console.log("bid amount: ", bidAmountinEther);
    
    const { placeBid } = this.subastasContract.methods;
    let result = await placeBid(tokenId).send({ 
      from: this.account,
      value: this.web3.utils.toWei(bidAmountinEther, "ether")
    });
    console.log("Resultado transacción", result);
  },

  transferBalance: async function () {
    let amountToTransfer = document.getElementById("").value;
    const { transferBalance } = this.subastasContract.methods;
    let result = await transferBalance(this.web3.utils.toWei(amountToTransfer, "ether")).send({ 
      from: this.account
    });
    console.log("Resultado transacción", result);
  },

  getHighestBidder: async function () {
    const { getHighestBidder } = this.subastasContract.methods;
    const highestBidder = await getHighestBidder(2).call();
    console.log("Pujador ganando:", highestBidder);
  },

  getDeadLine: async function () {
    const { getDeadline } = this.subastasContract.methods;
    const deadline = await getDeadline(2).call();
    const date = new Date(deadline * 1000);
    console.log("Deadline:", date);
  },

  setStatus: function (message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },
};

window.App = App;

window.addEventListener("load", function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://192.168.0.23:7545"),
    );
  }

  window.ethereum.on('accountsChanged', function (accounts) {
    App.setStatus(accounts);
  })

  App.start();
});


const { Bee, BeeDebug } = require("@ethersphere/bee-js");

async function main() {
  const bee = new Bee("http://localhost:1633"); // Replace with the appropriate Bee node URL
  const beeDebug = new BeeDebug("http://localhost:1635"); // Replace with the appropriate Bee Debug node URL

  try {
    const fileData = "Hello, Bee DevSwarm!"; // Contents of the file

    // Upload file
    const response = await bee.uploadFile(fileData);
    console.log("File uploaded. Reference:", response.reference);

    // Retrieve chunk
    const chunkData = await beeDebug.downloadChunk(response.reference);
    console.log("Chunk retrieved. Data:", chunkData);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();

