

const AVALANCHE_MAINNET_PARAMS = {
    chainId: "0x"+(43114).toString(16),
    chainName: 'Avalanche Mainnet C-Chain',
    nativeCurrency: {
        name: 'Avalanche',
        symbol: 'AVAX',
        decimals: 18
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://cchain.explorer.avax.network/']
}

const AVALANCHE_TESTNET_PARAMS = {
    chainId: "0x"+(43113).toString(16),
    chainName: 'Avalanche Testnet C-Chain',
    nativeCurrency: {
        name: 'Avalanche',
        symbol: 'AVAX',
        decimals: 18
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://cchain.explorer.avax-test.network/']
}


const gameContractAddress = "0x2aa2a9ef24a209f47f42Cb97Bd19D881e33F3956";

const readerWeb3 = new Web3(AVALANCHE_MAINNET_PARAMS.rpcUrls[0]);
const writerWeb3 = new Web3(Web3.givenProvider);

var selectedAccount = undefined;

async function initializeWalletState(callback) {
    document.getElementById("connectWalletView").style.display = "none";
    document.getElementById("accountView").style.display = "none";

    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', function(accounts) {
            displayAccount(accounts[0]);
        });
        callback();
        try {
            var result = await addNetworkToMetamask();
            if(!result){
                displayAccount(undefined);
            }else{
                const accounts = await ethereum.request({
                    method: 'eth_requestAccounts'
                });
                displayAccount(accounts[0]);
            }
            
        } catch (error) {
            displayAccount(undefined);
        }
    } else {
        displayAccount(undefined);
        callback();
    }
}

async function addNetworkToMetamask() {
    try {
        var result = await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AVALANCHE_MAINNET_PARAMS]
        });
        return true;
    }catch(error)  {
        console.log(error);
        return false;
    };

}
function wrongNetworkError(){
    alert("You need to switch your wallet's network to Avalanche Mainnet C-Chain.");
}

async function connectToMetamask() {
    if (typeof window.ethereum !== 'undefined') {

        try {
            var result = await addNetworkToMetamask();
            if(!result){
                wrongNetworkError();
                displayAccount(undefined);
            }else{
                const accounts = await ethereum.request({
                    method: 'eth_requestAccounts'
                });
                if (accounts.length > 0) {
                    const account = accounts[0];
                    displayAccount(account);
                } else {
                    console.log("no account selected");
                    displayAccount(undefined);
                }
            }
            
        } catch (error) {
            console.log("no account selected");
            displayAccount(undefined);
        }
    } else {
        alert('MetaMask is not installed');
    }
}



function displayAccount(account) {

    if(account != undefined){
        selectedAccount = account.toUpperCase();
    }else{
        selectedAccount = undefined;
    }
    
    accountChanged();
    if (account === undefined) {
        document.getElementById("connectWalletView").style.display = "inline";
        document.getElementById("accountView").style.display = "none";
        return;
    }
    document.getElementById("connectWalletView").style.display = "none";
    document.getElementById("accountView").style.display = "inline";

    document.getElementById("accountView").innerHTML = account.substring(0, 6) + "..." + account.substring(account.length-4, account.length);
}



