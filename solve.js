const mysql = require('mysql');
const express = require('express');

const app = express()

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'project'
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs')

function solve(checkbox)
{
    if(checkbox.checked==true)
    {
        var problemName = checkbox.parentNode.parentNode.parentNode.firstElementChild.firstElementChild.innerHTML
        connection.query("INSERT INTO")
    }
}