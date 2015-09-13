function drawChart(data) {
  var semesters = [];
  for(var i = 0; i < data[0].length; i++) semesters.push("Sem" + (i + 1));

  $('#chart').highcharts({
    title: {
      text: 'Percentage Throughout The Semesters',
      x: -20 //center
    },
    xAxis: {
      categories: semesters
    },
    yAxis: {
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
    },
    tooltip: {
      valueSuffix: '%'
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      borderWidth: 0
    },
    series: [
    { name: "Percentage", data: data[0]},
    { name: "Aggregate", data: data[1] }
    ]
  });
}
