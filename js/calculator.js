var branchName, numberOfSems, sectionId;
var $branchSelect = document.getElementById('branchSelect');
var $semSelect = document.getElementById('semSelect');
var $sectionSelect = document.getElementById('sectionSelect');
var $mainContainer = document.getElementById('mainContainer');
var $dataContainer = document.getElementById('dataContainer');

var showForm = function() {
  branchName = $branchSelect.options[$branchSelect.selectedIndex].value;
  numberOfSems = $semSelect.options[$semSelect.selectedIndex].value;
  sectionId = $sectionSelect.options[$sectionSelect.selectedIndex].value;

  if (branchName == "ece" && numberOfSems > 5) {
    alert("The data for ECE after 5th semester isn't available. Please choose a different option.");
  } else if (branchName != "coe" && numberOfSems > 6) {
    alert("7th and 8th sem data is only available for COE right now. That data will be added soon.");
  } else if (sectionId == 0) {
    alert("Please choose your section.");
  } else
    loadForm();
};

var loadForm = function() {
  $dataContainer.style.display = 'none';
  $mainContainer.innerHTML = "";

  var html;
  if(numberOfSems > 1) {
    html = "<div class='container-header'><button class='btn btn-default mainContainerButtons' id='toggleIndex'>&lt;</button> Please enter your marks</div>"+
    "<div class='row'>"+ "<div class='col-md-2 index'>";
    for(var semNum = 1; semNum <= numberOfSems; semNum++) html += "<li class='index-item' data-target='#marksOf"+semNum+"'>Semester " + semNum + "</li>";
    html += '</div><div class="col-md-10" id="forms">';
  } else {
    html = "<div class='container-header'>Please enter your marks</div><div class='row'><div class='col-md-12' id='forms'>";
  }

  for (var semNum = 1; semNum <= numberOfSems; semNum++) {
    html += '<table class="table table-hover sem-marks" id="marksOf'+semNum+'"><caption> Semester'+semNum+
      '</caption><thead><tr><th>#</th><th>Code</th><th>Name</th><th>Credits</th><th>Marks</th></tr></thead><tbody>';
    for (var i = 0; i < branches[branchName][semNum-1].subjects.theory.length; i++) {
      html += '<tr>' +
        '<td>'+branches[branchName][semNum-1].subjects.theory[i].sno+'</td>' +
        '<td>'+branchName.toUpperCase()+branches[branchName][semNum-1].subjects.theory[i].code+'</td>' +
        '<td>'+branches[branchName][semNum-1].subjects.theory[i].name+'</td>' +
        '<td>'+branches[branchName][semNum-1].subjects.theory[i].credits+'</td>' +
        '<td><div class="label2"><input type="number" id="' +semNum+branches[branchName][semNum-1].subjects.theory[i].sno+ '"/></div></td>' +
        '</tr>';
    }
    for (var i = 0; i < branches[branchName][semNum-1].subjects.practical.length; i++) {
      html += '<tr>' +
        '<td>'+branches[branchName][semNum-1].subjects.practical[i].sno+'</td>' +
        '<td>'+branchName.toUpperCase()+branches[branchName][semNum-1].subjects.practical[i].code+'</td>' +
        '<td>'+branches[branchName][semNum-1].subjects.practical[i].name+'</td>' +
        '<td>'+branches[branchName][semNum-1].subjects.practical[i].credits+'</td>' +
        '<td><div class="label2"><input type="number" id="' +semNum+branches[branchName][semNum-1].subjects.practical[i].sno+ '"/></div></td>' +
        '</tr>';
    }
    html += '</tbody></table>';
  }
  html += "</div></div>";
  $mainContainer.innerHTML += (html + '<hr/><div class="text-center">'+
    '<button onclick="calculate(1);" class="btn btn-default mainContainerButtons">Calculate</button>' +
    '<button onclick="loadFromLocal()" class="mainContainerButtons btn btn-default">Show Last Calculated Marks</button>' +
    '<button onclick="importFromLocal()" class="mainContainerButtons btn btn-default">Import marks</button>' +
    '<input type="file" accept=".json" id="fileElem" style="display:none" onchange="importJSON(this.files)"></div>');

  $mainContainer.style.display = 'block';
  window.scrollTo(0, $mainContainer.offsetTop - 20);
  if(numberOfSems > 1) {
    $('.sem-marks').css('display', 'none');
    $('#marksOf1').css('display', 'table');
    $('.index-item:first-child').addClass('active');
    $('#toggleIndex').on('click', function(e) {
      var $e = e.currentTarget;
      if($e.innerHTML === '&lt;') {
        $e.innerHTML = '&gt;';
        $('.index').hide('fast');
        $('.sem-marks').css('display', 'table');
        $('.index-item.active').removeClass('active');
      } else {
        $e.innerHTML = '&lt;';
        $('.index').show('fast');
        $('.sem-marks').css('display', 'none');
        $('#marksOf1').css('display', 'table');
        $('.index-item:first-child').addClass('active');
      }
    });
    $('.index-item').on('click', function(e) {
      var $e = $(e.currentTarget);
      $('.sem-marks').css('display', 'none');
      $($e.attr('data-target')).css('display', 'block');
      $('.index-item.active').removeClass('active');
      $e.addClass('active');
      window.scrollTo(0, $mainContainer.offsetTop - 20);
    });
  }
  //html = '<div class="panel panel-warning" id="overallPanel">'+
    //'<div class="panel-heading">Overall</div>'+
    //'<div class="panel-body" id="overallPanelBody">'+
    //'</div>'+
    //'</div>';
  //$dataContainer.innerHTML = html;
};

var calculate = function(option) {
  var htmlString = '<div class="container-header"><button onclick="exportToLocal()" class="mainContainerButtons btn btn-default">Export</button>Report Card</div><div id="chart"></div><table class="table table-hover"><thead><tr>' + 
    '<th>Semester</th><th>Marks</th><th>Credits</th><th>Percentage</th></tr></thead><tbody>';

  // var marks = [], percentage = [];
  var semPercentages = [], aggregatePercentages = [];
  var totalMarks=0, totalCredits=0;
  var minMarksIn = { A : { code : 0, name : "", marks : 100 }, C : { code : 0, name : "", marks : 100 }, H : { code : 0, name : "", marks : 100 } };

  //for all sems in range
  for (var sem = 0; sem < numberOfSems; sem++) {
    var semMarks = 0;	//store the total marks for current sem
    for (var i = 0; i < branches[branchName][sem].subjects.theory.length; i++)		//iterate over the theory subjects for current sem
    {
      //get value from input field or local file based on choice
      var value, sno;
      if (option == 1) // when calculate button is pressed
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
        if (value < minMarksIn.A.marks) {
          minMarksIn.A.marks = value;
          minMarksIn.A.name = branches[branchName][sem].subjects.theory[i].name;
          minMarksIn.A.code = branchName.toUpperCase() + "-" + branches[branchName][sem].subjects.theory[i].code;
        }
      }
      else if (branches[branchName][sem].subjects.theory[i].category == 'C') {
        if (value < minMarksIn.C.marks) {
          minMarksIn.C.marks = value;
          minMarksIn.C.name = branches[branchName][sem].subjects.theory[i].name;
          minMarksIn.C.code = branchName.toUpperCase() + "-" + branches[branchName][sem].subjects.theory[i].code;
        }
      }
      else if (branches[branchName][sem].subjects.theory[i].category == 'H') {
        if (value < minMarksIn.H.marks) {
          minMarksIn.H.marks = value;
          minMarksIn.H.name = branches[branchName][sem].subjects.theory[i].name;
          minMarksIn.H.code = branchName.toUpperCase() + "-" + branches[branchName][sem].subjects.theory[i].code;
        }
      }
    }
    for (var i = 0; i < branches[branchName][sem].subjects.practical.length; i++)	//iterate over the practical subjects
    {
      var value, sno;
      if (option == 1) // when calculate button is pressed
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
    semPercentages.push(semPercent);

    totalMarks += semMarks;		//store total weighted marks
    totalCredits += branches[branchName][sem].totalCredits;		//store total credits

    aggregatePercentages.push(totalMarks/totalCredits);

    htmlString += '<tr><td>' + (sem + 1) + '</td><td>' + semMarks + '</td><td>' + branches[branchName][sem].totalCredits + 
      '</td><td>' + semPercent+ '</td></tr>';
    console.log("Sem "+(sem+1)+" Marks: " + semMarks);
    console.log("Percent: " + semPercent);
    //var $semContainer = document.getElementById('sem'+(sem+1)+'PanelBody');
    //$semContainer.innerHTML = '';
    //$semContainer.innerHTML += '<h4>Sem ' +(sem+1)+ ' Total Marks: ' +semMarks+ '</h4>';
    //$semContainer.innerHTML += '<h4>Sem ' +(sem+1)+ ' Credits: ' +branches[branchName][sem].totalCredits+ '</h4>';
    //$semContainer.innerHTML += '<h3>Sem ' +(sem+1)+ ' Percentage: ' +semPercent+ '</h3>';
  }

  // totalMarks = 9848;
  var netPercentage = totalMarks/totalCredits;	//find net percentage
  // console.log("Total Marks: " + totalMarks);
  // console.log("Net Percentage: " + netPercentage);

  //var $dataContainer = document.getElementById('overallPanelBody');
  htmlString += '</tbody></table><strong>Before Dropping</strong>' + 
    JSON2DL({'Overall Total Marks' : totalMarks, 'Overall Credits' : totalCredits, 'Overall Percentage' : netPercentage});

  //$dataContainer.innerHTML += '<h4>Overall Total Marks: ' +totalMarks+ '</h4>';
  //$dataContainer.innerHTML += '<h4>Overall Credits: ' +totalCredits+ '</h4>';
  //$dataContainer.innerHTML += '<h3>Overall Percentage: ' +netPercentage+ '</h3>';

  // minMarksIn.H.marks = 51; minMarksIn.A.marks = 54; minMarksIn.C.marks = 49;

  if (minMarksIn.H.marks == 100) {
    minMarksIn.H.marks = 0;
    totalCredits += 4;
  }
  if (minMarksIn.A.marks == 100) {
    minMarksIn.A.marks = 0;
    totalCredits += 4;
  }
  if (minMarksIn.C.marks == 100) {
    totalCredits += 4;
    minMarksIn.C.marks = 0;
  }
  
  for(var type in minMarksIn) {
    if(minMarksIn[type].marks > netPercentage) {
      minMarksIn[type].name = '<em>*' + minMarksIn[type].name + '</em>';
    }
  }

  //dataContainer = document.getElementById('dropPanelBody');
  //dataContainer.innerHTML = '';
  //dataContainer.innerHTML += "<h5>Dropping:<br>Humanities- "+minMarksIn.H.name+", "+minMarksIn.H.marks+ 
  //"<br>Applied- "+minMarksIn.A.name+", "+minMarksIn.A.marks+ "<br>Core- "+minMarksIn.C.name+", "+minMarksIn.C.marks+ "</h5><br>";
  // console.log("Dropping - H: "+minMarksIn.H.name+", "+minMarksIn.H.marks+ ". A: "+minMarksIn.A.name+", "+minMarksIn.A.marks+ ". C: "+minMarksIn.C.name+", "+minMarksIn.C.marks);

  //drop the subjects with minimum marks
  console.log("Total marks: "+totalMarks);
  totalMarks = totalMarks - (minMarksIn.H.marks*4);
  totalMarks = totalMarks - (minMarksIn.A.marks*4);
  totalMarks = totalMarks - (minMarksIn.C.marks*4);

  // totalMarks = totalMarks - ((minMarksIn.H.marks+minMarksIn.A.marks+minMarksIn.C.marks)*4);
  console.log("After drop marks: " + totalMarks);
  totalCredits = totalCredits - 12;
  netPercentage = totalMarks/totalCredits;
  // console.log("After Dropping - Total Marks: " + totalMarks);
  // console.log("Net Percentage: " + netPercentage);

  //dataContainer.innerHTML += '<h4>Overall Total Marks (after dropping): ' +totalMarks+ '</h4><br>';
  //dataContainer.innerHTML += '<h4>Overall Credits (after dropping): ' +totalCredits+ '</h4><br>';
  //dataContainer.innerHTML += '<h3>Percentage (after dropping): ' +netPercentage+ '</h3>';

  htmlString +=  "<strong>Dropping following Subjects</strong>" + 
    JSON2DL({ 'Humanities' : minMarksIn.H.name + ' ' + minMarksIn.H.code + ' (' + minMarksIn.H.marks + ')', 
      'Applied' : minMarksIn.A.name + ' '+ minMarksIn.A.code + ' (' + minMarksIn.A.marks + ')', 
        'Core' : minMarksIn.C.name + ' ' + minMarksIn.C.code + ' (' + minMarksIn.C.marks + ')' }); 

  htmlString += '<strong>After Dropping</strong>'+
  JSON2DL({'Overall Total Marks' : totalMarks, 'Overall Credits' : totalCredits, 'Overall Percentage' : netPercentage}) +
  '<em><strong>*Note:</strong> Above dropped subjects have lowest marks in respective category,' +
  'you may get a better percentage without dropping a subject if the marks scored in it are greater than your aggregate</em>';

  $dataContainer.innerHTML = htmlString;
  document.getElementById('dataContainer').style.display = 'block';
  if(numberOfSems > 3) {
    drawChart([semPercentages, aggregatePercentages]);
  }
  if (option == 1)	// on click of calculate button
  saveToLocal(true);
  window.scrollTo(0, $dataContainer.offsetTop - 20);
};
var saveToLocal = function(serverFlag) {
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
    for (var i = 0; i < branches[branchName][sem].subjects.theory.length; i++)		//iterate over the theory subjects for current sem
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
  if (serverFlag)
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
    for (var i = 0; i < branches[branchName][sem].subjects.theory.length; i++)		//iterate over the theory subjects for current sem
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

var exportToLocal = function() {
  myMarks = window.localStorage.getItem('userMarks_'+branchName);
  if (!myMarks) {
    alert("No saved data found for selected branch!");
    return;
  }
  var data = "text/json;charset=utf-8," + encodeURIComponent(myMarks);
  $('<a id="exportJSON" href="data:' + data + '" download="nsitulator_marks.json"></a>').appendTo('#mainContainer');
  $('#exportJSON')[0].click();
  $('#exportJSON').remove();
}

var importFromLocal = function() {
  $('#fileElem').click();
}

var importJSON = function(files) {
  var jsonFile = files[0];
  if (jsonFile) {
    var reader = new FileReader();
    reader.onload = function(e) {
      // Reset the file input box value to allow loading of same file again
      document.getElementById('fileElem').value = '';
      console.log("Loaded file - name: "+jsonFile.name+", size: "+jsonFile.size+", type: "+jsonFile.type);
      // This is not working on Ubuntu
      // if (jsonFile.type.indexOf('json') == -1) {
      // 	alert("Invalid file format. Please import correct file");
      // 	return;
      // }
      var fileContent = e.target.result;
      if (verifyJSONFile(fileContent) == false) {
        alert("Invalid file contents. Please import correct file");
        return;
      }
      myMarks = JSON.parse(fileContent);
      for (var sem = 0; sem < numberOfSems; sem++) {
        var value, sno;
        for (var i = 0; i < branches[branchName][sem].subjects.theory.length; i++)		//iterate over the theory subjects for current sem
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
      calculate(2);
      window.localStorage.setItem('userMarks_'+branchName, JSON.stringify(myMarks));
    }
    reader.readAsText(jsonFile);
  }
  else {
    alert("Failed to load file");
  }
}

// Check if the JSON file contains all the keys corresponding to all subjects
var verifyJSONFile = function(content) {
  var json = JSON.parse(content);
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
  for (sem in userMarks) {
    for (key in userMarks[sem]) {
      // console.log("key: "+key);
      if (!json[sem].hasOwnProperty(key))
        return false;
    }
  }
  return true;
}


function JSON2DL(data) {
  var html = "<dl class='dl-horizontal'>";
  for(var key in data) {
    html += '<dt>' + key + '</dt><dd>' + data[key] + '</dd>';
  }
  return html + "</dl>";
}
