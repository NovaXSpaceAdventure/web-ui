var gameReadContract = undefined;
var gameWriteContract = undefined;

var planetReadContract = undefined;

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
	planetReadContract = new readerWeb3.eth.Contract(
       PlanetContractABI,
       PlanetContractAddress
    );
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


    loadPlanets();

  }catch(error){
    console.log(error);
  }
}
var globalPlanets = [];
async function loadPlanets(){
	if(selectedAccount == undefined){
		displayPlanets([]);
		return;
	}
	showLoader();

	var tokenIds = await planetReadContract.methods.tokensOfOwner(Web3.utils.toChecksumAddress(selectedAccount)).call();
	retrieveMetadatas(tokenIds, function(planets){
		globalPlanets = planets;
		displayPlanets(planets);
		dismissLoader();
	});
	
	if(tokenIds.length == 0){
		displayPlanets([]);
		dismissLoader();
	}
}

function retrieveMetadatas(tokenIds, callback){
	var metadatas = [];
	for(var i=0; i < tokenIds.length; i++){
		var tokenId = tokenIds[i];
		metadatas.push({});
	}

	var count = tokenIds.length;
	if(count == 0){

		callback([]);
		return;
	}
	for(var i=0; i < tokenIds.length; i++){
		var tokenId = tokenIds[i];
		retrieveMetadata(i, tokenId, function(index, result){
			metadatas[index] = result;
			count -= 1;
			if(count <= 0){
				callback(metadatas);
				return;
			}
		})
	}


}

function retrieveMetadata(index, tokenId, callback){
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
       if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
       	 callback(index, JSON.parse(xmlHttp.responseText));
       	 return;
       }
           
    }
    xmlHttp.open("GET", "https://4o0f85mlg7.execute-api.eu-central-1.amazonaws.com/default/MetadataNftTest/"+tokenId, true); // true for asynchronous 
    xmlHttp.send(null);

}

function displayPlanets(planets){
	
	document.getElementById("bottomControlPanel").style.display = "none";

	if(selectedAccount == undefined){
			document.getElementById("planetsDiv").innerHTML = '<h5 class="subtitle"> Connect your wallet to view your planets. </h5>';
		return;
	}
	if (planets.length == 0 ){
			document.getElementById("planetsDiv").innerHTML = '<h5 class="subtitle"> You don\'t have any NovaX planet nfts. Please click the \'Mint New Planet\' button </h5>';

		
		return;
	}
	loadTotalBalance();
	var html = '';
	for (var i=0 ; i < planets.length; i++){
		if(i >= 4 && i % 4 == 0){
			html += '</div>\n<div class="row" style="margin-top: 20px;">\n';
		}else if(i == 0){
			html += '\n<div class="row">\n';
		}
		var planet = planets[i];
		html += '<div class="col-lg-3 col-md-6">';
		html += '<div class="single-team">';
		html += '<div class="image">';
		html += '<img src="'+planet.image+'" alt="">';
		html += '<div class="overlay"></div>';
		html += '<div class="content">';
		html += '<h4 class="name">';
		html += '#'+ planet.planetNo;
		html += '</h4>';
		html += '<div class="designation">';
		html += planet.name;
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html += '<div class="social-area">';
		html += '<a href="planetDetail.html?planetNo='+planet.planetNo+'" class="mybtn1" style="margin-top:0px;">detail</a>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
	}

	document.getElementById("planetsDiv").innerHTML = html;
	
}


async function loadTotalBalance(){

		try {
		
		if(selectedAccount == undefined){
			return;
		}
		var tokenIds = await planetReadContract.methods.tokensOfOwner(Web3.utils.toChecksumAddress(selectedAccount)).call();
		var planetGroups = [];
		var tempGroup = [];
		for(var i= 0 ; i < tokenIds.length ; i++){
			var tokenId = tokenIds[i];
			tempGroup.push(tokenId);
			if(tempGroup.length >= 50){
				planetGroups.push(tempGroup);
				tempGroup = [];
			}
		}
		if(tempGroup.length > 0){
			planetGroups.push(tempGroup);
		}


		var html = '';

		for(var i= 0 ; i < planetGroups.length ; i++){
			var planetGroup = planetGroups[i];
			var balances = await gameReadContract.methods.totalResourceOfPlanets(planetGroup).call();
			var solarEnergy = balances[0];
			var metal = balances[1];
			var crystal = balances[2];

			solarEnergy = Number(Web3.utils.fromWei(solarEnergy, 'ether'));
			metal = Number(Web3.utils.fromWei(metal, 'ether'));
			crystal = Number(Web3.utils.fromWei(crystal, 'ether'));

			html += '<tr>';
			html += '<td style="color: #f0ad4e">' + ("" + (i*50) + "-" +  ((i*50) + planetGroup.length) ) + '</td>';
			html += '<td style="color: #f0ad4e">' + solarEnergy.toFixed(4) + '</td>';
			html += '<td style="color: #f0ad4e">' + metal.toFixed(4) + '</td>';
			html += '<td style="color: #f0ad4e">' + crystal.toFixed(4) + '</td>';
			var Ids = planetGroup.join(",");
			html += '<td style="color: #f0ad4e"><a href="javascript: harvestAll([' + Ids + ']);" class="mybtn1">HARVEST</a></td>';
			html += '</tr>';
		}



			
		document.getElementById("resourcesTable").innerHTML = html;

  }catch(error){
    console.log(error);
  }	
  setTimeout(function(){ loadTotalBalance(); }, 3000);
		document.getElementById("bottomControlPanel").style.display = "block";

}

async function harvestAll(tokenIds){
	try {
    	var result = await addNetworkToMetamask();
    	if(!result){  wrongNetworkError(); return; }
    	showLoader();
    	const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    	var gasEstimate;
    	try{
    		gasEstimate = await gameWriteContract.methods.harvestAll(tokenIds).estimateGas({ 
    			from: accounts[0].toUpperCase()  , 
	            value: 0
    		});
    	}catch(error){
    				dismissLoader();
    		return;
    	}
    	const gasPrice = await readerWeb3.eth.getGasPrice();

        await gameWriteContract.methods.harvestAll(tokenIds).send({ 
            from: accounts[0].toUpperCase()  , 
            value: 0,
            gas: gasEstimate,
            gasPrice: gasPrice
        });

		dismissLoader();
		location.reload();
  	}catch(error){
  		dismissLoader();
    	console.log("An error occured: " + error);
  	}
}

function accountChanged(){
	loadPage();
}

