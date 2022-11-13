const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs')
const path = require('path');
const e = require('express');

const app = express()


const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'project',
	multipleStatements: true
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
				// console.log(request.session.userid);
				response.redirect('/home')
			} else {
				
				response.render('login', {prob:"incorrect"})
			}			
			response.end();
		});
	} else {
		response.render('login', { prob : "details" })
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

// app.get("/problems", function(request, response){
// 	connection.query("SELECT * FROM problems ORDER BY id DESC", function(error, data){
// 		if(error) throw error; 
// 		else
// 		{
// 			connection.query('SELECT * FROM solvedby', (err, results)=>{
// 				if(err) throw err
// 				console.log(results);
// 				profile = request.session.name
// 				response.render('sample_data', { title : 'Problems', action: 'List', sampleData: data, profileName: profile, solvecount: results});
// 			})
// 		}
// 	})
// });

app.get('/problems', (req, res)=>{
	connection.query('SELECT problemID FROM solve WHERE userID=?',  [req.session.userid], (err, solvedID)=>{
		let solved = []
		for(let i=0; i<solvedID.length; i++) solved.push(solvedID[i].problemID)
		
		var sql = `SELECT * FROM problems WHERE id IN ('${solved.join("','")}') ORDER BY id ASC`
		connection.query(sql, (err, solve)=>{
			var sql1 = `SELECT * FROM problems WHERE id NOT IN ('${solved.join("','")}') ORDER BY id ASC`
			connection.query(sql1, (err, unsolved)=>{
				connection.query(`SELECT * FROM solvedby WHERE problemID IN ('${solved.join("','")}') `, (err, ssc)=>{
					connection.query(`SELECT * FROM solvedby WHERE problemID NOT IN ('${solved.join("','")}') `, (err, usc)=>{
						let profile = req.session.name
						res.render('sample_data', { title : 'Problems', action: 'List', solve: solve, unsolved: unsolved, ssc: ssc, usc: usc, profileName: profile})
					})
				})
			})
		})
	})
})


// app.get('/test', (req, res)=>{
// 	connection.query("SELECT * FROM problems", function(err, result1) {
// 		connection.query("SELECT * FROM solvedby", function(err, result2) {
// 			connection.query("SELECT problemID FROM solve WHERE userID=?", [req.session.userid], (err, result3)=>{
// 				console.log(result3);
// 				res.render('test', { title : 'Problems', action: 'List', problems: result1, solved : result2, s: result3 })
// 			})
// 			;
// 		});
// 	  });
// })

app.get('/leaderboards', (req, res)=>{
	connection.query('SELECT * FROM users ORDER BY solved DESC', (err, results)=>{
		if(err) throw err
		let profile = req.session.name 
		res.render('leaderboards', {user: results, title: 'Leaderboards', profileName: profile})
	})
})

// app.get('/test', (req, res)=>{
// 	connection.query('SELECT * FROM problems', function(err, result1) {
// 		let a = []
// 		for(let i=0; i<result1.length; i++)
// 			connection.query('SELECT count(userID) as sc FROM solve WHERE problemID=?',[req.session.userid], function(err, result2) {
// 				a.push(result2)
// 		});
// 	  });
// 	  console.log(a);
// 	  res.render('test', { problems: result1, solved : a });
// })

app.post("/problems", (req, res)=>{
	const probid = req.body.probid;
	console.log(probid);
	connection.beginTransaction(function(err) {
		if (err) { throw err; }
		console.log(probid);
		connection.query('INSERT INTO solve SET ?', {userID: req.session.userid, problemID: probid}, function (error, results, fields) {
		  if (error) {
			return connection.rollback(function() {
			  throw error;
			});
		  }
		  connection.query('UPDATE users SET solved=solved+1 WHERE id=?', req.session.userid, function (error, results, fields) {
			if (error) {
			  return connection.rollback(function() {
				throw error;
			  });
			}
			connection.query('UPDATE solvedby SET solveCount=solveCount+1 WHERE problemID=?', [probid], function (error, results, fields) {
				if (error) {
				  return connection.rollback(function() {
					throw error;
				  });
				}
				connection.commit(function(err) {
					if (err) {
						return connection.rollback(function() {
						throw err;
						});
					}
					console.log('success!');
				});
		  	});
		});
		res.redirect('/problems')
	  });
	})
})

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
					// connection.query('INSERT INTO problems SET ?', { name: name, link: link, website: website, category: category }, (err, results) => {
					// 	if (err) {
					// 		console.log(err);
					// 	} else {
					// 		res.send('Problem Added');
					// 		res.end();
					// 	}
					// })
					// let probCount = 0
					// connection.query('SELECT COUNT(probid) as probcount FROM problems', (err, probs)=>{
					// 	if(err) throw err;
					// 	console.log(probs);
					// 	probCount = probs.probcount
					// })
					connection.beginTransaction((err)=>{
						if(err) throw err
						connection.query('INSERT INTO problems SET ?', {name: name, link: link, website: website, category: category}, function (error, results, fields) {
							if (error) {
							  return connection.rollback(function() {
								throw error;
							  });
							}
							connection.query('INSERT INTO solvedby SET solveCount=0', (err)=>{
								if (error) {
									return connection.rollback(function() {
									  throw error;
									});
								}
								connection.commit(function(err) {
									if (err) {
										return connection.rollback(function() {
										throw err;
										});
									}
									console.log('success!');
								});
							})
						})
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
	const { id } = req.body
	let profile = req.session.name
	let cat = ["Algorithms", "Data Structures", "Brute Force", "Mathematics", "Graphs", "Hashing", "Dynamic Programming", "Strings", "Binary Search", "Probabilities"]
	let count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	let userid = req.session.userid
	for(let i=0; i<10;i++)
	{
		connection.query('SELECT COUNT(problemID) as sc FROM solve WHERE userID=? AND problemID IN(SELECT id FROM PROBLEMS WHERE CATEGORY=?)', [userid, cat[i]], (err, results)=>{
			// console.log(results);
			count[i] = results[0].sc
			// console.log(results[0].sc);
			if(i==9){
				console.log(count);
				res.render('progress', {data: {profileName: profile, solve: count}})
			}
		})
	}
	// console.log(count);
	// res.render('progress', {data: {profileName: req.session.name}})
})

app.put('/rank', (req, res)=>{
    res.render()
})

app.get('/profile', (req, res)=>{
	res.redirect('/profile/'+req.session.userid)
})

app.get('/profile/:id', function(request, response) {
	const { id } = request.params
	// console.log(request.session.name);
	// console.log(request.session.email);
	let name, email, bio
	name = request.session.name
	email = request.session.email
	bio = request.session.bio
	connection.query('SELECT solved FROM users WHERE id = ?', [id], async(err, results)=>{
			if (err) {
				console.log(err);
			} 
			else {
				if (results.length > 0) {
					console.log(results)
				}
				if (request.session.loggedin) {
					console.log('bio', bio);
					console.log(results);
					response.render('profile', {data:{ name: name, email: email, bio: bio, solved: results[0] }} );
				} else {
					// Not logged in
					response.redirect('/login');
				}
				response.end();
				
			}
		})
	}
);

app.get('/edit', (req, res)=>{
	res.render('edit', {data:{profileName: req.session.name}})
})

app.post('/edit', (req, res)=>{
	const {name, bio} = req.body
	if(name && bio)
	{
		connection.query('SELECT * FROM users WHERE name=?', name, (err, results)=>{
			if(err) throw err;
			if(results.length>0) res.render('edit', {data:{profileName: req.session.name, prob: "empty"}})
			else {
				connection.query('UPDATE users SET ? WHERE id=?',[{name: name, bio: bio}, req.session.userid] , (err, result)=>{
					req.session.name = name;
					req.session.bio = bio;
					res.redirect('/profile')
				})
			}
		})
	}
	else {
		res.render('edit', {data:{profileName: req.session.name, prob: "details"}})
	}
})

app.get('/logout',(req,res)=>{
	req.session.destroy(function (err) {
	  	res.redirect('/'); //Inside a callback… bulletproof!
	 });
})

app.get('/faq', (req, res)=>{
	if(req.session.loggedin) res.render('faq', {log: 1})
	else res.render('faq', {log: 0})
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