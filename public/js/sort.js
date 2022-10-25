var tags = ["Graphs", "Data Structures", "Brute Force", "Algorithms", "Dynamic Programming"];
var table = document.getElementsByClassName("problem-table");

var tableHeaderRowCount = 1;
var rowCount = table.rows.length;
for (var i = tableHeaderRowCount; i < rowCount; i++) {
            table.deleteRow(tableHeaderRowCount);
    }

function sortOnLoad()
{
    var inputValue = document.querySelector(".input-search").value;
    var table = document.querySelector(".problem-table");
    var tr = table.getElementsByTagName("tr");
    for (i = 1; i < tr.length; i++){
        td = tr[i].getElementsByTagName("td")[3];
            if(td.textContent===inputValue){
                tr[i].style.display = "";
            } 
            else {
                tr[i].style.display = "none";
            }
        }
}


function sort() {
        var input, filter, table, tr, td, i, txtValue;
        input = document.querySelector(".input-search");
        filter = input.value.toUpperCase();
        table = document.querySelector(".problem-table");
        tr = table.getElementsByTagName("tr");
        for (i = 1; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[3];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                    } else {
                        tr[i].style.display = "none";
                    }
            }       
        }
 }

 function sortBySite()
 {
    var input, filter, table, tr, td, i, txtValue;
        input = document.querySelector("#site");
        filter = input.value.toUpperCase();
        table = document.querySelector(".problem-table");
        tr = table.getElementsByTagName("tr");
        for (i = 1; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[2];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                    } else {
                        tr[i].style.display = "none";
                    }
            }       
        }
 }