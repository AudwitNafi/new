const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const path = require('path');

const app = express()


const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'project'
});

app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, './public')));
app.use(express.static(path.join(__dirname, './public/css')));
app.use(express.static(path.join(__dirname, './public/js')));

app.set('view engine', 'ejs')

app.get('/home', (req, res)=>{
	if(req.session.loggedin) res.render('home', {data:{profileName: req.session.name}});
	else res.render('login')
})

app.get('/', (req, res)=>{
	// console.log(req.session.loggedin);
	res.render('index')
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.get('/register', (req, res)=>{
    res.render('register')
})


app.post('/auth', function(request, response) {
	// Capture the input fields
	const {name, password} = request.body
	// Ensure the input fields exists and are not empty
	if (name && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM users WHERE name = ? AND password = ?', [name, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				
				// Authenticate the user
				request.session.loggedin = true;
				request.session.name = name;
				request.session.email = results[0].email;
				request.session.id = results[0].ID;
				// Redirect to home page
				// response.redirect('/profile/'+results[0].ID);
				response.redirect('/home')
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});



app.post('/reg', async (req, res)=>{
	console.log(req.body);
	const {name, bio, email, password, passwordConfirm} = req.body;
	if (name && email && password && passwordConfirm) {
		connection.query('SELECT email from users WHERE email = ?', [email], async (err, results) => {
				if (err) {
					console.log(err);
				} 
				else {
					if (results.length > 0) {
						res.send('Email already registered!')
					} else if (password != passwordConfirm) {
						res.send('Passwords do not match!')
					}
				}
			}
		)
	}
	else{
		res.send('Enter all details')
	}

	connection.query('INSERT INTO users SET ?', { name: name, bio:bio, email: email, password: password }, (err, results) => {
		if (err) {
			console.log(err);
		} else {
			res.send('User registered');
			res.end();
		}
	})
})

// app.get('/problems', (req, res)=>{
// 	connection.query("SELECT * FROM problems", (err, results)=>{
// 		if(err) throw err
// 		else{
// 			res.render('problems', {data:{profileName: req.session.name, action: 'list', problems: results}})
// 		}
// 	})
	
// })

app.get("/problems", function(request, response, next){

	var query = "SELECT * FROM problems";

	connection.query(query, function(error, data){

		if(error)
		{
			throw error; 
		}
		else
		{
			response.render('sample_data', {title:'Problems', action:'list', sampleData:data});
		}

	});

});

app.get('/add', (req, res)=>{
	res.render('add', {data:{profileName: req.session.name}})
})

app.post('/add', (req, res)=>{
	const {name, link, website, category} = req.body;
	if (name && link && website && category) {
		connection.query('SELECT name from problems WHERE name = ?', [name], async (err, results) => {
				if (err) {
					console.log(err);
				} 
				else {
					if (results.length > 0) {
						res.send('Problem is already on the website!')
					}
				}
			}
		)
	}
	else{
		res.send('Enter all problem details')
	}

	connection.query('INSERT INTO problems SET ?', { name: name, link: link, website: website, category: category }, (err, results) => {
		if (err) {
			console.log(err);
		} else {
			res.send('Problem Added');
			res.end();
		}
	})
})

app.put('/rank', (req, res)=>{
    res.render()
})

app.get('/profile', (req, res)=>{
	res.redirect('/profile/'+req.session.id)
})

app.get('/profile/:id', function(request, response) {
	const { id } = request.params
	// console.log(request.session.name);
	// console.log(request.session.email);
	let name, email, bio
	connection.query('SELECT * FROM users WHERE id = ?', [id], async(err, results)=>{
			if (err) {
				console.log(err);
			} 
			else {
				if (results.length > 0) {
					console.log(results)
				}
				name = request.session.name
				email = request.session.email
				bio = request.session.bio
				if (request.session.loggedin) {
					// Output username
					// console.log('name', name);
					// console.log('email', email);
					response.render('profile', {data: { name: name, email: email, profileName: name, bio: bio }} );
				} else {
					// Not logged in
					response.redirect('/login');
				}
				response.end();
				
			}
		})
	}
	// If the user is loggedin
	
);



// app.delete('/logout', (req, res) => {
// 	req.logOut()
// 	res.redirect('/login')
// })

app.get('/logout',(req,res)=>{
	req.session.destroy(function (err) {
	  	res.redirect('/'); //Inside a callback… bulletproof!
	 });
  })

app.listen(4000, ()=>{
    console.log('Server running on port 4000');
})



/*
/ --> index/login
/register --> POST = user
/profile/:userID -->  GET = user
/rank --> PUT --> user
*/