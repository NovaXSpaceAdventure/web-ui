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


    loadPlanetDetail();

  }catch(error){
    console.log(error);
  }
}
var globalPlanets = [];
async function loadPlanetDetail(){
	var planetNo = findGetParameter("planetNo");
	loadBuildings(planetNo);
	loadResources(planetNo);
	try {
		var ownerAddress = await planetReadContract.methods.ownerOf(planetNo).call();
		document.getElementById("planetOwner").innerHTML = ownerAddress.substring(0, 6) + "..." + ownerAddress.substring(ownerAddress.length-4, ownerAddress.length);
  }catch(error){
    console.log(error);
  }

	retrieveMetadata(planetNo, function(metadata){
		document.getElementById("planetName").innerHTML = metadata.name;
		document.getElementById("planetDesc").innerHTML = metadata.name + "  is the #" + planetNo + " planet of the NovaX universe. It's coordinates are " + metadata.coordinate + ".";
		


		document.getElementById("planetImage").src = metadata.image;
		document.getElementById("planetNo").innerHTML = metadata.planetNo;
		document.getElementById("planetCoordinate").innerHTML = metadata.coordinate;
		
		


	});

	
}

async function loadBuildings(planetNo){
	try {
		

		var sLevel = await planetReadContract.methods.getParam1(planetNo, "s-level").call();
		var mLevel = await planetReadContract.methods.getParam1(planetNo, "m-level").call();
		var cLevel = await planetReadContract.methods.getParam1(planetNo, "c-level").call();
		sLevel = Number(sLevel); mLevel = Number(mLevel); cLevel = Number(cLevel);

		var html = '';

		//Solar plant
		html += '<tr>';
		html += '<td> <img src="assets/images/buildings/s.png" alt=""> Solar Plant </td>';
		if (sLevel > 0){
			html += '<td style="color: #f0ad4e">' + sLevel + '</td>';


			html += '<td style="color: #f0ad4e"> <a href="javascript:levelUpStructure(\''+planetNo+'\', \''+(sLevel + 1)+'\', \'s\')"class="mybtn1">Level Up</a> </td>';
		}else{
			html += '<td style="color: #f0ad4e">-</td>';
			html += '<td style="color: #f0ad4e"> <a href="javascript:buildStructure(\''+planetNo+'\', \'s\')"class="mybtn1">Build</a> </td>';
		}
		html += '</tr>';

		//Metal mine
		html += '<tr>';
		html += '<td> <img src="assets/images/buildings/m.png" alt=""> Metal Mine </td>';
		if (mLevel > 0){
			html += '<td style="color: #f0ad4e">' + mLevel + '</td>';
			html += '<td style="color: #f0ad4e"> <a href="javascript:levelUpStructure(\''+planetNo+'\',  \''+(mLevel + 1)+'\',\'m\')"class="mybtn1">Level Up</a> </td>';
		}else{
			html += '<td style="color: #f0ad4e">-</td>';
			html += '<td style="color: #f0ad4e"> <a href="javascript:buildStructure(\''+planetNo+'\', \'m\')"class="mybtn1">Build</a> </td>';
		}
		
		html += '</tr>';

		//Crystal laboratory
		html += '<tr>';
		html += '<td> <img src="assets/images/buildings/c.png" alt=""> Crystal Laboratory </td>';
		if (cLevel > 0){
			html += '<td style="color: #f0ad4e">' + cLevel + '</td>';
			html += '<td style="color: #f0ad4e"> <a href="javascript:levelUpStructure(\''+planetNo+'\',  \''+(cLevel + 1)+'\',\'c\')"class="mybtn1">Level Up</a> </td>';
		}else{
			html += '<td style="color: #f0ad4e">-</td>';
			html += '<td style="color: #f0ad4e"> <a href="javascript:buildStructure(\''+planetNo+'\', \'c\')"class="mybtn1">Build</a> </td>';
		}
		
		html += '</tr>';


			
		document.getElementById("structuresTable").innerHTML = html;
  }catch(error){
    console.log(error);
  }	
}


async function loadResources(planetNo){
	try {
		

		var solarEnergy = await gameReadContract.methods.getResourceAmount(0, planetNo).call();
		var metal = await gameReadContract.methods.getResourceAmount(1, planetNo).call();
		var crystal = await gameReadContract.methods.getResourceAmount(2, planetNo).call();

		solarEnergy = Number(Web3.utils.fromWei(solarEnergy, 'ether'));
		metal = Number(Web3.utils.fromWei(metal, 'ether'));
		crystal = Number(Web3.utils.fromWei(crystal, 'ether'));


		var html = '';

		//Solar energy
		html += '<tr>';
		html += '<td> <img src="assets/images/buildings/s.png" alt=""> Solar Energy </td>';
		html += '<td style="color: #f0ad4e">' + solarEnergy.toFixed(4) + '</td>';
		html += '<td style="color: #f0ad4e"> <a href="javascript:harvest(0)"class="mybtn1">Harvest</a> </td>';
		html += '</tr>';

		//Metal 
		html += '<tr>';
		html += '<td> <img src="assets/images/buildings/m.png" alt=""> Metal </td>';
		html += '<td style="color: #f0ad4e">' + metal.toFixed(4) + '</td>';
		html += '<td style="color: #f0ad4e"> <a href="javascript:harvest(1)"class="mybtn1">Harvest</a> </td>';
		html += '</tr>';

		//Crystal 
		html += '<tr>';
		html += '<td> <img src="assets/images/buildings/c.png" alt=""> Crystal </td>';
		html += '<td style="color: #f0ad4e">' + crystal.toFixed(4) + '</td>';
		html += '<td style="color: #f0ad4e"> <a href="javascript:harvest(2)"class="mybtn1">Harvest</a> </td>';
		html += '</tr>';


			
		document.getElementById("resourcesTable").innerHTML = html;

  }catch(error){
    console.log(error);
  }	
  setTimeout(function(){ loadResources(planetNo); }, 3000);

}

async function buildStructure(planetNo, structureId){
	var ownerAddress = await planetReadContract.methods.ownerOf(planetNo).call();
	var isOwner = (ownerAddress.toUpperCase() == selectedAccount.toUpperCase());
	if(!isOwner){
		alert('Connected wallet is not the owner of this planet.');
		return;
	}
	resourceInfo(structureId, 1, async function(){
		try {
    	var result = await addNetworkToMetamask();
    	if(!result){  wrongNetworkError(); return; }
    	showLoader();
    	const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    	var gasEstimate;
    	try{
    		gasEstimate = await gameWriteContract.methods.buildStructure(structureId,planetNo).estimateGas({ 
    			from: accounts[0].toUpperCase()  , 
	            value: 0
    		});
    	}catch(error){
    		dismissLoader();
    		alert("Your connected wallet doens't have the necessary resources to perform this action.");
    		return;
    	}
    	const gasPrice = await readerWeb3.eth.getGasPrice();

        await gameWriteContract.methods.buildStructure(structureId,planetNo).send({ 
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
	});

}


async function harvest(index){
		var planetNo = findGetParameter("planetNo");
			var solarEnergy = await gameReadContract.methods.getResourceAmount(0, planetNo).call();
		var metal = await gameReadContract.methods.getResourceAmount(1, planetNo).call();
		var crystal = await gameReadContract.methods.getResourceAmount(2, planetNo).call();
		var resourceAmount =  0;
		if(index == 0){
			 resourceAmount = solarEnergy;
		}else if(index == 1){
			 resourceAmount = metal;
		}else if(index == 2){
			 resourceAmount = crystal;
		}
	var ownerAddress = await planetReadContract.methods.ownerOf(planetNo).call();
	var isOwner = (ownerAddress.toUpperCase() == selectedAccount.toUpperCase());
	if(!isOwner){
		alert('Connected wallet is not the owner of this planet.');
		return;
	}
		try {
    	var result = await addNetworkToMetamask();
    	if(!result){  wrongNetworkError(); return; }
    	showLoader();
    	const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    
    	var gasEstimate;
    	try{
    		gasEstimate = await gameWriteContract.methods.withdrawResource(index, resourceAmount,planetNo).estimateGas({ 
    			from: accounts[0].toUpperCase()  , 
	            value: 0
    		});
    	}catch(error){
    				dismissLoader();

    		return;
    	}
    	const gasPrice = await readerWeb3.eth.getGasPrice();

        await gameWriteContract.methods.withdrawResource(index, resourceAmount,planetNo).send({ 
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

async function resourceInfo(structureId, level, callback){
		var resourceInfo = await gameReadContract.methods.resourceInfo(structureId, level).call();
		var solarEnergy = Number(Web3.utils.fromWei(resourceInfo[0], 'ether'));
		var metal = Number(Web3.utils.fromWei(resourceInfo[1], 'ether'));
		var crystal = Number(Web3.utils.fromWei(resourceInfo[2], 'ether'));

		var title = "";
		switch(structureId) {
  		case "s": title += "Solar Plant Level-" + level ; break;
  		case "m": title += "Metal Mine Level-" + level;  break;
  		case "c": title += "Crystal Laboratory Level-" + level; break;

  		default:
    		break;
		}
		var html = '<h4 class="title" id="popupTitle">' + title + '</h4>';




		if(solarEnergy > 0 ){
			html += '<p class="sub-title" id="popupDesc">Solar Energy: ' + solarEnergy + '</p>';
		}
		if(metal > 0 ){
			html += '<p class="sub-title" id="popupDesc">Metal: ' + metal + '</p>';
		}
		if(crystal > 0 ){
			html += '<p class="sub-title" id="popupDesc">Crystal: ' + crystal + '</p>';
		}
		



		document.getElementById("popupHeadArea").innerHTML = html;

popupCallback = callback;
		$("#login").modal();


}

var popupCallback = undefined;
function popupConfirmTapped(){
$('#login').modal('hide');

	popupCallback();
}

async function levelUpStructure(planetNo, level, structureId){
	var ownerAddress = await planetReadContract.methods.ownerOf(planetNo).call();
	var isOwner = (ownerAddress.toUpperCase() == selectedAccount.toUpperCase());
	if(!isOwner){
		alert('Connected wallet is not the owner of this planet.');
		return;
	}

	resourceInfo(structureId, level, async function(){
		try {
    	var result = await addNetworkToMetamask();
    	if(!result){  wrongNetworkError(); return; }
    	showLoader();
    	const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    	var gasEstimate;
    	try{
    		gasEstimate = await gameWriteContract.methods.levelUpStructure(structureId,planetNo).estimateGas({ 
    			from: accounts[0].toUpperCase()  , 
	            value: 0
    		});
    	}catch(error){
    		dismissLoader();
    		alert("Your connected wallet doens't have the necessary resources to perform this action.");
    		return;
    	}
    	const gasPrice = await readerWeb3.eth.getGasPrice();

        await gameWriteContract.methods.levelUpStructure(structureId,planetNo).send({ 
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
	});
		
}

async function planetOwnerTapped(){
		var planetNo = findGetParameter("planetNo");

	var ownerAddress = await planetReadContract.methods.ownerOf(planetNo).call();
	window.open("https://cchain.explorer.avax.network/address/"+ownerAddress, '_blank');
}

function retrieveMetadata(tokenId, callback){
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
       if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
       	 callback(JSON.parse(xmlHttp.responseText));
       }
           
    }
    xmlHttp.open("GET", "https://u9xw2azhpf.execute-api.eu-central-1.amazonaws.com/default/NovaXPlanetMetadata/"+tokenId, true); // true for asynchronous 
    xmlHttp.send(null);

}


function accountChanged(){
	loadPage();
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}
