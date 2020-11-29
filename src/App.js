import React, { Component, Suspense } from "react";
import Web3 from 'web3';

import { farmContractABI } from './abi.js';
import { uniswapLPABI } from './abiUni.js';
import { buccv2ABI } from './buccABI.js';
import { getInfoABI } from './getInfoABI.js';

//General Style Imports
import twitter from './twitterLogo.png';
import telegram from './telegramLogo.png';

//CSS STYLESHEETS
import './loader.css';
import './App.css';
import './design.css';
import 'bootstrap/dist/css/bootstrap.min.css';

//REBASS STYLE
import {
  Button,
  Text
} from 'rebass';
import { Input } from '@rebass/forms';
import preset from '@rebass/preset';

//IMAGES IMPORTS
import Bucc from "./black.png";

//Bootstrap
import Card from 'react-bootstrap/Card';
import Navbar from 'react-bootstrap/Navbar';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
var ethereum_address = require('ethereum-address');
var abi = require('human-standard-token-abi');

/*MAIN NET*/
const contractAddress = "0x0ffaa8eeb2ee18c9174e4c5d6af6ce48199c6879";
const uniswapLPAddress = "0x7772612549f27aa49c83fa59ab726f4799e4ecdc";
const buccv2 = "0xd5a7d515fb8b3337acb9b053743e0bc18f50c855";
const getInfoAddr = "0x819c02463f588745576E7407Ce2Fc798C93E8B4f";



/*TEST NET*/
/*
const contractAddress = "0x4dcaFC0f719926B8D069A837B9E055C828eF3F5D";
const uniswapLPAddress = "0xC56fCF5b83663cF6F78FaDE3176E85134A500599";
const buccv2 = "0x2E9bC140e2721190a14AeAFeC214bAbA16679c63";
const getInfoAddr = "0x555a8C426cCAEF9cd9f1cAdD209E9832D2da5359";
*/
 

export default class App extends Component {
  constructor(props) {
    super(props);
    this.web3 = "";
    this.contractAddress = "";
    this.accounts = "";
    //ON ADDRESS UPDATE
    this.addrUpdate = this.addrUpdate.bind(this);
    //FUNCTIONS
    this.subscribe = this.subscribe.bind(this);
    this.addKey = this.addKey.bind(this);
    //INPUTS
    this.privateaddressToSend = this.privateaddressToSend.bind(this);
    this.privateaddKey = this.privateaddKey.bind(this);
    this.amountofETH = this.amountofETH.bind(this);
    this.addresstoSendETH = this.addresstoSendETH.bind(this);
    this.addressToSearch = this.addressToSearch.bind(this);
    this.tokensToSend = this.tokensToSend.bind(this);
    //TUMBLING FUNCTIONS
    this.executeSendETH = this.executeSendETH.bind(this);
    this.lookupTokenAddress = this.lookupTokenAddress.bind(this);
    this.keySendTokens = this.keySendTokens.bind(this);
    this.tumbleTokens = this.tumbleTokens.bind(this);
    this.keySendETH = this.keySendETH.bind(this);
    this.shredKey = this.shredKey.bind(this);
    //SHOW FUNCTIONS
    this.showETH = this.showETH.bind(this);
    this.showToken = this.showToken.bind(this);
    //LOADER
    this.setupLoader = this.setupLoader.bind(this);
    //Set State
    this.state = {
      progressVisibility: false,
      progressBar: true,
      progress: 0,
      progressDescription: "",
      fadeOut: "",
      buttonClaimColor: "primary",
      hideMenus: false,
      subscribed: false,
      key: false,
      returnKeyforUser: "",
      //Button Show Tabs
      showETH: true,
      showETHKey: true,
      showToken: false,
      showTokenKey: false,
      //PROGRESS
      beginning: false,
      //LOADER
      loader: true,
      percentageLoader: "0%",
      visibility: "visible",
      loaderCSS: "loaderCoverSheet"
    }
    document.body.style.overflowY = "hidden";
  }

  componentDidMount = async () => {
    this.initateEthereum = this.initateEthereum.bind(this);
    this.initateEthereum();
  }

  setupLoader = async () => {
    var that = this;
    setTimeout(function(){that.setState({percentageLoader: "90%", loaderCSS: "loaderCoverSheet2"});
    document.body.style.overflowY = "scroll";}, 280);
    setTimeout(function(){that.setState({loader: false, loaderCSS: "loaderCoverSheet2"});}, 300);
    }

initateEthereum = async () => {
  if (typeof window.web3 !== 'undefined') {
  const that = this;
  this.setState({percentageLoader: "Web3 Sign-In"});
  this.getEthereumAccount = this.getEthereumAccount.bind(this);
    try {            
      await window.web3.currentProvider.enable().finally(
        async () => {
        that.setState({percentageLoader: "15%"});
        that.getEthereumAccount();
        that.setState({percentageLoader: "25%"});
        }
      );
    } catch (e) {
        console.log(e);
        this.setState({buccFarmed: "User likely rejected connection to the site."});
    }
  } else {
    this.setState({buccFarmed: "Metamask or a web3 portal not detected."});
    console.log("Metamask not detected or installed.")
  }
  }

    /* INPUTS */
  privateaddressToSend(amount) {
    this.setState({privateaddressToSend: amount.target.value});
  }

  privateaddKey(addr) {
    this.setState({privateaddKey: addr.target.value});
    var privateaddKey = String(addr.target.value);
    var that = this;
    if (ethereum_address.isAddress(privateaddKey)) {
      setTimeout(() => {(that.setState({privateaddKey}))
      that.addKey();}, 200);
    }
  }

  amountofETH(ETHamount) {
    this.setState({ETHamount: ETHamount.target.value});
  }

  addressToSearch(addr) {
    this.setState({addressToSearch: addr.target.value});
    var addressToSearch = String(addr.target.value);
    var that = this;
    if (ethereum_address.isAddress(addressToSearch)) {
      setTimeout(() => {(that.setState({addressToSearch}))
      that.lookupTokenAddress();}, 200);
    }
  }

  tokensToSend(amount) {
    this.setState({tokens: amount.target.value})
  }

  addresstoSendETH(addr) {
    this.setState({keyAddrETH: addr.target.value});
  }
  

  getEthereumAccount = async () => {
    if (window.web3.currentProvider.selectedAddress !== null) {
        const web3 = new Web3(window.ethereum);
        this.setState({percentageLoader: "30%"});
        const accounts = await web3.eth.getAccounts();
        this.setState({percentageLoader: "40%"});
        const buccFarm = await new web3.eth.Contract(farmContractABI, contractAddress);
        const uniLP = await new web3.eth.Contract(uniswapLPABI, uniswapLPAddress);
        const buccV2Contract = await new web3.eth.Contract(buccv2ABI, buccv2);
        this.setState({percentageLoader: "50%"});

        //set the state variables for implementation
        this.setState({web3, accounts, buccFarm, uniLP, buccV2Contract});
        
        var subscribed = await this.state.buccFarm.methods.checkSubscription().call({from: this.state.accounts[0]});
        var isaKeyAddress = await this.state.buccFarm.methods.isKey().call({from: this.state.accounts[0]});
        var haskey = await this.state.buccFarm.methods.viewHasKey().call({from: this.state.accounts[0]});
        this.setState({percentageLoader: "60%"});

        if (!(subscribed)) {
          var subscriptionFee = await this.state.buccFarm.methods.returnsubscriptionFee().call({from: this.state.accounts[0]});
          this.setState({subscriptionFee});
        }
        if (subscribed && haskey && !isaKeyAddress) {
          var returnKeyforUser = await this.state.buccFarm.methods.returnKeyforUser().call({from: this.state.accounts[0]});
          this.setState({returnKeyforUser});
        }

        this.setState({percentageLoader: "70%"});

        if (subscribed && haskey || isaKeyAddress) {
          var ethinContract = await this.state.buccFarm.methods.returnTotalETH().call({from: this.state.accounts[0]});
          var userETHinContract = await this.state.buccFarm.methods.returnUserETH().call({from: this.state.accounts[0]});
          var returnKeyUserETH = await this.state.buccFarm.methods.returnKeyUserETH().call({from: this.state.accounts[0]});
          ethinContract = (ethinContract / 1000000000000000000).toFixed(2);
          userETHinContract = (userETHinContract / 1000000000000000000).toFixed(2);
          returnKeyUserETH = (returnKeyUserETH / 1000000000000000000).toFixed(2);
          this.setState({ethinContract, userETHinContract, returnKeyUserETH});
        }

        this.setState({subscribed, haskey, isaKeyAddress, percentageLoader: "80%"});
        this.setupLoader();
        window.ethereum.on('accountsChanged', this.addrUpdate);
    }
  }

  addrUpdate = async () => {
    window.location.reload();
  }

  /* TUMBLING FUNCTIONS */
  keySendTokens = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 5, 
      progressDescription: "Setting tokens",
      progressBar: true,
      beginning: true});
        var fullAmount =  Number(this.state.tokens) * Math.pow(10, Number(this.state.decimals));
        var recipient = await this.state.buccV2Contract.methods.displayUserCount(this.state.keyAddrETH).call({from: this.state.accounts[0]});
      if (recipient == 0) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Use a third account to send 0 BUCC to your recipient address to whitelist them into the BUCC contract",
        progressBar: false,
        beginning: false});
        setTimeout(() => {return !(this.state.beginning) ? this.setState({progressVisibility: false}) : null;}, 10000);
        }
      try {
        this.setState({progress: 50,
          progressDescription: "Sending Tokens..."});
          await this.state.buccFarm.methods.tokenSend(String(this.state.lookup), String(fullAmount), String(recipient)).send({from: this.state.accounts[0]});
          
          var returnTokenAmount = await this.state.buccFarm.methods.returnSpecifiedAddressTokens(String(this.state.lookup)).call({from: this.state.accounts[0]});
          var returnKeyUserTokens = await this.state.buccFarm.methods.returnKeyUserTokens(String(this.state.lookup)).call({from: this.state.accounts[0]});
          if (this.state.decimals > 0) {
            returnTokenAmount = (returnTokenAmount / Math.pow(10, Number(this.state.decimals))).toFixed(2);
            returnKeyUserTokens = (returnKeyUserTokens / Math.pow(10, Number(this.state.decimals))).toFixed(2);
          }
          this.setState({progress: 100,
            progressDescription: "Tokens successfully sent.",
            returnTokenAmount: "Contract: " + returnTokenAmount + " " + this.state.name,
            returnKeyUserTokens: "User: " + returnKeyUserTokens + " " + this.state.name,
            beginning: false
          });
          setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
      } catch (e) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Sending Tokens either rejected or failed. Please use a higher gas.",
        progressBar: false,
        beginning: false});
        setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
      }
  }

  tumbleTokens = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 5, 
      progressDescription: "Setting tokens",
      progressBar: true,
      beginning: true});
      var fullAmount = Number(this.state.tokens);
      if (this.state.decimals > 0) {
        fullAmount = fullAmount * Math.pow(10, Number(this.state.decimals));
        }
          const web3 = new Web3(window.ethereum);
          const approvalToken = await new web3.eth.Contract(abi, this.state.lookup);
          var checkAllowance = await approvalToken.methods.allowance(String(this.state.accounts[0]), String(contractAddress)).call({from: this.state.accounts[0]});
          if (checkAllowance < fullAmount) {
          try {
      this.setState({progress: 25,
        progressDescription: "Approving...",
        progressVisibility: true});
        await approvalToken.methods.approve(String(contractAddress), String(fullAmount)).send({from: this.state.accounts[0]});
      } catch (e) {
          this.setState({fadeOut: "fadeOut",
                progressDescription: "Approval either rejected or failed. Please use a higher gas.",
                progressVisibility: true, 
                progressBar: false,
                beginning: false});
                setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
        }
      } else {
        this.setState({progress: 50,
          progressDescription: "Working on sending tokens...",
          progressVisibility: true, 
          fadeOut: "fadeIn"});
        }
        
      try {
        this.setState({progress: 75,
          progressDescription: "Sending Tokens...",
          progressVisibility: true});
          await this.state.buccFarm.methods.preApproveTokens(String(this.state.lookup), String(fullAmount)).send({from: this.state.accounts[0]});
          var returnTokenAmount = await this.state.buccFarm.methods.returnSpecifiedAddressTokens(this.state.lookup).call({from: this.state.accounts[0]});
          var returnUserToken = await this.state.buccFarm.methods.returnUserTokens(this.state.lookup).call({from: this.state.accounts[0]});
          if (this.state.decimals > 0) {
            returnTokenAmount = (returnTokenAmount / Math.pow(10, Number(this.state.decimals))).toFixed(2);
            returnUserToken = (returnUserToken / Math.pow(10, Number(this.state.decimals))).toFixed(2);
          }
          this.setState({progress: 100,
            progressDescription: "Tokens successfully tumbled. Please switch to your key address to send.",
            progressVisibility: true, 
            returnTokenAmount: "Contract: " + returnTokenAmount + " " + this.state.name,
            returnUserToken: "User: " + returnUserToken,
            beginning: false});
            var returnTokenAmount = await this.state.buccFarm.methods.returnSpecifiedAddressTokens(this.state.lookup).call({from: this.state.accounts[0]});
            var returnUserToken = await this.state.buccFarm.methods.returnUserTokens(this.state.lookup).call({from: this.state.accounts[0]});
            if (this.state.decimals > 0) {
              returnTokenAmount = (returnTokenAmount / Math.pow(10, Number(this.state.decimals))).toFixed(2);
              returnUserToken = (returnUserToken / Math.pow(10, Number(this.state.decimals))).toFixed(2);
            }
            this.setState({returnTokenAmount: "Contract: " + returnTokenAmount + " " + this.state.name,
               returnUserToken: "User: " + returnUserToken});
            setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
      } catch (e) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Sending Tokens either rejected or failed. Please use a higher gas.",
        progressBar: false,
        beginning: false});
        setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
      }
  }


  lookupTokenAddress = async () => {
    var lookup = String(this.state.addressToSearch);
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 5, 
      progressDescription: "Currently Checking Address",
      progressBar: true,
      beginning: true});
      if (!ethereum_address.isAddress(lookup)) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Not a valid Ethereum address.",
        progressBar: false,
        beginning: false});
        setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
      }
    const getInfo = await new this.state.web3.eth.Contract(getInfoABI, getInfoAddr);
    this.setState({progressDescription: "Getting Details", progress: 15});
    try {
    var decimals = await getInfo.methods.decimals(lookup).call({from: this.state.accounts[0]});
    } catch (e) {
      this.setState({fadeOut: "fadeOut",
        progressDescription: "Not a token address, possibly a user address.",
        progressBar: false,
        beginning: false});
        setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
    }
    this.setState({progress: 25});
    var name = await getInfo.methods.name(lookup).call({from: this.state.accounts[0]});
    this.setState({progress: 45});
    var symbol = await getInfo.methods.symbol(lookup).call({from: this.state.accounts[0]});
    this.setState({progress: 70});
    var returnTokenAmount = await this.state.buccFarm.methods.returnSpecifiedAddressTokens(lookup).call({from: this.state.accounts[0]});
    
    if (this.state.isaKeyAddress) {
      var returnKeyUserTokens = await this.state.buccFarm.methods.returnKeyUserTokens(lookup).call({from: this.state.accounts[0]});
    } else {
      var returnUserToken = await this.state.buccFarm.methods.returnUserTokens(lookup).call({from: this.state.accounts[0]});
    }
      if (decimals > 0) {
        returnTokenAmount = (returnTokenAmount / Math.pow(10, Number(decimals))).toFixed(2);
        returnUserToken = (returnUserToken / Math.pow(10, Number(decimals))).toFixed(2);
        returnKeyUserTokens = (returnKeyUserTokens / Math.pow(10, Number(decimals))).toFixed(2);
      }
    this.setState({returnKeyUserTokens: "User: " + returnKeyUserTokens + " " + name,});
    this.setState({returnUserToken: "User: " + returnUserToken + " " + name,})
    this.setState({progressTumbling: 90});
    this.setState({getInfo, 
      decimalPlaces: "Token Decimals: " + decimals,
      decimals,
      name,
      nameTitle: "Token Name: " + name, 
      symbol: "Token Symbol: " + symbol, 
      returnTokenAmount: "Contract: " + returnTokenAmount + " " + name,
      findTokenReady: true,
      lookup,
      foundToken: true});
      this.setState({fadeOut: "fadeOut",
      progress: 100,
      progressDescription: "Now approve and send tokens for tumbling.",
      beginning: false});
      setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
  }

  keySendETH = async () => {
    var lookup = String(this.state.keyAddrETH);
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 5, 
      progressDescription: "Currently Checking Address",
      progressBar: true,
      beginning: true});
      if (!ethereum_address.isAddress(lookup)) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Not a valid Ethereum address.",
        progressBar: false,
        beginning: false});
        setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
      }
      this.setState({
      progress: 25, 
      progressDescription: "Currently Checking Whitelist"});
      var recipient = await this.state.buccV2Contract.methods.displayUserCount(lookup).call({from: this.state.accounts[0]});
      if (recipient == 0) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Use a third account to send 0 BUCC to your recipient address to whitelist them into the BUCC contract.",
        progressBar: false,
        beginning: false});
        setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
        }
      this.setState({
      progress: 50, 
      progressDescription: "Currently Sending ETH...",});
      var ETHamount = Number(this.state.ETHamount) * 1000000000000000000;
        try {
          await this.state.buccFarm.methods.ETHsend(String(ETHamount), recipient).send({from: this.state.accounts[0]});
          var ethinContract = await this.state.buccFarm.methods.returnTotalETH().call({from: this.state.accounts[0]});
          var returnKeyUserETH = await this.state.buccFarm.methods.returnKeyUserETH().call({from: this.state.accounts[0]});
          ethinContract = (ethinContract / 1000000000000000000).toFixed(2);
          returnKeyUserETH = (returnKeyUserETH / 1000000000000000000).toFixed(2);
          this.setState({fadeOut: "fadeOut", 
          ethinContract,
          returnKeyUserETH,
          progress: 100, 
          progressDescription: "ETH successfully sent...",
          beginning: false
          });
          setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
        } catch (e) {
          this.setState({fadeOut: "fadeOut",
              progressDescription: "ETH send either rejected or failed. Please use a higher gas.",
              progressBar: false,
              beginning: false});
              setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
        }
  }


  executeSendETH = async () => {
      this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 50, 
      progressDescription: "Currently Sending ETH...",
      progressBar: true,
      beginning: true});
    try {
      var ETHamount = Number(this.state.ETHamount) * 1000000000000000000;
      await this.state.web3.eth.sendTransaction({to: contractAddress, from: this.state.accounts[0], value: ETHamount});
      this.setState({
      progressDescription: "ETH successfully sent. Please switch to your key address to send your ETH.",
      progress: 100});
      var ethinContract = await this.state.buccFarm.methods.returnTotalETH().call({from: this.state.accounts[0]});
      var userETHinContract = await this.state.buccFarm.methods.returnUserETH().call({from: this.state.accounts[0]});
      ethinContract = (Number(ethinContract) / 1000000000000000000).toFixed(2);
      userETHinContract = (Number(userETHinContract) / 1000000000000000000).toFixed(2);
      this.setState({ethinContract, 
        userETHinContract, 
        ETHamount: "",
        beginning: false});
        setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
    } catch (e) {
              this.setState({fadeOut: "fadeOut",
              progressDescription: "ETH send either rejected or failed. Please use a higher gas.",
              progressBar: false,
              beginning: false});
              this.setState({subscribed: true, isNotSubscribed: false, haskey: true, hideMenus: false});
              setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
    }
  }


  shredKey = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 50, 
      progressDescription: "Shredding Key",
      progressBar: true,
      beginning: true});
      try {
          await this.state.buccFarm.methods.manualDeletion().send({from: this.state.accounts[0]});
      } catch (e) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Key shred either rejected or failed. Please use a higher gas.",
        progressBar: false});
        this.setState({subscribed: true, isNotSubscribed: false, haskey: true, hideMenus: false, beginning: false});
        setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
      }
      this.setState({
        haskey: false,
        progressDescription: "Succesfully shredded key.",
        progress: 100, 
        beginning: false});
        setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
  }

  addKey = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 5, 
      progressDescription: "Currently Checking Address",
      progressBar: true,
      beginning: true});
      if (!ethereum_address.isAddress(String(this.state.privateaddKey))) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Not a valid Ethereum address.",
        progressBar: false,
        beginning: false});
        setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
      }
      var userKey = await this.state.buccV2Contract.methods.displayUserCount(String(this.state.privateaddKey)).call({from: this.state.accounts[0]});
      if (userKey == 0) {
      this.setState({fadeOut: "fadeOut",
      progressDescription: "Use a third account to send 0 BUCC to your key address to whitelist them.",
      progressBar: false,
      beginning: false});
      setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
      }
      if (this.state.accounts[0] == String(this.state.privateaddKey)) {
        this.setState({fadeOut: "fadeOut",
      progressDescription: "You cannot set yourself as the key.",
      progressBar: false});
      }
      try {
        this.setState({progress: 50,
          progressDescription: "Adding key...",
          progressBar: true});
          await this.state.buccFarm.methods.addKey(String(userKey)).send({from: this.state.accounts[0]});
          var ethinContract = await this.state.buccFarm.methods.returnTotalETH().call({from: this.state.accounts[0]});
          var userETHinContract = await this.state.buccFarm.methods.returnUserETH().call({from: this.state.accounts[0]});
          ethinContract = (Number(ethinContract) / 1000000000000000000).toFixed(2);
          userETHinContract = (Number(userETHinContract) / 1000000000000000000).toFixed(2);
          var returnKeyforUser = await this.state.buccFarm.methods.returnKeyforUser().call({from: this.state.accounts[0]});
          this.setState({returnKeyforUser, subscribed: true, isNotSubscribed: false, hideMenus: false, haskey: true,
          progressDescription: "Succesfully added key.",
          progress: 100,
          ethinContract, 
          userETHinContract,
          beginning: false});
          setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
      } catch (e) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Key add either rejected or failed. Please use a higher gas.",
        progressBar: false,
        beginning: false});
        this.setState({subscribed: true, isNotSubscribed: false, hideMenus: false, haskey: false});
        setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
      }
  }

  subscribe = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 5, 
      progressDescription: "Currently Checking: Approval",
      progressBar: true,
      beginning: true});
    var approval = await this.state.buccV2Contract.methods.allowance(this.state.accounts[0], contractAddress).call({from: this.state.accounts[0]});
    if (approval < 1) {
      try {
        this.setState({progress: 15,
          progressDescription: "Approving...",
          progressBar: true});
        await this.state.buccV2Contract.methods.approve(contractAddress, "1000000000000").send({from: this.state.accounts[0]});
      } catch (e) {
        this.setState({fadeOut: "fadeOut",
              progressDescription: "Approval either rejected or failed. Please use a higher gas.",
              progressBar: false,
              beginning: false});
              setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
      }
    }
    try {
      this.setState({progress: 50,
      progressDescription: "Sending subscription fee...",
      progressBar: true,
      beginning: false});
      await this.state.buccFarm.methods.paySubscription().send({from: this.state.accounts[0]});
      this.setState({progress: 100,
      progressDescription: "Subscribed.",
      subscribed: true, isNotSubscribed: false, hideMenus: false});
      setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
    } catch (e) {
      this.setState({fadeOut: "fadeOut",
            progressDescription: "Subscription either rejected or failed. Please use a higher gas.",
            progressBar: false,
            beginning: false});
            setTimeout(() => {return !this.state.beginning ? (this.setState({progressVisibility: false})) : null;}, 10000);
    }
  }

  showETH = async () => {
    this.setState({showETH: true, showToken: false,
      showETHKey: true, showTokenKey: false});
  }

  showToken = async () => {
    this.setState({showETH: false, showToken: true,
      showETHKey: false, showTokenKey: true});
  }


  render () {
  return (
  <>
        <Suspense>
        { this.state.loader && (
            <React.Fragment>
            <div className={this.state.loaderCSS}>
            <Container>
            <Row>
            <Col>
            <div class="loader">
            <div class="inner one"></div>
            <div class="inner two"></div>
            <div class="inner three"></div>
            </div>
            </Col>
            </Row>
            <Row>
            <Col>
            <span className="loaderText loaderLight">Loading... {this.state.percentageLoader}</span>
            </Col>
            </Row>
            </Container>
            </div>
            </React.Fragment>
          )}
        </Suspense>

  <Navbar>
        <Navbar.Brand href="#home">
        <Container className="text-center">
          <Row>
            <Col>
            <a href="https://buccaneer.eth" target="_blank"><Button className="buttonFormat" theme={preset} variant='outline'>Homepage</Button></a>
            </Col>
            <Col>
            <a href="https://buccapi.eth" target="_blank"><Button className="buttonFormat" theme={preset} variant='outline'>Bermuda</Button></a>
            </Col>
            <Col>
            <a href="https://buccfarm.eth" target="_blank"><Button className="buttonFormat" theme={preset} variant='outline'>Sargasso</Button></a>
            </Col>
          </Row>
        </Container> 
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
          <a href="https://t.me/BuccaneerV2"><img src={telegram} className="shareButtonSpacing" /></a>
            <a href="https://twitter.com/BuccaneerV2"><img src={twitter} className="shareButtonSpacing" /></a>
          </Navbar.Text>
        </Navbar.Collapse>
        </Navbar>

        

  
        { !(this.state.subscribed) && !(this.state.isaKeyAddress) && (
        <Suspense>
        <Container className="text-center">
        <Row>
                  <Col md={3}>
                  </Col>
                  <Col md={6}>
                  <img src={Bucc} className="logo" />
                  <br />
                  <br />
                  </Col>
                  <Col md={3}>
                  </Col>
                </Row>

                <Row>
                  <Col md={2}>
                  </Col>
                  <Col>
                  <Suspense>
                      { this.state.progressVisibility && (
                      <React.Fragment>
                          <Modal.Title className={this.state.fadeOut}>{this.state.progressDescription}</Modal.Title>
                          { this.state.progressBar && (
                          <ProgressBar animated now={this.state.progress} />
                          )}
                          <br />
                          <br />
                      </React.Fragment>
                      )}
                    </Suspense>
                  </Col>
                  <Col md={2}>
                  </Col>
                </Row>
                <Row>
                  <Col md={2}>
                  </Col>
                  <Col>
                  <Button variant='outline' theme={preset} onClick={this.subscribe}>
                  Subscribe
                  </Button>
                  <br />
                  <br />
                  </Col>
                  <Col md={2}>
                  </Col>
                </Row>
                <Row>
                  <Col md={2}>
                  </Col>
                  <Col>
                  <Text className="text"
                        fontSize={[ 3 ]}>
                        You are not subscribed. It costs {this.state.subscriptionFee / 10000000000} BUCC token to subscribe for one month. Doing so will
                        allow you to tumble ETH and tokens during that time.
                  </Text>
                  </Col>
                  <Col md={2}>
                  </Col>
                </Row>
        </Container>
        </Suspense>
        )}



          {/* STEP 3. INPUT OF ETH/TOKENS FOR TUMBLING */}
          { (this.state.subscribed || this.state.isaKeyAddress) && (
            <React.Fragment>
              <Container className="text-center">
              <Row>
                  <Col>
                  </Col>
                  <Col md={6}>
                  <img src={Bucc} className="logo" />
                  <br />
                  </Col>
                  <Col>
                  </Col>
              </Row>

                <Row>
                  <Col>
                  </Col>
                  <Col md={6}>
                  <Text className="headerText"
                    fontSize={[ 3, 4, 5 ]}
                    fontWeight='bold'>
                    Havok
                  </Text>
                  <br />
                  </Col>
                  <Col>
                  </Col>
                </Row>

                <Row>
                <Col>
                    <Suspense>
                      { this.state.progressVisibility && (
                      <React.Fragment>
                          <Modal.Title className={this.state.fadeOut}>{this.state.progressDescription}</Modal.Title>
                          { this.state.progressBar && (
                          <ProgressBar animated now={this.state.progress} />
                          )}
                          <br />
                          <br />
                      </React.Fragment>
                      )}
                    </Suspense>
                  </Col>
                </Row>
                </Container>
                </React.Fragment>
                )}

                { this.state.haskey && !(this.state.isaKeyAddress) && (
                <Container className="text-center">
                <Row>
                  <Col>
                  {/* TUMBLING | SEPARATE CONTAINER ONE | **CONTAINS** 
                  KEY SHRED & VIEW BUTTONS | TABLE ONE OF ROW ONE */}
                          <Container className="text-center">
                          <Row>
                            <Col>
                            <Text className="text overflowKey" fontSize={[ 3 ]}>
                              Your Key is:
                            </Text>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                            <Text className="text overflowKey" fontSize={[ 3 ]}>
                              {this.state.returnKeyforUser}
                              </Text>
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col>
                            <Button variant='outline' className="buttonFormat" theme={preset} onClick={this.shredKey}>
                              Shred Key
                            </Button>
                            </Col>
                            {this.state.showToken && (
                            <Col>
                            <Button variant='outline' className="buttonFormat" theme={preset} onClick={this.showETH}>
                              ETH
                            </Button>
                            </Col>
                            )}
                            {this.state.showETH && (
                            <Col>
                            <Button variant='outline' className="buttonFormat" theme={preset} onClick={this.showToken}>
                            Tokens
                            </Button>
                            </Col>
                            )}
                          </Row>
                          </Container>
                          {/* END OF THE FIRST BUTTON PART*/}
                </Col>
                {/* TUMBLING | SEPARATE CONTAINER TWO |
                 **CONTAINS** | NON-KEY | DISPLAY ETH TUMBLING 
                 | INPUTTING TUMBLER VALUES | */}
                { this.state.subscribed && this.state.showETH && this.state.haskey && !(this.state.isaKeyAddress) && (
                  <>
                  <Col>
                    <Container className="text-center">
                      <Row>
                        <Col>
                            <Text className="text" fontSize={[ 2 ]}>
                              User ETH
                            </Text>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                            <Text className="text" fontSize={[ 2 ]}>
                              {this.state.userETHinContract}
                            </Text>
                        </Col>
                      </Row>
                      <br />
                      <Row>
                        <Col>
                            <Text className="text" fontSize={[ 2 ]}>
                              ETH in Contract
                            </Text>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                            <Text className="text" fontSize={[ 2 ]}>
                              {this.state.ethinContract}
                            </Text>
                        </Col>
                      </Row>
                    </Container>
                  </Col>
                  <Col>
                        <Container className="text-center">
                        <Row>
                            <Col>
                                <Text className="text" fontSize={[ 2 ]}>
                                    Send the amount of ETH you want to tumble to the contract.
                                </Text>
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col>
                                <Input className="input" value={this.state.ETHamount} onChange={this.amountofETH} />
                            </Col>
                          </Row>
                          <br />
                          <Row>
                            <Col>
                                <Button variant='outline' className="buttonFormat" theme={preset} onClick={this.executeSendETH}>
                                Send ETH
                                </Button>
                            </Col>
                          </Row>
                        </Container>
                  </Col>
                </>
                )}

          {/* SHOW TOKEN | 
          WHEN USER LOOKS UP TOKEN || AS KEY || OR USER */}
          { this.state.showToken && (
                  <>
                  
                  { !(this.state.findTokenReady) && (
                  <Col>
                      <Text className="text" fontSize={[ 2 ]}>
                      Enter a Token Address to lookup the token.
                      </Text>
                  
                  <br />
                  <Input className="input" onChange={this.addressToSearch} />
                  <br />
                  <Button variant='outline' className="buttonFormat" theme={preset} onClick={this.lookupTokenAddress}>
                  Lookup
                  </Button>
                  </Col>
                  )}
                  { this.state.foundToken && (
                  <>
                  <Col>
                  <Text className="text" fontSize={[ 3 ]}>
                    {this.state.returnTokenAmount}
                  </Text>
                  </Col>
                  <Col>
                  <Text className="text" fontSize={[ 3 ]}>
                    {this.state.returnUserToken}
                  </Text>
                  </Col>
                  </>
                  )}    
                  <Col>
                  { this.state.findTokenReady && (
                    <React.Fragment>
                      <Text className="text" fontSize={[ 2 ]}>
                          Send {this.state.name} tokens.
                      </Text>
                      <Input className="input" onChange={this.tokensToSend} />
                      <br />
                      <Button variant='outline' className="buttonFormat" theme={preset} onClick={this.tumbleTokens}>
                      Send {this.state.name}
                      </Button>
                    </React.Fragment>
                  )}
                  </Col>
                  </>
          )}
                </Row>
              </Container>
          )}

{ this.state.subscribed && !(this.state.haskey) && !(this.state.isaKeyAddress) && (
        <React.Fragment>
          <Container className="text-center">
            <Row>
                <Col md={2}>
                </Col>
                <Col>
                <Text className="text" fontSize={[ 3 ]}>
                        You are subscribed. 
                        <br />
                        Add your key address.
                </Text>
                <br />
                </Col>
                <Col md={2}>
                </Col>
            </Row>

            <Row>
                <Col md={2}>
                </Col>
                <Col>
                <Input className="input" onChange={this.privateaddKey} />
                <br />
                <br />
                </Col>
                <Col md={2}>
                </Col>
            </Row>

            <Row>
                <Col md={2}>
                </Col>
                <Col>
                <Button className="buttonFormat mainInterfaceButtons" variant='outline' theme={preset} onClick={this.addKey}>
                  Add Key
                </Button>
                </Col>
                <Col md={2}>
                </Col>
            </Row>
          </Container>
          </React.Fragment>
        )}

        
            {/* TABLE 3 | KEY ADDRESS | 
            DISPLAY KEY ETH OR KEY TOKENS */}
            { this.state.isaKeyAddress && (
            <React.Fragment>
            <Container className="text-center">
              <Row>
                  {this.state.showTokenKey && (
                  <>
                  <Col>
                  <Button variant='outline' className="buttonFormat" theme={preset} onClick={this.showETH}>
                    ETH
                  </Button>
                  </Col>

                  { !(this.state.foundToken) && (
                  <Col>
                  <Text className="text" fontSize={[ 2 ]}>
                      Input token address to search.
                  </Text>
                  <Input className="input" onChange={this.addressToSearch} />
                  <br />
                  <Button variant='outline' className="buttonFormat" theme={preset} onClick={this.lookupTokenAddress}>
                  Lookup
                  </Button>
                  </Col>
                  )}

                  { this.state.foundToken && (
                  <>
                  <Col>
                  <Text className="text" fontSize={[ 3 ]}>
                    {this.state.returnTokenAmount}
                  </Text>
                  </Col>
                  <Col>
                  <Text className="text" fontSize={[ 3 ]}>
                    {this.state.returnKeyUserTokens}
                  </Text>
                  </Col>
                  </>
                  )}
                  
                  { this.state.findTokenReady && (
                    <Col>
                    <React.Fragment>
                      <Text className="text" fontSize={[ 2 ]}>
                          Send {this.state.name} tokens.
                      </Text>
                      <Input className="input" placeholder="Input Address to Send To" onChange={this.addresstoSendETH} />
                      <br />
                      <Input className="input" placeholder="Input Number of Tokens" onChange={this.tokensToSend} />
                      <br />
                      <Button variant='outline' className="buttonFormat" theme={preset} onClick={this.keySendTokens}>
                      Send {this.state.name}
                      </Button>
                    </React.Fragment>
                    </Col>
                  )}
                  </>
                  )}

                  {this.state.showETHKey && (
                  <>
                  <Col>
                  <Text className="text" fontSize={[ 3 ]}>
                  {this.state.ethinContract} ETH in Contract
                  <br />
                  {this.state.returnKeyUserETH} User ETH
                  </Text>
                  <br />
                  <Button variant='outline' className="buttonFormat" theme={preset} onClick={this.showToken}>
                  Tokens
                  </Button>
                  </Col>
                  <Col>
                  <Input className="input" placeholder="ETH" onChange={this.amountofETH} />
                  <br />
                  <Input className="input" placeholder="Address" onChange={this.addresstoSendETH} />
                  </Col>
                  <Col>
                  <Text className="text" fontSize={[ 2 ]}>
                    Input the address you want to send to and the amount of ETH.
                  </Text>
                  <br />
                  <Button variant='outline' className="buttonFormat" theme={preset} onClick={this.keySendETH}>
                  Send ETH
                  </Button>
                  </Col>
                  </>
                )}
              </Row>
              </Container>
              </React.Fragment>
            )}
            {/* ENDE__ STEP 3 */}



        {/* After an address has already been searched for */}
        { (this.state.foundToken) && (this.state.haskey) && (
          <Container className="text-center">
          <br />
          <br />
          <Row md={3}></Row>
          <Row className="text-center">
          <Col>
          <br />
          <Text className="text" fontSize={[ 2 ]}>
          {this.state.nameTitle}
          <br />
          {this.state.symbol}
          <br />
          {this.state.decimalPlaces}
          </Text>
          <br />
          </Col>
          </Row>
          <Row>
          <Col>
          <Text className="text" fontSize={[ 2 ]}>
              Search another Token Address to lookup a token.
          </Text>
          
          <br />
          <Input className="input" onChange={this.addressToSearch} />
          <br />
          <Button variant='outline' className="buttonFormat" theme={preset} onClick={this.lookupTokenAddress}>
          Lookup
          </Button>
          </Col>
          </Row>
          <Row md={3}></Row>
          </Container>
          )}


                      <Container>
                      <Row>
                      <Col md={1}>
                      </Col>
                      <Col md={10}>  
                      <Card variant="dark" bg="blackbg" className="text-center lastCard">
                      <Card.Body className="adjustCardBody">
                      <Text
                          className="text"
                          fontSize={[ 5 ]}
                          fontWeight='bold'>
                          Havok
                        </Text>
                                <hr className="whiteHRLINE" />
                                <Text
                                  fontSize={[ 2 ]}
                                  color='primary'
                                  className="text">
                                Havok is the world's premiere privacy tumbler for Ethereum. It allows the tumbling of both Ethereum and 
                                all ERC20 standard tokens to any address and even directly to exchanges. It uses BUCC's sophisticated 
                                privacy engine for titanium proof security and ability to crack traces. It is both significantly cheaper, 
                                faster and more secure than any other standard tumbler for Ethereum today. However, tumbling indeed is the 
                                weakest form of security, therefore you must make several precautions. Never withdraw the same amount you 
                                deposited, rather one should withdraw in amounts. Second, do not withdraw if you are the only asset holder 
                                as it would be easy to recognize the withdrawing wallet. Third, if you are the largest depositor of any 
                                asset, take care to withdraw no more than the next largest depositor. Meaning, if someone deposits five tokens 
                                and put in 10, don't take out six or seven, take out an amount like three.
                                <br /><br />
                                To use the tumbler is really quite simple. First you must subscribe and to do so, you must approve and deposit 
                                one BUCC token. This BUCC token is a fee and is billed (non-recurring) as a subscription and allows one month 
                                (or 30 days) of access to the tumbler to deposit funds. All fees go directly to the BUCC farm, Sargasso. Next, 
                                must add a key, which is just another address that has been whitelisted, meaning sent any amount of BUCC before 
                                (even zero). Do not send zero BUCC directly to the key address, you cannot have any direct traces or contact with 
                                it. Once your key address is added, you can freely send your asset of ERC20 token or Ethereum from your key address, 
                                to any address which has been whitelisted into the BUCC contract. You should observe deposits into the contract and 
                                if the depositing activity is busy, feel free to withdraw at any time. The BUCC tumbler contract has been verified 
                                <a href="https://etherscan.io/address/0x0ffaa8eeb2ee18c9174e4c5d6af6ce48199c6879#code" target="_blank">here</a>.
                                </Text>
                                <hr className="whiteHRLINE" />
                              </Card.Body>
                      </Card>
                      </Col>
                      <Col md={1}>
                      </Col>
                    </Row>
                    </Container>

</>
  );
}
}

