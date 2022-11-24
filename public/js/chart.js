let arr = document.querySelectorAll('.yValues')
var xValues = ["Algorithms", "Data Structures", "Brute Force", "Mathematics", "Graphs", "Greedy Algo", "Dynamic Prog", "Sortings", "Recursion", "Number Theory"];
var yValues = [arr[0].innerHTML, arr[1].innerHTML, arr[2].innerHTML, arr[3].innerHTML, arr[4].innerHTML, arr[5].innerHTML, arr[6].innerHTML, arr[7].innerHTML, arr[8].innerHTML, arr[9].innerHTML];
var barColors = [
  "#b91d47",
  "#00aba9",
  "#2b5797",
  "#e8c3b9",
  "#1e7145",
  "#9C254D",
  "#C539B4",
  "#EB6440",
  "#6C4AB6",
  "#624F82"
];

new Chart("myChart", {
  type: "doughnut",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },
  options: {
    title: {
      display: true,
      text: "Your Problem Solving Progress"
    }
  }
});