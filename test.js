var express = require('express');
const mysql = require('mysql')
const app = express()
app.set('view engine', 'ejs')
const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'test'
});



app.get("/", function(request, response, next){

	var query = "SELECT * FROM sample_data ORDER BY id DESC";

	connection.query(query, function(error, data){

		if(error)
		{
			throw error; 
		}
		else
		{
			response.render('sample_data', {title:'Node.js MySQL CRUD Application', action:'list', sampleData:data});
		}

	});

});

app.listen(5000, ()=>{
    console.log('Server running on port 5000');
})