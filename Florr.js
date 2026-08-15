const raritySquares=document.querySelectorAll(".rarity");
const petalCountInput=document.getElementById("petalCount");
const desiredSuccessInput=document.getElementById("desiredSuccess");
const desiredSuccessResult=document.getElementById("desiredSuccessResult");
const results=document.getElementById("results");
const chartContainer=document.getElementById("chartContainer");
const pieChart=document.getElementById("pieChart");
const pieLabels=document.getElementById("pieLabels");
const chartLegend=document.getElementById("chartLegend");
const rarityResult=document.getElementById("rarityResult");

const MIN_PETALS=5;
const MAX_PETALS=10000000;
const BASE_TIME=0.03;
const TIME_INCREASE_PER_DECADE=0.45;
const MINIMUM_VISIBLE_PERCENTAGE=3;
const MAX_CHART_SECTORS=7;

const chartColors=[
	"#5BE35A",
	"#FFD84D",
	"#5960F0",
	"#9B3BEF",
	"#F04444",
	"#25D9DE",
	"#FF3F82"
];

let selectedRarity=null;
let selectedRarityName="";
let currentCalculationID=0;
let currentDistribution=null;
let currentSimulationCount=0;

function getTargetTime(petals){
	const decades=Math.log10(petals/MIN_PETALS);
	return BASE_TIME*Math.pow(1+TIME_INCREASE_PER_DECADE,decades);
}

raritySquares.forEach(square=>{
	square.addEventListener("mouseenter",()=>{
		square.style.transform="scale(1.05)";
	});

	square.addEventListener("mouseleave",()=>{
		square.style.transform="scale(1)";
	});

	square.addEventListener("click",()=>{
		raritySquares.forEach(item=>{
			item.style.boxShadow="none";
		});

		square.style.boxShadow="0 0 0 5px white";
		selectedRarity=Number(square.dataset.rarity);
		selectedRarityName=square.querySelector("span").textContent;

		runCalculation();
	});
});

petalCountInput.addEventListener("input",()=>{
	const petals=Number(petalCountInput.value);

	if(!Number.isFinite(petals)||petals<MIN_PETALS){
		chartContainer.classList.add("hidden");
		results.innerHTML="<p>Please increase the number of petals to at least 5.</p>";
		return;
	}

	if(petals>MAX_PETALS){
		chartContainer.classList.add("hidden");
		results.innerHTML="<p>Please decrease the number of petals to a maximum of 10,000,000.</p>";
		return;
	}

	if(selectedRarity!==null){
		runCalculation();
	}
});

desiredSuccessInput.addEventListener("input",updateDesiredSuccessChance);

function runCalculation(){
	if(selectedRarity===null){
		return;
	}

	const startingPetals=Number(petalCountInput.value);

	if(!Number.isFinite(startingPetals)||startingPetals<MIN_PETALS||startingPetals>MAX_PETALS){
		return;
	}

	currentCalculationID++;

	const calculationID=currentCalculationID;
	const targetTime=getTargetTime(startingPetals);

	let totalSuccess=0;
	let totalAttempts=0;
	let simulationsWithSuccess=0;
	let simulations=0;

	const successDistribution=new Map();
	const startTime=performance.now();

	while(true){
		if(calculationID!==currentCalculationID){
			return;
		}

		let petals=startingPetals;
		let success=0;
		let failures=0;

		while(petals>4){
			const roll=Math.floor(Math.random()*100)+1;

			if(roll<=selectedRarity){
				success++;
				petals-=5;
			}else{
				failures++;
				const loss=Math.floor(Math.random()*4)+1;
				petals-=loss;
			}
		}

		totalSuccess+=success;
		totalAttempts+=success+failures;

		if(success>0){
			simulationsWithSuccess++;
		}

		simulations++;

		successDistribution.set(
			success,
			(successDistribution.get(success)||0)+1
		);

		const elapsed=(performance.now()-startTime)/1000;

		if(elapsed>=targetTime){
			break;
		}
	}

	currentDistribution=successDistribution;
	currentSimulationCount=simulations;

	const averageSuccess=totalSuccess/simulations;
	const chanceOfAtLeastOneSuccess=simulationsWithSuccess*100/simulations;
	const averageAttempts=totalAttempts/simulations;

	buildPieChart(successDistribution,simulations);

	results.innerHTML=`
		<p>Average successes: ${averageSuccess.toFixed(2)}</p>
		<p>Chance of getting at least 1 success: ${chanceOfAtLeastOneSuccess.toFixed(2)}%</p>
		<p>Average attempts: ${averageAttempts.toFixed(2)}</p>
	`;

	updateDesiredSuccessChance();
}

function updateDesiredSuccessChance(){
	if(desiredSuccessInput.value===""){
		desiredSuccessResult.textContent="";
		return;
	}

	if(!currentDistribution||currentSimulationCount===0){
		return;
	}

	const desiredSuccess=Number(desiredSuccessInput.value);

	if(!Number.isFinite(desiredSuccess)||desiredSuccess<1||!Number.isInteger(desiredSuccess)){
		desiredSuccessResult.textContent="Please enter a whole number of SUCCESS.";
		return;
	}

	let successfulSimulations=0;

	currentDistribution.forEach((count,successes)=>{
		if(successes>=desiredSuccess){
			successfulSimulations+=count;
		}
	});

	const chance=successfulSimulations*100/currentSimulationCount;

	desiredSuccessResult.textContent=
		`Chance of getting at least ${desiredSuccess} SUCCESS: ${chance.toFixed(2)}%`;
}

function buildPieChart(distribution,totalSimulations){
	let outcomes=Array.from(distribution.entries())
		.map(([successes,count])=>({
			successes,
			count,
			percentage:count*100/totalSimulations
		}));

	const failure=outcomes.find(outcome=>outcome.successes===0);

	const nonFailure=outcomes.filter(
		outcome=>outcome.successes!==0
	);

	nonFailure.sort(
		(a,b)=>a.successes-b.successes
	);

	let important=nonFailure.filter(
		outcome=>outcome.percentage>=MINIMUM_VISIBLE_PERCENTAGE
	);

	const maxIndividual=failure
		?MAX_CHART_SECTORS-1
		:MAX_CHART_SECTORS;

	if(important.length>maxIndividual){
		const mostImportant=[...important]
			.sort((a,b)=>b.percentage-a.percentage)
			.slice(0,maxIndividual);

		const importantSet=new Set(
			mostImportant.map(outcome=>outcome.successes)
		);

		important=important.filter(
			outcome=>importantSet.has(outcome.successes)
		);
	}

	const individualSuccesses=new Set(
		important.map(outcome=>outcome.successes)
	);

	let otherCount=0;

	nonFailure.forEach(outcome=>{
		if(!individualSuccesses.has(outcome.successes)){
			otherCount+=outcome.count;
		}
	});

	const finalOutcomes=[];

	if(failure){
		finalOutcomes.push(failure);
	}

	important
		.sort((a,b)=>a.successes-b.successes)
		.forEach(outcome=>{
			finalOutcomes.push(outcome);
		});

	if(otherCount>0){
		finalOutcomes.push({
			successes:"other",
			count:otherCount,
			percentage:otherCount*100/totalSimulations
		});
	}

	if(finalOutcomes.length>MAX_CHART_SECTORS){
		const keep=finalOutcomes.slice(
			0,
			MAX_CHART_SECTORS-1
		);

		let mergedCount=0;

		finalOutcomes
			.slice(MAX_CHART_SECTORS-1)
			.forEach(outcome=>{
				mergedCount+=outcome.count;
			});

		keep.push({
			successes:"other",
			count:mergedCount,
			percentage:mergedCount*100/totalSimulations
		});

		finalOutcomes.length=0;

		keep.forEach(outcome=>{
			finalOutcomes.push(outcome);
		});
	}

	let currentPercentage=0;
	const gradientParts=[];

	pieLabels.innerHTML="";
	chartLegend.innerHTML="";

	finalOutcomes.forEach((outcome,index)=>{
		const start=currentPercentage;
		const end=currentPercentage+outcome.percentage;
		const color=chartColors[index];

		gradientParts.push(
			`${color} ${start}% ${end}%`
		);

		const middlePercentage=(start+end)/2;
		const angle=middlePercentage*3.6-90;

		let radius=38;

		if(outcome.percentage<6){
			radius=42;
		}

		const radians=angle*Math.PI/180;
		const x=50+Math.cos(radians)*radius;
		const y=50+Math.sin(radians)*radius;

		if(outcome.percentage>=3){
			const label=document.createElement("div");

			label.className="pie-label";

			if(outcome.percentage<6){
				label.classList.add("small");
			}

			if(outcome.percentage>=15){
				label.classList.add("large");
			}

			label.style.left=`${x}%`;
			label.style.top=`${y}%`;

			if(outcome.successes===0){
				label.innerHTML=`
					<span class="successes">FAILURE</span>
					<span class="percentage">${outcome.percentage.toFixed(1)}%</span>
				`;
			}else if(outcome.successes==="other"){
				label.innerHTML=`
					<span class="successes">OTHER</span>
					<span class="percentage">${outcome.percentage.toFixed(1)}%</span>
				`;
			}else{
				label.innerHTML=`
					<span class="successes">${outcome.successes} SUCCESS</span>
					<span class="percentage">${outcome.percentage.toFixed(1)}%</span>
				`;
			}

			pieLabels.appendChild(label);
		}

		const legendItem=document.createElement("div");
		legendItem.className="legend-item";

		const colorBox=document.createElement("span");
		colorBox.className="legend-color";
		colorBox.style.backgroundColor=color;

		const legendText=document.createElement("span");

		let name;

		if(outcome.successes===0){
			name="FAILURE";
		}else if(outcome.successes==="other"){
			name="OTHER";
		}else{
			name=`${outcome.successes} SUCCESS`;
		}

		legendText.textContent=
			name+" "+outcome.percentage.toFixed(2)+"%";

		legendItem.appendChild(colorBox);
		legendItem.appendChild(legendText);
		chartLegend.appendChild(legendItem);

		currentPercentage=end;
	});

	pieChart.style.background=
		`conic-gradient(${gradientParts.join(",")})`;

	rarityResult.textContent=selectedRarityName;

	chartContainer.classList.remove("hidden");
}
