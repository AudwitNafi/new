let arr = document.querySelectorAll('.yValues')
var xValues = ["Algorithms", "Data Structures", "Brute Force", "Mathematics", "Graphs", "Hashing", "Dynamic Programming", "Sorting", "Recursion", "Number Theory"];

var yValues = [arr[0].innerHTML, arr[1].innerHTML, arr[2].innerHTML, arr[3].innerHTML, arr[4].innerHTML, arr[5].innerHTML, arr[6].innerHTML, arr[7].innerHTML, arr[8].innerHTML, arr[9].innerHTML];
var barColors = ["red", "green","blue","orange","brown","yellow","aqua","purple","magenta", "teal"];

new Chart("myChart", {
    type: "bar",
    data: {
    labels: xValues,
    datasets: [{
        backgroundColor: barColors,
        data: yValues
    }]
    },
    options: {
    legend: {display: false},
    title: {
        display: true,
        text: "Your Problem Solving Progress"
    }
    }
});