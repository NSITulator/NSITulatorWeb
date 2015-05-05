var showForm = function() {
	var branchSelect = document.getElementById('branchSelect');
	var semSelect = document.getElementById('semSelect');
	var sectionSelect = document.getElementById('sectionSelect');
	branchName = branchSelect.options[branchSelect.selectedIndex].value;
	numberOfSems = semSelect.options[semSelect.selectedIndex].value;
	sectionId = sectionSelect.options[sectionSelect.selectedIndex].value;
	if (branchName == "ece" && numberOfSems == 6) {
		alert("The data for ECE 6th semester isn't available. Please choose a different option.");
	}
	else if (sectionId == 0) {
		alert("Please choose your section.");
	}
	else
		loadForm();
};

var loadForm = function() {
	document.getElementById('dataContainer').style.display = 'none';
	document.getElementById('mainContainer').innerHTML = '';
	var html = '';
	for (var semNum = 1; semNum <= numberOfSems; semNum++) {
		html = '<table class="table table-hover"><caption>Semester'+semNum+
		'</caption><thead><tr><th>#</th><th>Code</th><th>Name</th><th>Marks</th></tr></thead><tbody>';
		for (var i = 0; i < 5; i++) {
			html += '<tr>';
			html += '<td>'+branches[branchName][semNum-1].subjects.theory[i].sno+'</td>';
			html += '<td>'+branchName.toUpperCase()+branches[branchName][semNum-1].subjects.theory[i].code+'</td>';
			html += '<td>'+branches[branchName][semNum-1].subjects.theory[i].name+'</td>';
			html += '<td><div class="label2"><input type="number" id="' +semNum+branches[branchName][semNum-1].subjects.theory[i].sno+ '"></input></div></td>';
			html += '</tr>';
		}
		for (var i = 0; i < branches[branchName][semNum-1].subjects.practical.length; i++) {
			html += '<tr>';
			html += '<td>'+branches[branchName][semNum-1].subjects.practical[i].sno+'</td>';
			html += '<td>'+branchName.toUpperCase()+branches[branchName][semNum-1].subjects.practical[i].code+'</td>';
			html += '<td>'+branches[branchName][semNum-1].subjects.practical[i].name+'</td>';
			html += '<td><div class="label2"><input type="number" id="' +semNum+branches[branchName][semNum-1].subjects.practical[i].sno+ '"></input></div></td>';
			html += '</tr>';
		}
		html += '</tbody></table>';
		document.getElementById('mainContainer').innerHTML += html;
	}
	document.getElementById('mainContainer').innerHTML += '<button onclick="calculate(1);" class="btn btn-default" style="margin-bottom:1%;">Calculate</button>';
	document.getElementById('mainContainer').innerHTML += '&nbsp;&nbsp;&nbsp;<button onclick="saveToLocal();" class="btn btn-default" style="margin-bottom:1%;">Save marks to local storage</button>';
	document.getElementById('mainContainer').innerHTML += '&nbsp;&nbsp;&nbsp;<button onclick="loadFromLocal();" class="btn btn-default" style="margin-bottom:1%;">Calculate from local storage</button>';
	document.getElementById('mainContainer').style.display = '';

	html = '';
	for (var i = 1; i <= numberOfSems; i++) {
		html += '<div class="panel panel-info" id="sem'+i+'Panel">'+
					'<div class="panel-heading">Semester '+i+'</div>'+
					'<div class="panel-body" id="sem'+i+'PanelBody">'+
					'</div>'+
				'</div>';
	}
	html += '<div class="panel panel-warning" id="overallPanel">'+
					'<div class="panel-heading">Overall</div>'+
					'<div class="panel-body" id="overallPanelBody">'+
					'</div>'+
				'</div>';
	html += '<div class="panel panel-success" id="dropPanel">'+
					'<div class="panel-heading">After Dropping</div>'+
					'<div class="panel-body" id="dropPanelBody">'+
					'</div>'+
				'</div>';
	document.getElementById('dataContainer').innerHTML = html;
};

var calculate = function(option) {
	// var marks = [], percentage = [];
	var totalMarks=0, totalCredits=0;
	var minA = 100, minH = 100, minC = 100;
	var minAName, minHName, minCName;

	//for all sems in range
	for (var sem = 0; sem < numberOfSems; sem++) {
		var semMarks = 0;	//store the total marks for current sem
		for (var i = 0; i < 5; i++)		//iterate over the theory subjects for current sem
		{
			//get value from input field or local file based on choice
			var value, sno;
			if (option)
				value = document.getElementById(''+(sem+1)+''+branches[branchName][sem].subjects.theory[i].sno).value;
			else {
				sno = branches[branchName][sem].subjects.theory[i].sno;
				value = myMarks[sem][sno];
				// console.log("sno: " + sno + ", value: " + value);
			}

			// if (debug && value == 0)
			// 	value = Math.random()*100;

			semMarks += branches[branchName][sem].subjects.theory[i].credits*value;

			//find minimum marks for each category
			if (branches[branchName][sem].subjects.theory[i].category == 'A') {
				if (value < minA) {
					minA = value;
					minAName = branches[branchName][sem].subjects.theory[i].name;
				}
			}
			else if (branches[branchName][sem].subjects.theory[i].category == 'C') {
				if (value < minC) {
					minC = value;
					minCName = branches[branchName][sem].subjects.theory[i].name;
				}
			}
			else if (branches[branchName][sem].subjects.theory[i].category == 'H') {
				if (value < minH) {
					minH = value;
					minHName = branches[branchName][sem].subjects.theory[i].name;
				}
			}
		}
		for (var i = 0; i < branches[branchName][sem].subjects.practical.length; i++)	//iterate over the practical subjects
		{
			var value, sno;
			if (option)
				value = document.getElementById(''+(sem+1)+''+branches[branchName][sem].subjects.practical[i].sno).value;
			else {
				sno = branches[branchName][sem].subjects.practical[i].sno;
				value = myMarks[sem][sno];
			}

			// if (debug && value == 0)
			// 	value = Math.random()*100;

			semMarks += branches[branchName][sem].subjects.practical[i].credits*value;
		}
		// marks[sem] = semMarks;
		var semPercent = semMarks/branches[branchName][sem].totalCredits;	//percentage for current sem
		// percentage[sem] = semPercent;

		totalMarks += semMarks;		//store total weighted marks
		totalCredits += branches[branchName][sem].totalCredits;		//store total credits

		console.log("Sem "+(sem+1)+" Marks: " + semMarks);
		console.log("Percent: " + semPercent);
		var semContainer = document.getElementById('sem'+(sem+1)+'PanelBody');
		semContainer.innerHTML = '';
		semContainer.innerHTML += '<h4>Sem ' +(sem+1)+ ' Total Marks: ' +semMarks+ '</h4>';
		semContainer.innerHTML += '<h4>Sem ' +(sem+1)+ ' Credits: ' +branches[branchName][sem].totalCredits+ '</h4>';
		semContainer.innerHTML += '<h3>Sem ' +(sem+1)+ ' Percentage: ' +semPercent+ '</h3>';
	}
	// totalMarks = 9848;
	var netPercentage = totalMarks/totalCredits;	//find net percentage
	// console.log("Total Marks: " + totalMarks);
	// console.log("Net Percentage: " + netPercentage);

	var dataContainer = document.getElementById('overallPanelBody');
	dataContainer.innerHTML = '';
	dataContainer.innerHTML += '<h4>Overall Total Marks: ' +totalMarks+ '</h4>';
	dataContainer.innerHTML += '<h4>Overall Credits: ' +totalCredits+ '</h4>';
	dataContainer.innerHTML += '<h3>Overall Percentage: ' +netPercentage+ '</h3>';

	// minH = 51; minA = 54; minC = 49;

	if (minH == 100) {
		minH = 0;
		totalCredits += 4;
	}
	if (minA == 100) {
		minA = 0;
		totalCredits += 4;
	}
	if (minC == 100) {
		totalCredits += 4;
		minC = 0;
	}

	dataContainer = document.getElementById('dropPanelBody');
	dataContainer.innerHTML = '';
	dataContainer.innerHTML += "<h5>Dropping:<br>Humanities- "+minHName+", "+minH+ 
		"<br>Applied- "+minAName+", "+minA+ "<br>Core- "+minCName+", "+minC+ "</h5><br>";
	// console.log("Dropping - H: "+minHName+", "+minH+ ". A: "+minAName+", "+minA+ ". C: "+minCName+", "+minC);

	//drop the subjects with minimum marks
	console.log("Total marks: "+totalMarks);
	totalMarks = totalMarks - (minH*4);
	totalMarks = totalMarks - (minA*4);
	totalMarks = totalMarks - (minC*4);

	// totalMarks = totalMarks - ((minH+minA+minC)*4);
	console.log("After drop marks: " + totalMarks);
	totalCredits = totalCredits - 12;
	netPercentage = totalMarks/totalCredits;
	// console.log("After Dropping - Total Marks: " + totalMarks);
	// console.log("Net Percentage: " + netPercentage);

	dataContainer.innerHTML += '<h4>Overall Total Marks (after dropping): ' +totalMarks+ '</h4><br>';
	dataContainer.innerHTML += '<h4>Overall Credits (after dropping): ' +totalCredits+ '</h4><br>';
	dataContainer.innerHTML += '<h3>Percentage (after dropping): ' +netPercentage+ '</h3>';

	document.getElementById('dataContainer').style.display = '';
	window.scrollTo(0,100);
	if (option != 0)
		saveToLocal();
};

var saveToLocal = function() {
	var userMarks = [
		{"sem" : 1, "TH1" : 0, "TH2" : 0, "TH3" : 0, "TH4" : 0,	"TH5" : 0,
		"PR1" : 0,	"PR2" : 0,	"PR3" : 0,	"PR4" : 0, "PR5" : 0, "VS1" : 0, "VS2" : 0},
		{"sem" : 2, "TH1" : 0, "TH2" : 0, "TH3" : 0, "TH4" : 0,	"TH5" : 0,
		"PR1" : 0,	"PR2" : 0,	"PR3" : 0,	"PR4" : 0, "PR5" : 0, "VS1" : 0, "VS2" : 0},
		{"sem" : 3, "TH1" : 0, "TH2" : 0, "TH3" : 0, "TH4" : 0,	"TH5" : 0,
		"PR1" : 0,	"PR2" : 0,	"PR3" : 0,	"PR4" : 0, "PR5" : 0, "VS1" : 0, "VS2" : 0},
		{"sem" : 4, "TH1" : 0, "TH2" : 0, "TH3" : 0, "TH4" : 0,	"TH5" : 0,
		"PR1" : 0,	"PR2" : 0,	"PR3" : 0,	"PR4" : 0, "PR5" : 0, "VS1" : 0, "VS2" : 0},
		{"sem" : 5, "TH1" : 0, "TH2" : 0, "TH3" : 0, "TH4" : 0,	"TH5" : 0,
		"PR1" : 0,	"PR2" : 0,	"PR3" : 0,	"PR4" : 0, "PR5" : 0, "VS1" : 0, "VS2" : 0},
		{"sem" : 6, "TH1" : 0, "TH2" : 0, "TH3" : 0, "TH4" : 0,	"TH5" : 0,
		"PR1" : 0,	"PR2" : 0,	"PR3" : 0,	"PR4" : 0, "PR5" : 0, "VS1" : 0, "VS2" : 0},
		{"sem" : 7, "TH1" : 0, "TH2" : 0, "TH3" : 0, "TH4" : 0,	"TH5" : 0,
		"PR1" : 0,	"PR2" : 0,	"PR3" : 0,	"PR4" : 0, "PR5" : 0, "VS1" : 0, "VS2" : 0},
		{"sem" : 8, "TH1" : 0, "TH2" : 0, "TH3" : 0, "TH4" : 0,	"TH5" : 0,
		"PR1" : 0,	"PR2" : 0,	"PR3" : 0,	"PR4" : 0, "PR5" : 0, "VS1" : 0, "VS2" : 0}
	];
	for (var sem = 0; sem < numberOfSems; sem++) {
		var value, sno;
		for (var i = 0; i < 5; i++)		//iterate over the theory subjects for current sem
		{
			sno = branches[branchName][sem].subjects.theory[i].sno;
			value = document.getElementById(''+(sem+1)+''+branches[branchName][sem].subjects.theory[i].sno).value;
			if (value == "")
				value = 0;
			userMarks[sem][sno] = parseInt(value);
		}
		for (var i = 0; i < branches[branchName][sem].subjects.practical.length; i++)	//iterate over the practical subjects
		{
			sno = branches[branchName][sem].subjects.practical[i].sno;
			value = document.getElementById(''+(sem+1)+''+branches[branchName][sem].subjects.practical[i].sno).value;
			if (value == "")
				value = 0;
			userMarks[sem][sno] = parseInt(value);
		}
	}
	console.log(userMarks);
	var jsonString = JSON.stringify(userMarks);
	window.localStorage.setItem('userMarks_'+branchName, jsonString);
	sendToServer(jsonString);
};

var loadFromLocal = function() {
	myMarks = JSON.parse(window.localStorage.getItem('userMarks_'+branchName));
	if (!myMarks) {
		alert("No saved data found for selected branch!");
		return;
	}
	for (var sem = 0; sem < numberOfSems; sem++) {
		var value, sno;
		for (var i = 0; i < 5; i++)		//iterate over the theory subjects for current sem
		{
			sno = branches[branchName][sem].subjects.theory[i].sno;
			document.getElementById(''+(sem+1)+''+branches[branchName][sem].subjects.theory[i].sno).value = myMarks[sem][sno];
		}
		for (var i = 0; i < branches[branchName][sem].subjects.practical.length; i++)	//iterate over the practical subjects
		{
			sno = branches[branchName][sem].subjects.practical[i].sno;
			document.getElementById(''+(sem+1)+''+branches[branchName][sem].subjects.practical[i].sno).value = myMarks[sem][sno];
		}
	}
	calculate(0);
};

var sendToServer = function(userMarks) {
	var postData = {"num_sems": parseInt(numberOfSems), "branch": branchName, "section": parseInt(sectionId), "marks": userMarks};
	$.ajax({
		type: "POST",
		url: '/store_marks',
		data: postData,
		success: function(data) {
        	console.log("Stored marks: " + data); 
    	},
		dataType: 'json'
	});
}