import React, { useEffect, useState } from "react";
import "./App.css";
import abi from "./utils/WavePortal.json";
import { ethers } from "ethers";

const App = () => {
  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
   /*
   * All state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([]);
   /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0x2f9c2377736956bEC124F7B70E12c7467031EDdB";
    /**
   * Create a variable here that references the abi content!
   */
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        await totalWaveCount();
        await getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

   /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }
  
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
       
        
        /*
        * Execute the actual wave from your smart contract
        */
        let msgTxt = document.getElementById("inputTxt").value;
        const waveTxn = await wavePortalContract.wave(msgTxt, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        document.getElementById("totalWaves").innerHTML = "Total Wave Count: "+ count.toNumber();
         
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
}
  const totalWaveCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
    document.getElementById("totalWaves").innerHTML = "Total Wave Count: "+ count.toNumber();
      }
    } catch (error) {
      console.log(error);
    }
  }
   /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  /**
 * Listen in for emitter events!
 */
  useEffect(() => {
    let wavePortalContract;
  
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
  
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }
  
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  return (
    <body>
    <div className="header">
      👋 Hey there! Welcome to My Wave Portal 👋 
    </div>
    
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="leftSide">
          <div className="bio">
            Connect your Ethereum wallet and set it to Rinkeby Test Network and then wave at me!
          </div>
          <div className="buttonCenter">
            <button className="waveButton" onClick={wave}>
            Wave at Me❤
            </button>
          </div>
          <form className="inputMessage"> 
            <div>Please Enter a Message for Me:</div>
            <input type="text" id="inputTxt"/>
          </form>
  
          {/*
          * If there is no currentAccount render this button
          */}
          {!currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}   
          <div className="waveCount">
            <h1 id="totalWaves">Total Wave Count: 0</h1>
          </div>
          <div className="trCenter">
          {allWaves.map((wave, index) => {
            return (
              <div key={index} style={{marginTop: "10px", padding: "8px", width: "500px", boxShadow: "3px 3px 3px 3px gray"}}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>)
          })}
          </div>
        </div>
        <div className="rightSide">
          <div className="imgCenter">
            <img src="./img1.jpg" alt="build-space Icon" width="300" height="300" />
          </div>
          <div className="lnk"><a href="https://buildspace.so/">buildspace.com</a></div>
        </div>
      </div>
    </div>
    </body>
  );
}
export default App