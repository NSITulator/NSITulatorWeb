function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}
var numberOfSems = getUrlParameter('sems');
var branchName = getUrlParameter('branch');
if (branchName && numberOfSems) {
  // document.getElementById('optionsContainer').style.display = 'none';
  loadForm();
}
var debug = getUrlParameter('debug') || false;
