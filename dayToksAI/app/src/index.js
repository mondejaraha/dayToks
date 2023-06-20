import Web3 from "web3";
import subastasArtifact from "../../build/contracts/Subastas.json";
import daytoksArtifact from "../../build/contracts/DayToks.json";
//import { Bee, BeeDebug } from '@ethersphere/bee-js';
import { Configuration, OpenAIApi } from "openai";

const App = {
  web3: null,
  account: null,
  meta: null,
  subastasContract: null,
  daytoksContract: null,

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

      this.daytoksContract = new web3.eth.Contract(
        daytoksArtifact.abi,
        deployedNetwork.address,
      );

      await window.ethereum.request({ method: "eth_requestAccounts" });
      this.getConnectedAccount();

      //this.showBee();

      this.getTotalBalance();
      this.showMinter();
      
      this.refreshBidPage2(document.getElementById("input_tokenId").value);


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
    console.log("Este es el balance del contrato:", balance,"Wei");
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
    const textoPrompt = document.getElementById("input_prompt").value;
    console.log(textoPrompt);
    //recuperar imagen

    this.generateImgAI(textoPrompt);
    //almacenar imagen
    const { getTotalBids } = this.subastasContract.methods;
    let newTokenId = parseInt(await getTotalBids().call()) + 1;
    document.getElementById("input_idtoken").value = newTokenId;
    //document.getElementById("testimage").src = await this.generateImgAI(textoPrompt);
    document.getElementById("divCrearSubasta").style = "display:block";


    //https://file.aitubo.ai/images/art/64909b66dfa2b742e95ae278/ci8dcibbhhag00805uug.jpg

  },

  generateImgAI: async function (promtStr) {
    const token = 'api-61167e250ecd11ee97f20ebf43cd58a1';
    const url = 'https://creator.aitubo.ai/api/job/create';
    let jobId;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const data = JSON.stringify({
      prompt: promtStr,
      //modelId: '642b977d2f2842537c09fe41',
      count: 1,
    });

    await fetch(url, {
      method: 'POST',
      headers: headers,
      body: data
    })
      .then(response => response.json())
      .then(data => {
        console.log('Response:', data);
        jobId = data.data.id;
        console.log('ID:', jobId);
      })
      .catch(error => {
        console.error('Error:', error);
      });

    const generatedImage = await this.recoverImg(jobId);
    return generatedImage;
  },

  recoverImg: async function (jobId) {
    //const url = 'https://creator.aitubo.ai/api/job/get?id=6490b023dfa2b742e95aedf0';
    const headers = {
      'Content-Type': 'application/json'
    };
    const url = 'https://creator.aitubo.ai/api/job/get?id=' + jobId;
    const pollInterval = 5000; // Poll every 5 seconds
    const pollTimer = setInterval(() => {
      fetch(url, { headers })
        .then(response => response.json())
        .then(data => {
          const jobStatus = data.data.status;
          console.log(data);
          console.log(`Job ${jobId} status:`, jobStatus);

          if (jobStatus == 2) {
            clearInterval(pollTimer);
            console.log(`Job ${jobId} completed successfully.`);
            const urlResultImg = data.data.result.data.domain + data.data.result.data.images[0];
            document.getElementById("testimage").src = urlResultImg;
            return urlResultImg;

          } else {
            //clearInterval(pollTimer);
            console.log(`Job ${jobId} failed.`);
            // Handle the failed job if needed
          }
        })
        .catch(error => {
          clearInterval(pollTimer);
          console.error('Error:', error);
        });
    }, pollInterval);
  },

  createBid: async function () {
    let idToken = parseInt(document.getElementById("input_idtoken").value);
    let price = document.getElementById("price").value;
    let priceWei = this.web3.utils.toWei(price, "ether");
    let url = document.getElementById("testimage").src;

    const { createBid } = this.subastasContract.methods;
    let result = await createBid(idToken, priceWei).send({ from: this.account });
    console.log("Resultado transacción", result);
    //this.setTimer(idToken);
    this.refreshBidPage2(idToken);
    document.getElementById("divCrearSubasta").style = "display:none";
    
    this.saveImageFromURL(url,"token"+idToken+".jpg");
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
    this.refreshBidPage2(tokenId);
    console.log("New Highest Bidder: ", await this.getHighestBidder(tokenId));
    //this.showBid();
  },

  refreshBidPage: async function (idToken) {

    document.getElementById("daytok_title").innerHTML = "DAYTOK"+idToken;

    document.getElementById("input_tokenId").value = idToken;

    const date = await this.getDeadLine(idToken);
    document.getElementById("input_deadline").value = date;

    const highestBid = await this.getHighestBid(idToken);
    document.getElementById("input_highest_bid").value = this.web3.utils.fromWei(highestBid, "ether") + " ETH";

    document.getElementById("imagenPuja").src = document.getElementById("testimage").src;

    document.getElementById("input_bid").value = "";
  },

  refreshBidPage2: async function (idToken) {
    document.getElementById("daytok_title").innerHTML = "DAYTOK"+idToken;

    document.getElementById("input_tokenId").value = idToken;

    const date = await this.getDeadLine(idToken);
    document.getElementById("input_deadline").value = date;

    const highestBid = await this.getHighestBid(idToken);
    document.getElementById("input_highest_bid").value = this.web3.utils.fromWei(highestBid, "ether") + " ETH";

    document.getElementById("imagenPuja").src = `img/token${idToken}.jpg`;

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

  setAccount: function (newAccount) {
    const accountEl = document.getElementById("address_account");
    accountEl.innerHTML = newAccount;
    this.account = newAccount.toString();
    console.log("Connected Account: ", this.account);
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

    this.refreshBidPage2(idToken);

  },

  finishAuction: async function(idToken) {
    const { finishAuction } = this.subastasContract.methods;
    let result = await finishAuction(idToken).send({ from: this.account });
    console.log("Resultado transacción", result);

    const { transferNFT } = this.daytoksContract.methods;
    result = await transferNFT(this.account, await this.getHighestBidder(idToken) ,idToken).send({ from: this.account });
    console.log("Resultado transacción", result);
  },

  /******************** DAYTOK OPERATIONS ******************/
  mintNFT: async function () {
    let idToken = document.getElementById("input_idtoken").value;
    let imagen = document.getElementById("hidden_address").value;

    const { safeMint } = this.daytoksContract.methods;
    let result = await safeMint(this.account, idToken, imagen.toString()).send({ from: this.account });
    console.log("Resultado transacción", result);
    //this.refreshBidPage(idToken);
    //document.getElementById("divCrearSubasta").style = "display:none";
    alert("Token creado");
  },

  daytoksContractOwner: async function () {
    const { owner } = this.daytoksContract.methods;
    const ownerAddress = await owner().call();
    console.log("Owner Address: ", ownerAddress);
  },

  /********************  UTILS  *************************/
  saveImageFromURL: function (url, fileName) {
    // Create a new image element
    const image = new Image();
  
    // Set the crossOrigin attribute to "Anonymous" to avoid CORS issues
    image.crossOrigin = "Anonymous";
  
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
  
    // Fetch the image data
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        // Convert the blob to an object URL
        const imageUrl = URL.createObjectURL(blob);
  
        // Set the image source to the object URL
        image.src = imageUrl;
  
        // Wait for the image to load
        image.onload = function () {
          // Set the canvas dimensions to match the image
          canvas.width = image.width;
          canvas.height = image.height;
  
          // Draw the image onto the canvas
          context.drawImage(image, 0, 0);
  
          // Convert the canvas content to a data URL
          const dataURL = canvas.toDataURL("image/jpeg");
  
          // Create a link element
          const link = document.createElement("a");
          link.href = dataURL;
          link.download = fileName;
  
          // Programmatically trigger a click on the link to start the download
          link.click();
  
          // Clean up the object URL
          URL.revokeObjectURL(imageUrl);
        };
      })
      .catch((error) => {
        console.error("Error saving image:", error);
      });
      console.log("Imagen guardada");
  },

  setTimer: async function (idToken) {
    try {
      /* Timer para pujas oficiales
      const currentTime = new Date().getTime();
      const deadline = await this.getDeadLine(idToken);
      const timeDifference = deadline - currentTime;
      */
      
      /* Timer para el simulacro */
      console.log("Timer iniciado");
      const timeDifference = 5*1000;
    
      if (timeDifference > 0) {
        setTimeout(async () => {
          //this.finishAuction(idToken);
          const ganador = await this.getHighestBidder(idToken);
          alert("La puja ha finalizado\n El ganador ha sido: " + ganador)
          console.log(`Gandador del DAYTOK${idToken}: ${ganador}`);;
        }, timeDifference);
      } else {
        console.log('The deadline has already passed.');
      }
    } catch (error) {
      console.error('Error retrieving the deadline:', error);
    }
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







