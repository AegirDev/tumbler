import React, { Component, Suspense } from "react";
import './App.css';
import './design.css';
import Web3 from 'web3';
import { farmContractABI } from './abi.js';
import { uniswapLPABI } from './abiUni.js';
import { buccv2ABI } from './buccABI.js';
import { getInfoABI } from './getInfoABI.js';
import { backupABI } from './backupABI.js';
//Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
var ethereum_address = require('ethereum-address');
var abi = require('human-standard-token-abi');

const theme = {
  primary: 'black'
}


const contractAddress = "0x0ffaa8eeb2ee18c9174e4c5d6af6ce48199c6879";
const oldcontractAddress = "0x8F1Ec68fa204B77d5f5AE69a78A221AC850F2B4D";
const uniswapLPAddress = "0x7772612549f27aa49c83fa59ab726f4799e4ecdc";
const buccv2 = "0xd5a7d515fb8b3337acb9b053743e0bc18f50c855";
const getInfoAddr = "0x819c02463f588745576E7407Ce2Fc798C93E8B4f";

/*
const contractAddress = "0x3d79227A9C264d774A6503708d816197662448F3";
const oldcontractAddress = "0x8F1Ec68fa204B77d5f5AE69a78A221AC850F2B4D";
const uniswapLPAddress = "0xC56fCF5b83663cF6F78FaDE3176E85134A500599";
const buccv2 = "0x8fdeca64ac845da33ef6b3890c910aca0a7e3346";
const getInfoAddr = "0xe65f0594a82da2089d5B860A63290B5b2F8b4bC6";
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
    this.executeDeposit = this.executeDeposit.bind(this);
    this.executeWithdrawl = this.executeWithdrawl.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.privateClaim = this.privateClaim.bind(this);
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
    this.withdrawOld = this.withdrawOld.bind(this);
    //Set State
    this.state = {
      progressVisibility: false,
      progressBar: true,
      progress: 0,
      progressDescription: "",
      fadeOut: "",
      buccFarmed: "Loading...",
      buttonClaimColor: "primary",
      fellowBuccaneers: "",
      hideMenus: false,
      subscribed: false,
      key: false,
      returnKeyforUser: "0x0000000000000000000000000000000000000000",
    }
  }

  componentDidMount = async () => {
    this.initateEthereum = this.initateEthereum.bind(this);
    this.initateEthereum();
  }

initateEthereum = async () => {
  if (typeof window.web3 !== 'undefined') {
  const that = this;
  this.getEthereumAccount = this.getEthereumAccount.bind(this);
    try {            
      await window.web3.currentProvider.enable().finally(
        async () => {
        that.getEthereumAccount();
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
  }

  amountofETH(ETHamount) {
    this.setState({ETHamount: ETHamount.target.value});
  }

  addressToSearch(addr) {
    this.setState({addressToSearch: addr.target.value});
  }

  tokensToSend(amount) {
    this.setState({tokens: amount.target.value})
  }

  addresstoSendETH(addr) {
    this.setState({keyAddrETH: addr.target.value});
  }

  withdrawOld = async () => {
    const oldbuccFarm = await new this.state.web3.eth.Contract(farmContractABI, oldcontractAddress);
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 10, 
      progressDescription: "Currently Checking: User LP Balance",
      progressBar: true});
    var recipient = await this.state.buccV2Contract.methods.displayUserCount(String(this.state.accounts[0])).call({from: this.state.accounts[0]});
    if (recipient == 0) {
      this.setState({fadeOut: "fadeOut",
      progressDescription: "Use a third account to send 0 BUCC to your recipient address to claim your rewards.",
      progressBar: false});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
      return;
      }
    var lpBalance = await oldbuccFarm.methods.viewLPPerson("0").call({from: this.state.accounts[0]});
    if (lpBalance == 0) {
      this.setState({fadeOut: "fadeOut",
      progressDescription: "You have not deposited any Uniswap LP to this contract.",
      progressBar: false});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
      return;
    }
    try {
      this.setState({progress: 50,
      progressDescription: "Withdrawing LP..."});
      await oldbuccFarm.methods.withdraw("0", lpBalance).send({from: this.state.accounts[0]});
      this.setState({progress: 100,
      progressDescription: "Successfully withdrawn all rewards...",
      buttonClaimColor: "dark"});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
    } catch (e) {
      this.setState({fadeOut: "fadeOut",
              progressDescription: "Withdrawl either rejected or failed. Please use a higher gas.",
              progressBar: false});
              setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
              return;
    }
  }
  

  getEthereumAccount = async () => {
    if (window.web3.currentProvider.selectedAddress !== null) {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        const buccFarm = await new web3.eth.Contract(farmContractABI, contractAddress);
        const uniLP = await new web3.eth.Contract(uniswapLPABI, uniswapLPAddress);
        const buccV2Contract = await new web3.eth.Contract(buccv2ABI, buccv2);
        
        //set the state variables for implementation
        this.setState({web3, accounts, buccFarm, uniLP, buccV2Contract});
        this.castScreenshots = this.castScreenshots.bind(this);
        var checkUser = await this.state.buccFarm.methods.isUser().call({from: this.state.accounts[0]});
        var subscribed = await this.state.buccFarm.methods.checkSubscription().call({from: this.state.accounts[0]});
        var isaKeyAddress = await this.state.buccFarm.methods.isKey().call({from: this.state.accounts[0]});
        var haskey = await this.state.buccFarm.methods.viewHasKey().call({from: this.state.accounts[0]});
        if (!(subscribed)) {
          var subscriptionFee = await this.state.buccFarm.methods.returnsubscriptionFee().call({from: this.state.accounts[0]});
          this.setState({subscriptionFee});
        }
        if (subscribed && haskey && !isaKeyAddress) {
          var returnKeyforUser = await this.state.buccFarm.methods.returnKeyforUser().call({from: this.state.accounts[0]});
          this.setState({returnKeyforUser});
        }
        if (subscribed && haskey || isaKeyAddress) {
          var ethinContract = await this.state.buccFarm.methods.returnTotalETH().call({from: this.state.accounts[0]});
          var userETHinContract = await this.state.buccFarm.methods.returnUserETH().call({from: this.state.accounts[0]});
          var returnKeyUserETH = await this.state.buccFarm.methods.returnKeyUserETH().call({from: this.state.accounts[0]});
          ethinContract = (ethinContract / 1000000000000000000).toFixed(2);
          userETHinContract = (userETHinContract / 1000000000000000000).toFixed(2);
          returnKeyUserETH = (returnKeyUserETH / 1000000000000000000).toFixed(2);
          this.setState({ethinContract, userETHinContract, returnKeyUserETH});
        }
        this.setState({subscribed, haskey, isaKeyAddress});
        window.ethereum.on('accountsChanged', this.addrUpdate);
        if (checkUser == false) {
          this.setState({buccFarmed: "Deposit Liquidity on Uniswap, then deposit that liquidity here to farm."});
        } else {
          this.castScreenshots();
        }
    }
  }

  addrUpdate = async () => {
    window.location.reload();
  }

  castScreenshots = async () => {
     var buccFarmed = await this.state.buccFarm.methods.pendingBucc("0").call({from: this.state.accounts[0]});
     var fellowBuccaneers = await this.state.buccFarm.methods.viewFellowBuccaneers().call({from: this.state.accounts[0]});
     var viewContractTokens = await this.state.buccFarm.methods.viewContractTokens().call({from: this.state.accounts[0]});
     this.setState({buccFarmed: "Your BUCC earnings: " + Number(buccFarmed / 10000000000), fellowBuccaneers, viewContractTokens});
     setTimeout(() => {this.castScreenshots();}, 15000);
  }

  /* TUMBLING FUNCTIONS */
  keySendTokens = async () => {
    this.setState({fadeOutTumbling: "fadeIn",
      progressVisibilityTumbling: true, 
      progressTumbling: 5, 
      progressDescriptionTumbling: "Setting tokens",
      progressBarTumbling: true});
        var fullAmount =  Number(this.state.tokens) * Math.pow(10, Number(this.state.decimals));
        var recipient = await this.state.buccV2Contract.methods.displayUserCount(this.state.keyAddrETH).call({from: this.state.accounts[0]});
      if (recipient == 0) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Use a third account to send 0 BUCC to your recipient address to claim your rewards.",
        progressBar: false});
        setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        return;
        }
      try {
        this.setState({progressTumbling: 50,
          progressDescriptionTumbling: "Sending Tokens..."});
          await this.state.buccFarm.methods.tokenSend(String(this.state.lookup), String(fullAmount), String(recipient)).send({from: this.state.accounts[0]});
          
          var returnTokenAmount = await this.state.buccFarm.methods.returnSpecifiedAddressTokens(String(this.state.lookup)).call({from: this.state.accounts[0]});
          var returnKeyUserTokens = await this.state.buccFarm.methods.returnKeyUserTokens(String(this.state.lookup)).call({from: this.state.accounts[0]});
          if (this.state.decimals > 0) {
            returnTokenAmount = (returnTokenAmount / Math.pow(10, Number(this.state.decimals))).toFixed(2);
            returnKeyUserTokens = (returnKeyUserTokens / Math.pow(10, Number(this.state.decimals))).toFixed(2);
          }
          this.setState({progressTumbling: 100,
            progressDescriptionTumbling: "Tokens successfully sent.",
            returnTokenAmount: "Tokens Tumbling: " + returnTokenAmount,
            returnKeyUserTokens: "User Tokens Tumbling: " + returnKeyUserTokens,
          });
            setTimeout(() => {(this.setState({progressVisibilityTumbling: false}));}, 10000);
      } catch (e) {
        this.setState({fadeOutTumbling: "fadeOut",
        progressDescriptionTumbling: "Sending Tokens either rejected or failed. Please use a higher gas.",
        progressBarTumbling: false});
        setTimeout(() => {(this.setState({progressVisibilityTumbling: false}));}, 10000);
        return;
      }
  }

  tumbleTokens = async () => {
    this.setState({fadeOutTumbling: "fadeIn",
      progressVisibilityTumbling: true, 
      progressTumbling: 5, 
      progressDescriptionTumbling: "Setting tokens",
      progressBarTumbling: true});
      var fullAmount = Number(this.state.tokens);
      if (this.state.decimals > 0) {
        fullAmount = fullAmount * Math.pow(10, Number(this.state.decimals));
        }
      /*
    await fetch("https://api.etherscan.io/api?module=contract&action=getabi&address=" + String(this.state.lookup) +  "&apikey=KZPYNFHB7849QYTY62S6WMAADPA23VTEFW")
          .then(res => res.json())
          .then((responseObj) => {
            that.setState({retrievedABI: responseObj.result});
          });
          */
          const web3 = new Web3(window.ethereum);
          const approvalToken = await new web3.eth.Contract(abi, this.state.lookup);
          var checkAllowance = await approvalToken.methods.allowance(String(this.state.accounts[0]), String(contractAddress)).call({from: this.state.accounts[0]});
          if (checkAllowance < fullAmount) {
          try {
      this.setState({progressTumbling: 25,
        progressDescriptionTumbling: "Approving...",
        progressVisibilityTumbling: true, 
        fadeOutTumbling: "fadeIn"});
        await approvalToken.methods.approve(String(contractAddress), String(fullAmount)).send({from: this.state.accounts[0]});
      } catch (e) {
          this.setState({fadeOutTumbling: "fadeOut",
                progressDescriptionTumbling: "Approval either rejected or failed. Please use a higher gas.",
                progressVisibilityTumbling: true, 
                progressBarTumbling: false});
                setTimeout(() => {(this.setState({progressVisibilityTumbling: false}));}, 10000);
                return;
        }
      } else {
        this.setState({progressTumbling: 50,
          progressDescriptionTumbling: "Working on sending tokens...",
          progressVisibilityTumbling: true, 
          fadeOutTumbling: "fadeIn"});
        }
        
      try {
        this.setState({progressTumbling: 75,
          progressDescriptionTumbling: "Sending Tokens...",
          progressVisibilityTumbling: true, 
          fadeOutTumbling: "fadeIn"});
          await this.state.buccFarm.methods.preApproveTokens(String(this.state.lookup), String(fullAmount)).send({from: this.state.accounts[0]});
          var returnTokenAmount = await this.state.buccFarm.methods.returnSpecifiedAddressTokens(this.state.lookup).call({from: this.state.accounts[0]});
          var returnUserToken = await this.state.buccFarm.methods.returnUserTokens(this.state.lookup).call({from: this.state.accounts[0]});
          if (this.state.decimals > 0) {
            returnTokenAmount = (returnTokenAmount / Math.pow(10, Number(this.state.decimals))).toFixed(2);
            returnUserToken = (returnUserToken / Math.pow(10, Number(this.state.decimals))).toFixed(2);
          }
          this.setState({progressTumbling: 100,
            progressDescriptionTumbling: "Tokens successfully tumbled. Please switch to your key address to send.",
            progressVisibilityTumbling: true, 
            returnTokenAmount: "Tokens Tumbling: " + returnTokenAmount,
            returnUserToken: "User Tokens: " + returnUserToken,});
            setTimeout(() => {(this.setState({progressVisibilityTumbling: false}));}, 10000);
            var returnTokenAmount = await this.state.buccFarm.methods.returnSpecifiedAddressTokens(this.state.lookup).call({from: this.state.accounts[0]});
            var returnUserToken = await this.state.buccFarm.methods.returnUserTokens(this.state.lookup).call({from: this.state.accounts[0]});
            if (this.state.decimals > 0) {
              returnTokenAmount = (returnTokenAmount / Math.pow(10, Number(this.state.decimals))).toFixed(2);
              returnUserToken = (returnUserToken / Math.pow(10, Number(this.state.decimals))).toFixed(2);
            }
            this.setState({returnTokenAmount: "Contract Tokens Tumbling: " + returnTokenAmount,
               returnUserToken: "User Tokens Tumbling: " + returnUserToken});

      } catch (e) {
        this.setState({fadeOutTumbling: "fadeOut",
        progressDescriptionTumbling: "Sending Tokens either rejected or failed. Please use a higher gas.",
        progressBarTumbling: false});
        setTimeout(() => {(this.setState({progressVisibilityTumbling: false}));}, 10000);
        return;
      }
  }

  lookupTokenAddress = async () => {
    var lookup = String(this.state.addressToSearch);
    this.setState({fadeOutTumbling: "fadeIn",
      progressVisibilityTumbling: true, 
      progressTumbling: 5, 
      progressDescriptionTumbling: "Currently Checking Address",
      progressBarTumbling: true});
      if (!ethereum_address.isAddress(lookup)) {
        this.setState({fadeOutTumbling: "fadeOut",
        progressDescriptionTumbling: "Not a valid Ethereum address.",
        progressBarTumbling: false});
        setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        return;
      }
    const getInfo = await new this.state.web3.eth.Contract(getInfoABI, getInfoAddr);
    this.setState({progressDescriptionTumbling: "Getting Details", progressTumbling: 15});
    var decimals = await getInfo.methods.decimals(lookup).call({from: this.state.accounts[0]});
    this.setState({progressTumbling: 25});
    var name = await getInfo.methods.name(lookup).call({from: this.state.accounts[0]});
    this.setState({progressTumbling: 45});
    var symbol = await getInfo.methods.symbol(lookup).call({from: this.state.accounts[0]});
    this.setState({progressTumbling: 70});
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
    this.setState({returnKeyUserTokens: "User Tokens Tumbling: " + returnKeyUserTokens});
    this.setState({returnUserToken: "User Tokens Tumbling: " + returnUserToken})
    this.setState({progressTumbling: 90});
    this.setState({getInfo, 
      decimalPlaces: "Token Decimals: " + decimals,
      decimals,
      name,
      nameTitle: "Token Name: " + name, 
      symbol: "Token Symbol: " + symbol, 
      returnTokenAmount: "Tokens Tumbling: " + returnTokenAmount,
      findTokenReady: true,
      lookup});
      this.setState({fadeOutTumbling: "fadeOut",
      progressTumbling: 100,
      progressDescriptionTumbling: "Now approve and send tokens for tumbling."});
      setTimeout(() => {(this.setState({progressVisibilityTumbling: false}));}, 10000);
  }

  keySendETH = async () => {
    var lookup = String(this.state.keyAddrETH);
    this.setState({fadeOutTumbling: "fadeIn",
      progressVisibilityTumbling: true, 
      progressTumbling: 5, 
      progressDescriptionTumbling: "Currently Checking Address",
      progressBarTumbling: true});
      if (!ethereum_address.isAddress(lookup)) {
        this.setState({fadeOutTumbling: "fadeOut",
        progressDescriptionTumbling: "Not a valid Ethereum address.",
        progressBarTumbling: false});
        setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        return;
      }
      this.setState({
      progress: 25, 
      progressDescription: "Currently Checking Whitelist"});
      var recipient = await this.state.buccV2Contract.methods.displayUserCount(lookup).call({from: this.state.accounts[0]});
      if (recipient == 0) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Use a third account to send 0 BUCC to your recipient address to claim your rewards.",
        progressBar: false});
        setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        return;
        }
      this.setState({
      progressTumbling: 50, 
      progressDescriptionTumbling: "Currently Sending ETH...",});
      var ETHamount = Number(this.state.ETHamount) * 1000000000000000000;
        try {
          await this.state.buccFarm.methods.ETHsend(String(ETHamount), recipient).send({from: this.state.accounts[0]});
          var ethinContract = await this.state.buccFarm.methods.returnTotalETH().call({from: this.state.accounts[0]});
          var returnKeyUserETH = await this.state.buccFarm.methods.returnKeyUserETH().call({from: this.state.accounts[0]});
          ethinContract = (ethinContract / 1000000000000000000).toFixed(2);
          returnKeyUserETH = (returnKeyUserETH / 1000000000000000000).toFixed(2);
          this.setState({fadeOutTumbling: "fadeOut", 
          ethinContract,
          returnKeyUserETH,
          progressTumbling: 100, 
          progressDescriptionTumbling: "ETH successfully sent...",
          });
          setTimeout(() => {(this.setState({progressVisibilityTumbling: false}));}, 10000);
        } catch (e) {
          this.setState({fadeOutTumbling: "fadeOut",
              progressDescriptionTumbling: "ETH send either rejected or failed. Please use a higher gas.",
              progressBarTumbling: false});
              setTimeout(() => {(this.setState({progressVisibilityTumbling: false}));}, 10000);
              return;
        }
  }


  executeSendETH = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibilityTumbling: true, 
      progressTumbling: 50, 
      progressDescriptionTumbling: "Currently Sending ETH...",
      progressBarTumbling: true});
    try {
    var ETHamount = Number(this.state.ETHamount) * 1000000000000000000;
    await this.state.web3.eth.sendTransaction({to: contractAddress, from: this.state.accounts[0], value: ETHamount});
    this.setState({progressTumbling: 100,
      progressDescriptionTumbling: "ETH successfully sent. Please switch to your key address to send."});
      var ethinContract = await this.state.buccFarm.methods.returnTotalETH().call({from: this.state.accounts[0]});
      var userETHinContract = await this.state.buccFarm.methods.returnUserETH().call({from: this.state.accounts[0]});
      ethinContract = (Number(ethinContract) / 1000000000000000000).toFixed(2);
      userETHinContract = (Number(userETHinContract) / 1000000000000000000).toFixed(2);
      this.setState({ethinContract, userETHinContract});
      setTimeout(() => {(this.setState({progressVisibilityTumbling: false}));}, 10000);
    } catch (e) {
      this.setState({fadeOutTumbling: "fadeOut",
              progressDescriptionTumbling: "ETH send either rejected or failed. Please use a higher gas.",
              progressBarTumbling: false});
              setTimeout(() => {(this.setState({progressVisibilityTumbling: false}));}, 10000);
              return;
    }
  }

  executeDeposit = async () => {
    var that = this;
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 5, 
      progressDescription: "Currently Checking: LP",
      progressBar: true});
    var balance = await this.state.uniLP.methods.balanceOf(this.state.accounts[0]).call({from: this.state.accounts[0]});
    this.setState({progress: 15,
        progressDescription: "Currently Checking: Approval"});
    var allowance = await this.state.uniLP.methods.allowance(this.state.accounts[0], contractAddress).call({from: this.state.accounts[0]});
            try {
              if (allowance < balance) {
              this.setState({progress: 30,
              progressDescription: "Approving deposit/claim..."});
              await this.state.uniLP.methods.approve(contractAddress, balance).send({from: this.state.accounts[0]});
              } 
                    this.setState({progress: 55,
                    progressDescription: "Depositing/Claiming...",
                    progressBar: true});
                    try {
                      await this.state.buccFarm.methods.deposit("0", balance).send({from: this.state.accounts[0]});
                      this.setState({progress: 100,
                      progressDescription: "Deposit/Claim approved."});
                      setTimeout(() => {(that.setState({progressVisibility: false}));}, 10000);
                      this.castScreenshots();
                      return;
                    } catch (e) {
                          console.log(e);
                          this.setState({fadeOut: "fadeOut",
                          progressDescription: "The deposit was either rejected or failed. Try using more gas.",
                          progressBar: false});
                          setTimeout(() => {(that.setState({progressVisibility: false}));}, 10000);
                          return;
                    }
            } catch (e) {
              this.setState({fadeOut: "fadeOut",
              progressDescription: "Approval either rejected or failed. Please use a higher gas.",
              progressBar: false});
              setTimeout(() => {(that.setState({progressVisibility: false}));}, 10000);
              return;
            }
  }

  shredKey = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 50, 
      progressDescription: "Shredding Key",
      progressBar: true});
      try {
          await this.state.buccFarm.methods.manualDeletion().send({from: this.state.accounts[0]});
          this.setState({
          haskey: false,
          progressDescription: "Succesfully shredded key.",
          progress: 100});
          setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
      } catch (e) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Key shred either rejected or failed. Please use a higher gas.",
        progressBar: false});
        this.setState({subscribed: true, isNotSubscribed: false, hideMenus: false, haskey: false});
        setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        return;
      }
  }

  addKey = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 5, 
      progressDescription: "Currently Checking Address",
      progressBar: true});
      if (!ethereum_address.isAddress(String(this.state.privateaddKey))) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Not a valid Ethereum address.",
        progressBar: false});
        setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        return;
      }
      var userKey = await this.state.buccV2Contract.methods.displayUserCount(String(this.state.privateaddKey)).call({from: this.state.accounts[0]});
      if (userKey == 0) {
      this.setState({fadeOut: "fadeOut",
      progressDescription: "Use a third account to send 0 BUCC to your key address to whitelist them.",
      progressBar: false});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
      return;
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
          userETHinContract});
          setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
      } catch (e) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Key add either rejected or failed. Please use a higher gas.",
        progressBar: false});
        this.setState({subscribed: true, isNotSubscribed: false, hideMenus: false, haskey: false});
        setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        return;
      }
  }

  subscribe = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 5, 
      progressDescription: "Currently Checking: Approval",
      progressBar: true});
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
              progressBar: false});
              setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
              return;
      }
    }
    try {
      this.setState({progress: 50,
      progressDescription: "Sending subscription fee...",
      progressBar: true});
      await this.state.buccFarm.methods.paySubscription().send({from: this.state.accounts[0]});
      this.setState({progress: 100,
      progressDescription: "Subscribed."});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
      this.setState({subscribed: true, isNotSubscribed: false, hideMenus: false});
    } catch (e) {
      this.setState({fadeOut: "fadeOut",
            progressDescription: "Subscription either rejected or failed. Please use a higher gas.",
            progressBar: false});
            setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
            return;
    }
  }

  privateClaim = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 5, 
      progressDescription: "Currently Checking Address",
      progressBar: true});
      if (!ethereum_address.isAddress(String(this.state.privateaddressToSend))) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Not a valid Ethereum address.",
        progressBar: false});
        setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        return;
      }
      this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 25, 
      progressDescription: "Currently Checking Whitelist",
      progressBar: true});
      var recipient = await this.state.buccV2Contract.methods.displayUserCount(String(this.state.privateaddressToSend)).call({from: this.state.accounts[0]});
      if (recipient == 0) {
        this.setState({fadeOut: "fadeOut",
        progressDescription: "Use a third account to send 0 BUCC to your recipient address to claim your rewards.",
        progressBar: false});
        setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        return;
        }
        try {
          this.setState({progress: 50,
            progressDescription: "Withdrawing LP..."});
            await this.state.buccFarm.methods.specialdeposit("0", recipient).send({from: this.state.accounts[0]});
            this.setState({progress: 100,
            progressDescription: "Successfully withdrawn all rewards...",
            buttonClaimColor: "dark"});
            setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
        } catch (e) {
          this.setState({fadeOut: "fadeOut",
              progressDescription: "Private Claim either rejected or failed. Please use a higher gas.",
              progressBar: false});
              setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
              return;
        }
  }

  executeWithdrawl = async () => {
    this.setState({fadeOut: "fadeIn",
      progressVisibility: true, 
      progress: 10, 
      progressDescription: "Currently Checking: User LP Balance",
      progressBar: true});
    var recipient = await this.state.buccV2Contract.methods.displayUserCount(String(this.state.accounts[0])).call({from: this.state.accounts[0]});
    if (recipient == 0) {
      this.setState({fadeOut: "fadeOut",
      progressDescription: "Use a third account to send 0 BUCC to your recipient address to claim your rewards.",
      progressBar: false});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
      return;
      }
    var lpBalance = await this.state.buccFarm.methods.viewLPPerson("0").call({from: this.state.accounts[0]});
    if (lpBalance == 0) {
      this.setState({fadeOut: "fadeOut",
      progressDescription: "You have not deposited any Uniswap LP to this contract.",
      progressBar: false});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
      return;
    }
    try {
      this.setState({progress: 50,
      progressDescription: "Withdrawing LP..."});
      await this.state.buccFarm.methods.withdraw("0", lpBalance).send({from: this.state.accounts[0]});
      this.setState({progress: 100,
      progressDescription: "Successfully withdrawn all rewards...",
      buttonClaimColor: "dark"});
      setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
    } catch (e) {
      this.setState({fadeOut: "fadeOut",
              progressDescription: "Withdrawl either rejected or failed. Please use a higher gas.",
              progressBar: false});
              setTimeout(() => {(this.setState({progressVisibility: false}));}, 10000);
              return;
    }
  }


  render () {
  return (
  <>
  <Navbar bg="dark" variant="dark">
  <Container className="justify-content-center">
      <Row>
      <Col>
      <Navbar.Brand>Sargasso — The Private Sea</Navbar.Brand>
      </Col>
      <Col>
      <Navbar.Brand>
      <Button variant="warning" size="lg" block target="_blank" onClick={this.withdrawOld}>
        Withdraw Old Farm
      </Button>
      </Navbar.Brand>
      </Col>
      </Row>
    </Container>
  </Navbar>


  <Container>
  <Row>
    <Col>
    <Modal.Dialog>
    <Modal.Header>
    <Container>
    <Row>
    <Col>
          <Modal.Title>{this.state.buccFarmed} </Modal.Title>
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
      </Modal.Header>
    
        <Modal.Body variant="dark">
        <Button variant="dark" size="lg" block target="_blank" href="https://app.uniswap.org/#/add/ETH/0xd5a7d515Fb8B3337ACb9B053743E0BC18f50C855">
        Add BUCC Liquidity
        </Button>{'   '}
        
        <Button variant={this.state.buttonDepositColor} size="lg" block onClick={this.executeDeposit}>
          Deposit LP / Claim
        </Button>{'   '}
        <Button variant="dark" size="lg" block onClick={this.executeWithdrawl}>
          Withdraw LP
        </Button>
        </Modal.Body>

        <Modal.Footer textAlign="left">
        <Container>
          <Row>
          <Modal.Title variant="dark">Farmers: {this.state.fellowBuccaneers}</Modal.Title>
          </Row>
          <Row>
          <Modal.Title variant="dark">BUCC in farm contract: {(this.state.viewContractTokens / 10000000000 ).toFixed(0)}</Modal.Title>
          </Row>
          <br />
          <Row>
            <Col>
          <Form.Control size="lg" type="text" placeholder="Address" onChange={this.privateaddressToSend} />
            </Col>
            <Col>
            <Button variant="dark" size="lg" block onClick={this.privateClaim}>
            Private Claim
            </Button>
            </Col>
          </Row>
        </Container>
        </Modal.Footer>
        
        { this.state.subscribed && !(this.state.haskey) && !(this.state.isaKeyAddress) && (
        <React.Fragment>
        <Modal.Footer textAlign="center">
        <Container>
        <Row>
        <Col>
        <Modal.Title>You are subscribed. Add your key.</Modal.Title>
        <Modal.Body>
        <Row>
        <Col>
        <Form.Control size="lg" type="text" placeholder="Address" onChange={this.privateaddKey} />
        </Col>
        <Col>
        <Button variant="dark" size="lg" block onClick={this.addKey}>
          Add Key
        </Button>
        </Col>
        </Row>
        </Modal.Body>
        </Col>
        </Row>
        </Container>
        </Modal.Footer>
        </React.Fragment>
        )}

          { this.state.subscribed && this.state.haskey && !(this.state.isaKeyAddress) && (
            <React.Fragment>
            <Modal.Footer textAlign="center">
            <Container>
            <Row>
            <Col>
            <Modal.Title>Your Key is: <br /></Modal.Title><p className="overflowKey">{this.state.returnKeyforUser}</p>
            </Col>
            </Row>
            <Row>
            <Col sm={4}>
            <Button variant="primary" size="lg" block onClick={this.shredKey}>
            Shred Key
            </Button>
            </Col>
            </Row>
            </Container>
            </Modal.Footer>
            </React.Fragment>
          )}

        { !(this.state.subscribed) && !(this.state.isaKeyAddress) && (
        <React.Fragment>
        <Modal.Footer textAlign="center">
        <Container>
        <Row>
        <Col>
        <Modal.Title>You are not subscribed</Modal.Title>
        </Col>
        </Row>
        <Row>
        <Col>
        <br />
        <Button variant="primary" size="lg" block onClick={this.subscribe}>
        Subscribe
        </Button>
        </Col>
        </Row>
        <Row>
        <Col>
        <Modal.Body variant="dark">
        It costs {this.state.subscriptionFee / 10000000000} BUCC token(s) to subscribe for one month. Doing so will
        allow you to tumble ETH and tokens during that time.
        </Modal.Body>
        </Col>
        </Row>
        </Container>
        </Modal.Footer>
        </React.Fragment>
        )}

        { this.state.isaKeyAddress && (
          <React.Fragment>
          <Modal.Footer textAlign="center">
          <Container>
          <Row>
          <Col>
          <Modal.Title>You are a key address and may not subscribe or add a key.</Modal.Title>
          </Col>
          </Row>
          </Container>
          </Modal.Footer>
          </React.Fragment>
        )}
  </Modal.Dialog>
  </Col>

  
  {/* TABLE 2 */}
  { this.state.subscribed && this.state.haskey && !(this.state.isaKeyAddress) && (
        <React.Fragment>
  <Col>
    <Container>
    <Row>
    <Col>
    <Modal.Dialog>
    <Tab.Container defaultActiveKey="first">
  <Row>
    <Col sm={2}>
      <Nav variant="pills" className="flex-column">
        <Nav.Item>
          <Nav.Link eventKey="first">Ether</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="second">Tokens</Nav.Link>
        </Nav.Item>
      </Nav>
    </Col>
    <Col sm={10}>
    <Modal.Header>
      <Modal.Title>Sender Tab</Modal.Title>
    </Modal.Header>
      <Tab.Content>
        <Container>
        <Row>
        <Col>
        <Suspense>
          { this.state.progressVisibilityTumbling && (
          <React.Fragment>
              <Modal.Title className={this.state.fadeOutTumbling}>{this.state.progressDescriptionTumbling}</Modal.Title>
              { this.state.progressBarTumbling && (
              <ProgressBar animated now={this.state.progressTumbling} />
              )}
          </React.Fragment>
          )}
        </Suspense>
        </Col>
        </Row>
        </Container>
        <Tab.Pane eventKey="first">
        <Modal.Header>
        <Container>
        <Row>
        <Col>
          <Modal.Title>{this.state.userETHinContract} User ETH</Modal.Title>
        </Col>
        </Row>
        <Row>
        <Col>
          <Modal.Title>{this.state.ethinContract} ETH in Contract</Modal.Title>
        </Col>
        </Row>
        </Container>
        </Modal.Header>
        <Container>
        <Row>
        <Col>
        <Modal.Title>Send the amount of ETH you want to tumble to the contract.</Modal.Title>
        <Form.Control size="lg" type="text" placeholder="ETH" onChange={this.amountofETH} />
        <br />
        <Button variant="primary" size="lg" block onClick={this.executeSendETH}>
        Send ETH
        </Button>
        </Col>
        </Row>
        </Container>
        </Tab.Pane>
        <Tab.Pane eventKey="second">
        <Container>
        <Suspense>
        { this.state.findTokenReady && (
          <React.Fragment>
          <Row>
            <Col>
            <Modal.Title>Send {this.state.name} tokens.</Modal.Title>
            <Form.Control size="lg" type="text" placeholder="Input Number of Tokens" onChange={this.tokensToSend} />
            <br />
            <Button variant="primary" size="lg" block onClick={this.tumbleTokens}>
            Send {this.state.name}
            </Button>
            <br />
            </Col>
          </Row>
          </React.Fragment>
        )}
        </Suspense>
          <Row>
            <Col>
            <Modal.Title>{this.state.nameTitle}</Modal.Title>
            </Col>
          </Row>
          <Row>
            <Col>
            <Modal.Title>{this.state.symbol}</Modal.Title>
            </Col>
          </Row>
          <Row>
            <Col>
            <Modal.Title>{this.state.decimalPlaces}</Modal.Title>
            </Col>
          </Row>
          <Row>
            <Col>
            <Modal.Title>{this.state.returnTokenAmount}</Modal.Title>
            </Col>
          </Row>
          <Row>
            <Col>
            <Modal.Title>{this.state.returnUserToken}</Modal.Title>
            </Col>
          </Row>
        <Row>
        <Col>
        { !(this.state.findTokenReady) && (
          <Modal.Title>Paste Token Address</Modal.Title>
        )}
        <br />
        <Form.Control size="lg" type="text" placeholder="Address" onChange={this.addressToSearch} />
        <br />
        <Button variant="primary" size="lg" block onClick={this.lookupTokenAddress}>
        Lookup
        </Button>
        </Col>
        </Row>
        </Container>
        </Tab.Pane>
      </Tab.Content>
    </Col>
  </Row>
</Tab.Container>
<br />
<br />
</Modal.Dialog>
    </Col>
    </Row>
    </Container>
  </Col>
  </React.Fragment>
  )}



  {/* TABLE 3 */}
  { this.state.isaKeyAddress && (
        <React.Fragment>
  <Col>
    <Container>
    <Row>
    <Col>
    <Modal.Dialog>
    <Tab.Container defaultActiveKey="first">
  <Row>
    <Col sm={2}>
      <Nav variant="pills" className="flex-column">
        <Nav.Item>
          <Nav.Link eventKey="first">Ether</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="second">Tokens</Nav.Link>
        </Nav.Item>
      </Nav>
    </Col>
    <Col sm={10}>
    <Modal.Header>
      <Modal.Title>Key Tab</Modal.Title>
    </Modal.Header>
      <Tab.Content>
        <Container>
        <Row>
        <Col>
        <Suspense>
          { this.state.progressVisibilityTumbling && (
          <React.Fragment>
              <Modal.Title className={this.state.fadeOutTumbling}>{this.state.progressDescriptionTumbling}</Modal.Title>
              { this.state.progressBarTumbling && (
              <ProgressBar animated now={this.state.progressTumbling} />
              )}
          </React.Fragment>
          )}
        </Suspense>
        </Col>
        </Row>
        </Container>
        <Tab.Pane eventKey="first">
        <Modal.Header>
        <Container>
        <Row>
        <Col>
          <Modal.Title>{this.state.returnKeyUserETH} User ETH</Modal.Title>
        </Col>
        </Row>
        <Row>
        <Col>
          <Modal.Title>{this.state.ethinContract} ETH in Contract</Modal.Title>
        </Col>
        </Row>
        </Container>
        </Modal.Header>
        <Container>
        <Row>
        <Col>
        <Modal.Title>Input address you want to send to and the amount of ETH.</Modal.Title>
        <Form.Control size="lg" type="text" placeholder="ETH" onChange={this.amountofETH} />
        <br />
        <Form.Control size="lg" type="text" placeholder="Address" onChange={this.addresstoSendETH} />
        <br />
        <Button variant="danger" size="lg" block onClick={this.keySendETH}>
        Send ETH
        </Button>
        </Col>
        </Row>
        </Container>
        </Tab.Pane>
        <Tab.Pane eventKey="second">
        <Container>
        <Suspense>
        { this.state.findTokenReady && (
          <React.Fragment>
          <Row>
            <Col>
            <Modal.Title>Send {this.state.name} tokens.</Modal.Title>
            <Form.Control size="lg" type="text" placeholder="Input Address to Send To" onChange={this.addresstoSendETH} />
            <br />
            <Form.Control size="lg" type="text" placeholder="Input Number of Tokens" onChange={this.tokensToSend} />
            <br />
            <Button variant="danger" size="lg" block onClick={this.keySendTokens}>
            Send {this.state.name}
            </Button>
            <br />
            </Col>
          </Row>
          </React.Fragment>
        )}
        </Suspense>
          <Row>
            <Col>
            <Modal.Title>{this.state.nameTitle}</Modal.Title>
            </Col>
          </Row>
          <Row>
            <Col>
            <Modal.Title>{this.state.symbol}</Modal.Title>
            </Col>
          </Row>
          <Row>
            <Col>
            <Modal.Title>{this.state.decimalPlaces}</Modal.Title>
            </Col>
          </Row>
          <Row>
            <Col>
            <Modal.Title>{this.state.returnTokenAmount}</Modal.Title>
            </Col>
          </Row>
          <Row>
            <Col>
            <Modal.Title>{this.state.returnKeyUserTokens}</Modal.Title>
            </Col>
          </Row>
        <Row>
        <Col>
        { !(this.state.findTokenReady) && (
          <Modal.Title>Paste Token Address</Modal.Title>
        )}
        <br />
        <Form.Control size="lg" type="text" placeholder="Address" onChange={this.addressToSearch} />
        <br />
        <Button variant="danger" size="lg" block onClick={this.lookupTokenAddress}>
        Lookup
        </Button>
        </Col>
        </Row>
        </Container>
        </Tab.Pane>
      </Tab.Content>
    </Col>
  </Row>
</Tab.Container>
<br />
<br />
</Modal.Dialog>
    </Col>
    </Row>
    </Container>
  </Col>
  </React.Fragment>
  )}
  </Row>
  </Container>
</>
  );
}
}

