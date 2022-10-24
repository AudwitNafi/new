const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const passport = require('passport')
const flash = require('express-flash')
const methodOverride = require('method-override')
const path = require('path');
const { response } = require('express');
const app = express()

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  name => users.find(user => user.name === name),
  id => users.find(user => user.id === id)
)

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'KnapsackDB'
});

app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './public')));
app.use(express.static(path.join(__dirname, './public/css')));
app.use(express.static(path.join(__dirname, './public/js')));

app.set('view engine', 'ejs')

app.get('/', (req, res)=>{
	console.log(req.session.loggedin);
	res.render('index')
})

app.get('/login', checkNotAuthenticated, (req, res)=>{
    res.render('login')
})

app.post('/auth', checkNotAuthenticated, passport.authenticate('local', {
	successRedirect: '/profile',
	failureRedirect: '/login',
	failureFlash: true
}))

// app.post('/auth', function(request, response) {
// 	// Capture the input fields
// 	const {name, password} = request.body
// 	// Ensure the input fields exists and are not empty
// 	if (name && password) {
// 		// Execute SQL query that'll select the account from the database based on the specified username and password
// 		connection.query('SELECT * FROM users WHERE name = ? AND password = ?', [name, password], function(error, results, fields) {
// 			// If there is an issue with the query, output the error
// 			if (error) throw error;
// 			// If the account exists
// 			if (results.length > 0) {
// 				// Authenticate the user
// 				request.session.loggedin = true;
// 				request.session.name = name;
// 				// Redirect to home page
// 				response.redirect('/profile/'+results[0].id);
// 			} else {
// 				response.send('Incorrect Username and/or Password!');
// 			}			
// 			response.end();
// 		});
// 	} else {
// 		response.send('Please enter Username and Password!');
// 		response.end();
// 	}
// });

app.post('/reg', checkNotAuthenticated, async (req, res) => {
	console.log(req.body);
	const {name, email, password, passwordConfirm} = req.body;
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

	connection.query('INSERT INTO users SET ?', { name: name, email: email, password: password }, (err, results) => {
		if (err) {
			console.log(err);
		} else {
			res.send('User registered');
			res.end();
		}
	})
  })

// app.post('/reg', async (req, res)=>{
// 	console.log(req.body);
// 	const {name, email, password, passwordConfirm} = req.body;
// 	if (name && email && password && passwordConfirm) {
// 		connection.query('SELECT email from users WHERE email = ?', [email], async (err, results) => {
// 				if (err) {
// 					console.log(err);
// 				} 
// 				else {
// 					if (results.length > 0) {
// 						res.send('Email already registered!')
// 					} else if (password != passwordConfirm) {
// 						res.send('Passwords do not match!')
// 					}
// 				}
// 			}
// 		)
// 	} 

// 	connection.query('INSERT INTO users SET ?', { name: name, email: email, password: password }, (err, results) => {
// 		if (err) {
// 			console.log(err);
// 		} else {
// 			res.send('User registered');
// 			res.end();
// 		}
// 	})
// })

app.get('/register', checkNotAuthenticated, (req, res)=>{
    res.render('register')
})

// app.get('/profile:id', (req, res)=>{
//     const { id } = req.params
// })

// app.put('/rank', (req, res)=>{
//     res.render()
// })

app.get('/profile', function(request, response) {
	const { id } = request.params
	let name, email
	connection.query('SELECT * FROM users WHERE id = ?', [id], async(err, results)=>{
		if (err) {
			console.log(err);
		} 
		else {
			if (results.length > 0) {
				console.log(results[0]);
			}
			name = results[0].name
			email = results[0].email
			if (request.session.loggedin) {
				// Output username
				console.log('name', name);
				console.log('email', email);
				response.render('profile', { data: { name: name, email: email } });
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


function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
	  return next()
	}
  
	res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
	  return res.redirect('/')
	}
	next()
  }

app.delete('/logout', (req, res) => {
	req.logOut()
	res.redirect('/login')
})

// app.get('/logout',(req,res)=>{
// 	req.session.destroy(function (err) {
// 	  	res.redirect('/'); //Inside a callback… bulletproof!
// 	 });
//   })

app.listen(4000, ()=>{
    console.log('Server running on port 4000');
})



/*
/ --> index/login
/register --> POST = user
/profile/:userID -->  GET = user
/rank --> PUT --> user
*/