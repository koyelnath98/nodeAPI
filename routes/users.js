var express = require('express')
var app = express()
var ObjectId = require('mongodb').ObjectId

// TO SHOW LIST OF USERS
app.get('/', function(req, res, next) {	
	// fetch and sort users collection by id in descending order
	req.db.collection('users').find().sort({"_id": -1}).toArray(function(err, result) {
		
		if (err) {
			req.flash('error', err)
			res.render('user/list', {
				title: 'User List', 
				data: ''
			})
		} else {
			// render to views/user/list.ejs template file
			res.render('user/list', {
				title: 'User List', 
				data: result
			})
		}
	})
})

// SHOW ADD USER FORM
app.get('/add', function(req, res, next){	
	// render to views/user/add.ejs
	res.render('user/add', {
		title: 'Add New User',
		fname: '',
		lname: '',
		email: ''		
	})
})


app.post('/add', function(req, res, next){	
	req.assert('fname', 'Name is required').notEmpty()           //Validate fname
	req.assert('lname', 'lname is required').notEmpty()             //Validate lname
    req.assert('email', 'A valid email is required').isEmail()  //Validate email

    var errors = req.validationErrors()
    
    if( !errors ) {   
		var user = {
			fname: req.sanitize('fname').escape().trim(),
			lname: req.sanitize('lname').escape().trim(),
			email: req.sanitize('email').escape().trim()
		}
				 
		req.db.collection('users').insert(user, function(err, result) {
			if (err) {
				req.flash('error', err)
				
				res.render('user/add', {
					title: 'Add New User',
					fname: user.fname,
					lname: user.lname,
					email: user.email					
				})
			} else {				
				req.flash('success', 'Data added successfully!')
				
				// redirect to user list plname				
				res.redirect('/users')
				
				
			}
		})		
	}
	else {   
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})				
		req.flash('error', error_msg)		
		
        res.render('user/add', { 
            title: 'Add New User',
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email
        })
    }
})

// SHOW EDIT USER FORM
app.get('/edit/(:id)', function(req, res, next){
	var o_id = new ObjectId(req.params.id)
	req.db.collection('users').find({"_id": o_id}).toArray(function(err, result) {
		if(err) return console.log(err)
		
		// if user not found
		if (!result) {
			req.flash('error', 'User not found with id = ' + req.params.id)
			res.redirect('/users')
		}
		else { 
			res.render('user/edit', {
				title: 'Edit User', 
				//data: rows[0],
				id: result[0]._id,
				fname: result[0].fname,
				lname: result[0].lname,
				email: result[0].email					
			})
		}
	})	
})


app.put('/edit/(:id)', function(req, res, next) {
	req.assert('fname', 'Name is required').notEmpty()           //Validate FIRSTNAME
	req.assert('lname', 'lname is required').notEmpty()             //Validate LASTNAME
    req.assert('email', 'A valid email is required').isEmail()  //Validate email

    var errors = req.validationErrors()
    
    if( !errors ) {  
		var user = {
			name: req.sanitize('fname').escape().trim(),
			lname: req.sanitize('lname').escape().trim(),
			email: req.sanitize('email').escape().trim()
		}
		
		var o_id = new ObjectId(req.params.id)
		req.db.collection('users').update({"_id": o_id}, user, function(err, result) {
			if (err) {
				req.flash('error', err)
				
				// render to views/user/edit.ejs
				res.render('user/edit', {
					title: 'Edit User',
					id: req.params.id,
					fname: req.body.fname,
					lname: req.body.lname,
					email: req.body.email
				})
			} else {
				req.flash('success', 'Data updated successfully!')
				
				res.redirect('/users')
				
			}
		})		
	}
	else {   //Display errors to user
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)
		
        res.render('user/edit', { 
            title: 'Edit User',            
			id: req.params.id, 
			lname: req.body.lname,
			fname: req.body.fname,
			email: req.body.email
        })
    }
})

// DELETE USER
app.delete('/delete/(:id)', function(req, res, next) {	
	var o_id = new ObjectId(req.params.id)
	req.db.collection('users').remove({"_id": o_id}, function(err, result) {
		if (err) {
			req.flash('error', err)
			// redirect to users list plname
			res.redirect('/users')
		} else {
			req.flash('success', 'User deleted successfully! id = ' + req.params.id)
			// redirect to users list plname
			res.redirect('/users')
		}
	})	
})

module.exports = app
