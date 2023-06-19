import Web3 from "web3";
import subastasArtifact from "../../build/contracts/Subastas.json";
//import { Bee, BeeDebug } from '@ethersphere/bee-js';


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

      await window.ethereum.request({ method: "eth_requestAccounts" });
      this.getConnectedAccount();

      this.showBee();

      this.getTotalBalance();
      this.showMinter();

    } catch (error) {
      console.error("Could not connect to contract or chain.", error);
    }
  },

  showMinter: async function () {
    const { getMinter } = this.subastasContract.methods;
    const minter = await getMinter().call();
    console.log("Este es el minter:", minter);
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
      this.setAccount(this.account);
    }
    else {
      this.setAccount("NOT CONNECTED");
    }
  },

  generateNFT: async function () {
    //generar texto
    //recuperar imagen

    //almacenar imagen
    const { getTotalBids } = this.subastasContract.methods;
    let newTokenId = parseInt(await getTotalBids().call()) + 1;
    document.getElementById("input_idtoken").value = newTokenId;
    document.getElementById("testimage").src = "img/token" + newTokenId + ".jpg";
    document.getElementById("divCrearSubasta").style = "display:block";

  },

  createBid: async function () {
    let idToken = parseInt(document.getElementById("input_idtoken").value);
    let price = document.getElementById("price").value;
    let priceWei = this.web3.utils.toWei(price, "ether");

    const { createBid } = this.subastasContract.methods;
    let result = await createBid(idToken, priceWei).send({ from: this.account });
    console.log("Resultado transacción", result);
    this.refreshBidPage(idToken);
    document.getElementById("divCrearSubasta").style = "display:none";
    alert("Subasta creada");
  },

  placeBid: async function () {
    let tokenId = document.getElementById("input_tokenId").value;
    let bidAmountinEther = document.getElementById("input_bid").value;
    console.log("token id: ", tokenId);
    console.log("bid amount: ", bidAmountinEther);

    const { placeBid } = this.subastasContract.methods;
    let result = await placeBid(tokenId).send({
      from: this.account,
      value: this.web3.utils.toWei(bidAmountinEther, "ether")
    });
    console.log("Resultado transacción", result);
    this.refreshBidPage(tokenId);
  },

  refreshBidPage: async function (idToken) {
    document.getElementById("input_tokenId").value = idToken;

    const date = await this.getDeadLine(idToken);
    document.getElementById("input_deadline").value = date;

    const highestBid = await this.getHighestBid(idToken);
    document.getElementById("input_highest_bid").value = this.web3.utils.fromWei(highestBid, "ether") + " ETH";

    document.getElementById("imagenPuja").src = "img/token" + idToken + ".jpg";

    document.getElementById("input_bid").value = "";
  },

  transferBalance: async function () {
    let amountToTransfer = document.getElementById("").value;
    const { transferBalance } = this.subastasContract.methods;
    let result = await transferBalance(this.web3.utils.toWei(amountToTransfer, "ether")).send({
      from: this.account
    });
    console.log("Resultado transacción", result);
  },

  getHighestBidder: async function (idToken) {
    const { getHighestBidder } = this.subastasContract.methods;
    const highestBidder = await getHighestBidder(idToken).call();
    return highestBidder;
  },

  getHighestBid: async function (idToken) {
    const { getHighestBid } = this.subastasContract.methods;
    const highestBid = await getHighestBid(idToken).call();
    return highestBid;
  },

  getDeadLine: async function (idToken) {
    const { getDeadline } = this.subastasContract.methods;
    const deadline = await getDeadline(idToken).call();
    const date = new Date(deadline * 1000);
    return date;
  },

  showBee: async function () {
    alert("HOLA");
    const Bee = window.BeeJs.Bee;
    const bee = new Bee('http://localhost:1633');
    // Be aware, this creates on-chain transactions that spend Eth and BZZ!
    //const response = await bee.uploadData("HOLA");


    //const postageBatchId = await bee.createPostageBatch("100", 17);
    const postageBatchId = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const result = await bee.uploadData(postageBatchId, "Bee is awesome!")
    //const uploadResult = await bee.uploadData(batchId, "Bee is awesome!")
    //const data = await bee.downloadData(uploadResult.reference)
    //console.log(data.text()) // prints 'Bee is awesome!'
    console.log('Text uploaded:', result);
  },

  setAccount: function (message) {
    const status = document.getElementById("address_account");
    status.innerHTML = message;
  },

  showBid: async function (idToken) {
    //let tabs = document.getElementsByTagName("section");
    let inicio = document.getElementById("inicio");
    inicio.classList.remove("active");
    inicio.style.display = "none";

    let pujar = document.getElementById("pujar");
    pujar.classList.add("active");
    pujar.style.display = "block";


    let tabs = document.getElementsByClassName("tab");
    tabs[0].children[0].classList.remove("active");
    tabs[1].children[0].classList.add("active");

    document.getElementsByClassName("indicator")[0].remove;

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: false,
      composed: true
    });

    this.refreshBidPage(idToken);

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
    App.setAccount(accounts);
  })

  App.start();
});







