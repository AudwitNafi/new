const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs')
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
    res.render('login', {prob:""})
})

app.get('/register', (req, res)=>{
    res.render('register', {prob:""})
})


app.post('/auth', async function(request, response) {
	// Capture the input fields
	const {email, password} = request.body
	// Ensure the input fields exists and are not empty
	if (email && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM users WHERE email = ?', [email], async function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0 && await bcrypt.compare(password, results[0].password)) {
				
				// Authenticate the user
				request.session.loggedin = true;
				request.session.name = results[0].name;
				request.session.email = email;
				request.session.bio = results[0].bio;
				request.session.userid = results[0].ID;
				console.log(request.session.userid);
				response.redirect('/home')
			} else {
				
				response.render('login', {prob:"incorrect"})
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
						// res.send('Email already registered!')
						res.render('register', { prob : "email" })
						res.end();
					} else if (password != passwordConfirm) {
						// res.send('Passwords do not match!')
						res.render('register', { prob : "pass" })
						res.end();
					}
					else {
						let hashedPassword = await bcrypt.hash(password, 8);
							console.log(hashedPassword);

						connection.query('INSERT INTO users SET ?', { name: name, bio:bio, email: email, password: hashedPassword }, (err, results) => {
							if (err) {
								console.log(err);
							} else {
								// res.send('User registered');
								res.render('login', {prob:"success"})
								res.end();
							}
						})
					}
				}
			}
		)
	}
	else{
		res.render('register', { prob : "details" })
	}
})


app.get("/problems", function(request, response, next){

	var query = "SELECT * FROM problems";

	connection.query(query, function(error, data){

		if(error)
		{
			throw error; 
		}
		else
		{
			response.render('sample_data', {title:'Problems', action:'list', sampleData:data, userid: request.session.userid});
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
				else if (results.length > 0) 
						res.render('add', {data:{profileName: req.session.name, prob: "empty"}})
					
				else {
					connection.query('INSERT INTO problems SET ?', { name: name, link: link, website: website, category: category }, (err, results) => {
						if (err) {
							console.log(err);
						} else {
							res.send('Problem Added');
							res.end();
						}
					})
				}
			}
		)
	}
	else{
		res.render('add', {data:{profileName: req.session.name, prob: "details"}})
	}
})

app.get('/progress', (req, res)=>{
	res.render('progress', {data:{profileName: req.session.name}})
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
					console.log('bio', bio);
					response.render('profile', {data: { name: name, email: email, profileName: name, bio: bio }} );
				} else {
					// Not logged in
					response.redirect('/login');
				}
				response.end();
				
			}
		})
	}
);



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