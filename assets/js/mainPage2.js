var gameReadContract = undefined;
var gameWriteContract = undefined;

$( document ).ready(function() {
    

    initializeWalletState(function(){
		initialize();
	});

	$( "#accountView" ).click(function() {
		location.href = "planets.html";
	});

	$( "#connectWalletView" ).click(function() {
  		connectToMetamask();
	});

	setTimeout(function(){ 
		dismissLoader();
	}, 3000);



});

async function initialize() {
	gameReadContract = new readerWeb3.eth.Contract(
       GameContractABI,
       gameContractAddress
    );
    gameWriteContract = new writerWeb3.eth.Contract(
       GameContractABI,
       gameContractAddress
    );
    loadPage();
	if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', function(chainId){
        loadPage();
      });
    }
}

async function loadPage(){
  try {
    readerWeb3.eth.clearSubscriptions();


    showStats();

  }catch(error){
    console.log(error);
  }
}

async function showStats(){
	var stats = await gameReadContract.methods.getStats().call();
    document.getElementById("planetStat").innerHTML = stats[0];
    document.getElementById("structureStat").innerHTML = stats[1];
    document.getElementById("mintCount").innerHTML = stats[0] +"/8888 are minted.";


    var planetFee = await gameReadContract.methods.planetFee().call();
	var feeValue = Number(Web3.utils.fromWei(planetFee, 'ether'));

	var items = document.getElementsByClassName("packFee1");
	for(var i=0; i < items.length; i++){ items[i].innerHTML = feeValue + " AVAX"; }

	items = document.getElementsByClassName("packFee2");
	for(var i=0; i < items.length; i++){ items[i].innerHTML = (4*feeValue) + " AVAX"; }

	items = document.getElementsByClassName("packFee3");
	for(var i=0; i < items.length; i++){ items[i].innerHTML = (8*feeValue) + " AVAX"; }

			items = document.getElementsByClassName("packFee4");
	for(var i=0; i < items.length; i++){ items[i].innerHTML = (20*feeValue) + " AVAX"; }

			items = document.getElementsByClassName("packFee5");
	for(var i=0; i < items.length; i++){ items[i].innerHTML = (40*feeValue) + " AVAX"; }

	

	setTimeout(function(){ showStats(); }, 3000);

}

async function buyPlanet(packIndex){
	
	var stats = await gameReadContract.methods.getStats().call();
	if(Number(stats[0]) >= 8888){
		alert("Unfortunately all NovaX planets are completely sold out.");
		return;
	}

	var amount = 1;
	if(packIndex == 1){ amount = 4; };
	if(packIndex == 2){ amount = 8; };
	if(packIndex == 3){ amount = 20; };
	if(packIndex == 4){ amount = 40; };

	var planetFee = await gameReadContract.methods.planetFee().call();
	planetFee = planetFee * amount;

	try {
    	var result = await addNetworkToMetamask();
    	if(!result){  wrongNetworkError(); return; }
    	//showLoader();
    	const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    	var gasEstimate;
    	try{
    		gasEstimate = await gameWriteContract.methods.createPlanet(amount).estimateGas({ 
    			from: accounts[0].toUpperCase()  , 
	            value: planetFee
    		});
    	}catch(error){
    		gasEstimate = 3500000;
    	}
    	const gasPrice = await readerWeb3.eth.getGasPrice();

        await gameWriteContract.methods.createPlanet(amount).send({ 
            from: accounts[0].toUpperCase()  , 
            value: planetFee,
            gas: gasEstimate,
            gasPrice: gasPrice
        });

		dismissLoader();
		location.href = "planets.html";
  	}catch(error){
  		dismissLoader();
    	console.log("An error occured: " + error);
  	}

}

function accountChanged(){
	loadPage();
}

