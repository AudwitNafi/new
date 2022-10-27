const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'project'
});

function check(){
    var arr = document.getElementsByClassName("form-check-input")

    for(var i=0; i<arr.length; i++)
    {
        arr[i].checked = true
    }
}
