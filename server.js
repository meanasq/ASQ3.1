// Include App Modules
var express 		 = require('express'),
	mongoose 		 = require('mongoose'),
	bodyParser 		 = require('body-parser'),
	cookieParser 	 = require('cookie-parser'),
	passPort 		 = require('passport'),
	localStrategy 	 = require('passport-local').Strategy,
	session 		 = require('express-session'),
	async 			 = require("async"),
	mailer 			 = require("nodemailer"),
	propertiesReader = require("properties-reader"),
	connectFlash 	 = require('connect-flash'),
	path 			 = require('path'),
	fs 			 	 = require('fs'),
	ejs  			 = require('ejs'),
	crypto 			 = require("crypto");	

// Initialize Objects
var app = express();

var pageDir 		= path.resolve(__dirname + '/views/partials'),
	templatesDir 	= path.resolve(__dirname + '/views/templates');

var properties = propertiesReader('applicationResources.file');

// DB Connect
mongoose.connect('mongodb://localhost:27017/mean-test');

// Landing Page
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/client/views/index.html')
});

// Redirects
app.use('/js', express.static(__dirname + '/client/js'));
app.use('/css', express.static(__dirname + '/client/views/css'));
app.use('/images', express.static(__dirname + '/client/views/images'));
app.use('/fonts', express.static(__dirname + '/client/views/fonts'));
app.use('/pages', express.static(__dirname + '/client/views/pages'));

// DBmodels
var userModel 		= require('./DBmodels/userModel.js'),
	questionModel 	= require('./DBmodels/questionModel.js'),
	GKModel 		= require('./DBmodels/GKModel.js'),
	SQMModel 		= require('./DBmodels/SQMModel.js'),
	EPModel 		= require('./DBmodels/EPModel.js'),
	MAModel 		= require('./DBmodels/MAModel.js'),
	SVVModel 		= require('./DBmodels/SVVModel.js'),
	SCMModel 		= require('./DBmodels/SCMModel.js'),
	PMModel 		= require('./DBmodels/PMModel.js'),
	historyModel 	= require('./DBmodels/historymodels.js'),
	certModel 		= require('./DBmodels/certModel.js');

// store and retrieve the static information.
var emailTransport 		  	= properties.get('app.email.transport'),
	serviceUser 		  	= properties.get('SMTP.service.user'),
	servicePasswd 		  	= properties.get('SMTP.service.passwd'),

	emailFrom 			  	= properties.get('app.email.from'),
	bodyText 			  	= properties.get('app.email.body.text'),
	bodyHtml 			  	= properties.get('app.email.body.html'),
	emailFooter 		  	= properties.get('app.email.body.footer'),

	emailChangePwdSubject 	= properties.get('app.email.subjectChgPwd'),	
	emailSubject 		  	= properties.get('app.email.subject'),
	pwdResetSubject 		= properties.get("app.email.subjectResetPwd"),	
	resetConfirmSubject 	= properties.get("app.email.subjectConfirmResetPwd"),

	resetPwdTemplate 		= properties.get("app.email.resetPwdTem"),
	regTemplate 			= properties.get("app.email.registrationTem"),
	chgPwdTemplate 			= properties.get("app.email.changePwdTem"),
	resetConfirmTemplate 	= properties.get("app.email.resetConfirmTem");

// Utils
function randomNfromM(N, A) {
	var i = 0, j, arr = [], M = A.length - 1, result = [];
	while (i < N) {
		j = Math.floor(Math.random() * (M + 1));
		if (arr.indexOf(j) < 0) {
			arr.push(j);
			i++
		}
	}
	for (var k = 0; k < arr.length; k++) {
		result.push(A[arr[k]]._id);

	}
	return result
}

function getQuestionFromModel(Model, num) {
	return function(callback) {
		Model.find({}, {
			_id : 1
		}, function(err, result) {
			var questionIDs = randomNfromM(num, result);
			Model.find({
				_id : {	$in : questionIDs }
			}, function(err, result) {
				callback(null, result);
			})
		});
	}
}

//Added for ASQ Upgrade2.0.To get all the questions from DBmodels in ASQ.
function randomAllNfromM(A) {
	var i = 0, j, arr = [], M = A.length - 1, result = [];
	while (i < M) {
		j = Math.floor(Math.random() * (M + 1));
		if (arr.indexOf(j) < 0) {
			arr.push(j);
			i++
		}
	}
	for (var k = 0; k < arr.length; k++) {
		result.push(A[arr[k]]._id);

	}
	return result
}

function getAllQuestionFromModel(Model) {
	return function(callback) {
		Model.find({}, {
			_id : 1
		}, function(err, result) {
			var questionIDs = randomAllNfromM(result);
			Model.find({
				_id : {
					$in : questionIDs
				}
			}, function(err, result) {
				callback(null, result);
			})
		});
	}
}

//Function added for ASQ Upgrade2.0 to encrypt the passwords in ASQ Portal.
function encrypt(pass){
	  var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
	  var crypted = cipher.update(pass,'utf8','hex')
	  
	  crypted += cipher.final('hex');
	  return crypted;
	}

//Function added for ASQ Upgrade2.0 to decrypt the passwords from ASQ Portal.
function decrypt(pass){
	  var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
	  var dec = decipher.update(pass,'hex','utf8')

	  dec += decipher.final('utf8');
	  return dec;
}

//Function added for ASQ Upgrade2.0 to render the HTML email templates in ASQ Portal.
function renderTemplate (name, data) {	  
	  var tpl = fs.readFileSync(path.resolve(__dirname, './email-templates', name + '.html')).toString();
	  return ejs.render(tpl, data);
}

// register middle-ware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(cookieParser());
//Modified by Srinivas Thungathurti for ASQ Upgrade2.0.Added session timeout for application (approx 3 hours by considering quiz time i.e 2 hours).
app.use(session({
	secret 				: "secret",
	resave 				: "",
	saveUninitialized 	: "",
	cookie 				: {maxAge:3 * 60 * 60 * 1000}
}));

app.use(passPort.initialize());
app.use(passPort.session());

// passport config
passPort.use(new localStrategy({
		usernameField 	: 'email',
		passwordField 	: 'password',
		session 		: false
	}, function(username, password, done) {
		// authentication method
		userModel.findOne({
			email : username,
			password : encrypt(password)
			}, function (err, user) {
		        if (err) return done(err);
		        if (user) {
		        	var date = new Date();
		        	var formatDate = date.getMonth() + 1 + '/' + date.getDate() + '/' +  date.getFullYear();
		            if (new Date(user.expiryDate) < new Date(formatDate)) {
		            	console.log(user.email+" expired in ASQ Exam Portal.");
		                return done(err+" expired");
		            }
		            return done(null, user)
		        }
		        return  done(null, false)
		    }
		)
	}
));

passPort.serializeUser(function(user, done) {
	done(null, user);
});

passPort.deserializeUser(function(user, done) {
	done(null, user);
});

// routes
app.post('/register', function(req, res) {
	var password = encrypt(req.body.password);
	req.body.password = password;
	userModel.findOne({
		email : req.body.email
		}, function(err, result) {
		
			if (result)
				res.send("0");
			else {
				var newUser = new userModel(req.body);
				newUser.save(function(err, user) {
					req.login(user, function() {
						res.json(user);
					});
	             //sendMail(user,'registration',null);
				//send email after successful registration.
				var smtpTransport = mailer.createTransport(emailTransport, {
					service : "Gmail",
					auth : {
						user : serviceUser,
						pass : servicePasswd
					}
				});
				
				var data = {
					email 	 : user.email,
					password : decrypt(user.password),
					url 	 : "http://"+req.headers.host+"/login",
					name 	 : user.firstName
				}
				
				var mail = {
					from 	: emailFrom,
					to 		: req.body.email,
					subject : emailSubject,
					html 	: renderTemplate(regTemplate,data)
				}

				smtpTransport.sendMail(mail, function(error, response) {
					if (error)
						console.log(error);
					else
						console.log("Message sent: " + response.message);				
					
					smtpTransport.close();
				});
			    //End email communication here.
			})
		}
	});	
});

//Modified by Srinivas Thungathurti
app.post('/login', 
	passPort.authenticate('local'),
	function(req, res) {
		var user = req.user;
		res.json(user);	
	}
);
//End changes for ASQ Upgrade2.0.

app.get('/status', function(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(200).json({
      status: false
    });
  }
  res.status(200).json({
    status: true
  });
});

app.post('/logout', function(req, res) {
	console.log(req.user.email + " has logged out.")
	req.logout();
	res.sendStatus(200);
});

app.get('/loggedin', function(req, res) {
	//Modified Srinivas Thungathurti for ASQ Upgrade2.0.Fixed for not to display the pages after successful logout.
	if(req.user != undefined) {
		userModel.find({
		email : req.user.email
	}, function(err, result) {
			res.send(req.isAuthenticated() ? result[0] : "0")
		});
	} else
		res.send("0");
});

//Added for ASQ Upgrade2.0.Forgot Password functionality.
app.post('/forgot', function(req, res) {
	crypto.randomBytes(20, function(err, buf) {
		token = buf.toString('hex');
		console.log("token "+token);
		
		userModel.findOne({ email: req.body.email }, function(err, user) {
			if (!user) {
				console.log('No account with that email address exists.');
				return res.status(404).send('NotFound');
			}
			
			userModel.update({
				email : req.body.email
				}, {
					resetPasswordToken 	 : token,
					resetPasswordExpires : Date.now() + 3600000
				}, false, function(err) {
					res.send(err);
				})
				
				//Send forgot password email
				var smtpTransport = mailer.createTransport(emailTransport, {
					service: 'Gmail',
			        auth   : {
			        	user: serviceUser,
			        	pass: servicePasswd
			        }
				});
				
				var data = {
					url 	: "http://"+req.headers.host+"/reset/"+token,
					name 	: user.firstName
				}
			    
			    var mailOptions = {
					to 		: req.body.email,
					from 	: emailFrom,
					subject : pwdResetSubject,
					html 	: renderTemplate(resetPwdTemplate,data)
				};
				
				smtpTransport.sendMail(mailOptions, function(err,response) {
			        if (err) {
						console.log(err);
						res.send(err);
					} else {
						console.log('An e-mail has been sent to ' + req.body.email + ' with further instructions.');
						console.log("Message sent: " + response.message);
					}
			    	
			    	smtpTransport.close();
			    	//res.send("success");
				}
			);
		});
	});
});

app.get('/reset/:token', function(req, res) {
	userModel.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires : { $gt: new Date() } }, function(err, user) {
	    if (!user) {
	      console.log('Password reset token is invalid or has expired.');
	      return res.send('Password reset URL is invalid or has expired.');
	    }
	 res.redirect('/reset?token='+req.params.token);
	});
});

app.post('/reset', function(req, res) {
	userModel.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires : { $gt: new Date() } }, function(err, user) {
        if (!user) {
          console.log('Password reset token is invalid or has expired.');
          return res.send('Password reset URL is invalid or has expired.');
        }
        user.password = req.body.password;
        user.resetPasswordToken = "";
        user.resetPasswordExpires = "";
        userModel.update({
			email : user.email
		}, {
			password 			 : encrypt(user.password),
			resetPasswordToken 	 : user.resetPasswordToken,
			resetPasswordExpires : user.resetPasswordExpires
		}, false, function(err) {
			if(err) res.send(err);
			else console.log('Success! Your password has been changed.');
		})
		//Send email after succeesful password reset.
		var smtpTransport = mailer.createTransport(emailTransport, {
	        service : 'Gmail',
	        auth 	: {
	        	user 	: serviceUser,
	        	pass 	: servicePasswd
	        }
	      });
	      var data = {
	    		  email 	: user.email,
				  password 	: req.body.password,
				  name 		: user.firstName,
				  url 		: "http://"+req.headers.host+"/login"
	      }
	      var mailOptions = {
	        to 		: user.email,
	        from 	: emailFrom,
	        subject : resetConfirmSubject,
	        html 	: renderTemplate(resetConfirmTemplate,data)
	      };
	      smtpTransport.sendMail(mailOptions, function(err,response) {
	    	 if (err) {
				console.log(err);
				res.send(err);
			 } else {
				console.log("Message sent: " + response.message);
			 }
	    	 smtpTransport.close();
	    	 res.send("success");
	      });
      });
});
//End Forgot Password functionality here.

app.get('/quiz', function(req, res) {
	var jobs = [ 
			getQuestionFromModel(EPModel, 11),
			getQuestionFromModel(GKModel, 11),
			getQuestionFromModel(MAModel, 11),
			getQuestionFromModel(PMModel, 11),
			getQuestionFromModel(SCMModel, 12),
			getQuestionFromModel(SQMModel, 12),
			getQuestionFromModel(SVVModel, 12) 
		];

	async.parallel(jobs, function(err, result) {
		var returnVal = [];
		result.forEach(function(value, index, array) {
			for ( var obj in value) {
				returnVal.push(value[obj])
			}
			if (index == array.length - 1) {
				res.send(returnVal)
			}
		})
	})
});

//Added by Srinivas Thungathurti for ASQ Upgrade2.0.Get all the questions on Admin questions screen for Update/Delete.
app.post('/getQuestions', function (req, res) {
    var cat;
    switch(req.body.category){
        case "GKModel": case "gk":
            cat = GKModel;
            break;                    
        case "SQMModel": case "sqm":
            cat = SQMModel;
            break;                    
        case "EPModel": case "ep":
            cat = EPModel;
            break;
        case "PMModel": case "pm":
            cat = PMModel;
            break;
        case "MAModel": case "mam":
            cat = MAModel;
            break;
        case "SVVModel": case "SVV":
            cat = SVVModel;
            break;                    
        case "SCMModel": case "scm":
            cat = SCMModel;
            break;        
    }
    async.series([getAllQuestionFromModel(cat)], function (err,result) {
        res.send(result[0]);
    })
});

app.post('/practice', function(req, res) {
	var jobs = [];
	console.log(req.body);
	if (req.body.GK) {
		jobs.push(getQuestionFromModel(GKModel, req.body.GK))
	}
	if (req.body.EP) {
		jobs.push(getQuestionFromModel(EPModel, req.body.EP))
	}
	if (req.body.MA) {
		jobs.push(getQuestionFromModel(MAModel, req.body.MA))
	}
	if (req.body.PM) {
		jobs.push(getQuestionFromModel(PMModel, req.body.PM))
	}
	if (req.body.SQM) {
		jobs.push(getQuestionFromModel(SQMModel, req.body.SQM))
	}
	if (req.body.SCM) {
		jobs.push(getQuestionFromModel(SCMModel, req.body.SCM))
	}
	if (req.body.SVV) {
		jobs.push(getQuestionFromModel(SVVModel, req.body.SVV))
	}
	async.parallel(jobs, function(err, result) {
		var returnVal = [];
		result.forEach(function(value, index, array) {
			for ( var obj in value) {
				returnVal.push(value[obj])
			}
			if (index == array.length - 1) {
				res.send(returnVal)
			}
		})
	})

});

app.post('/saveRecord', function(req, res) {
	var newRecord = new historyModel(req.body);
	var key1 = req.body.key;
	newRecord.save(function(err, result) {
		if (err) {
			res.send('error')
		} else {
			res.send(result)
		}
	})
});

app.post('/getRecord', function(req, res) {
	var query = req.body.date ? {
		email 	: req.body.email,
		date 	: req.body.date
	} : {
		email : req.body.email
	}
	historyModel.find(query).exec(function(err, result) {
		res.send(result)
	})
});

app.post('/getRecordForChart', function (req,res) {
    //get practice history logic
    historyModel.find({
        email:req.body.email,
        mode:req.body.mode
    })
        .sort({time: -1})
        .limit(req.body.number)
        .exec(function (err, result) {
        res.send(result)
    })

});

//Added by Srinivas Thungathurti for ASQ Upgrade2.0.Get all the Users information for Admin User Info screen.
app.post('/getUsers', function(req, res) {
	if(req.body.email != undefined) {
	var query = req.body.search ? {
		email : req.body.email
	} : {
		email : req.body.email
	}
	userModel.find(query).exec(function(err, result) {
		res.send(result)
	})
	} else {
	userModel.find().exec(function(err, result) {
		res.send(result)
	})
	}
});

app.post('/getUserInfo', function(req, res) {
	userModel.findOne({
		email : req.body.search
	}, function(err, result) {
		res.send(result);
	});
});

app.post('/getQuestionInfo', function(req, res) {
	    console.log("Returning all the question info for selected Category");
		res.sendStatus(200);
});

app.post('/addQuestionDet', function(req, res) {
	var $catgeory;
	switch(req.body.category){
	    case "gk":
	    	$catgeory = GKModel;
	        break;
	    case "sqm":
	    	$catgeory = SQMModel;
	        break;
	    case "ep":
	    	$catgeory = EPModel;
	        break;
	    case "pm":
	    	$catgeory = PMModel;
	        break;
	    case "mam":
	    	$catgeory = MAModel;
	        break;
	    case "svv":
	    	$catgeory = SVVModel;
	        break;
	    case "scm":
	    	$catgeory = SCMModel;
	        break;
	}
	var questionRecord = new $catgeory(req.body);
	questionRecord.save(function(err, result) {
		if (err) {
			res.send('error')
		} else {
			res.send(result)
		}
	})
});

app.post('/updateQuestionDet', function(req, res) {
	var $cat;
	switch(req.body.category){
	    case "gk":
	        $cat = GKModel;
	        break;
	    case "sqm":
	    	$cat = SQMModel;
	        break;
	    case "ep":
	    	$cat = EPModel;
	        break;
	    case "pm":
	    	$cat = PMModel;
	        break;
	    case "mam":
	    	$cat = MAModel;
	        break;
	    case "svv":
	    	$cat = SVVModel;
	        break;
	    case "scm":
	    	$cat = SCMModel;
	        break;
	}
	$cat.findOne({
		_id : req.body._id
	}, function(err, result) {
		if (result && result._id) {
			$cat.update({
				_id : req.body._id
			}, {
				content : req.body.content,
				choices : JSON.parse(req.body.choices),
				correctChoice : req.body.correctCh
			}, false, function(err, num) {
				if (num.ok = 1) {
					console.log('success');
					res.send('success')
				} else {
					console.log('error');
					res.send('error')
				}
			})
		}
	})
});

//Added by Srinivas Thungathurti for ASQ Upgrade2.0.deleteUserInfo function added to delete the user profile using Admin User Management screen.
app.post('/deleteUserInfo', function(req, res) {
	userModel.remove({
		email : req.body.email
	}, function(err, num) {
		if(num.ok =1) {
			historyModel.remove({
				username: req.body.email
			}, function(err,num) {
				if (num.ok = 1) {
					console.log('success');
					res.send('success')
				} else {
					console.log('error');
					res.send('error')
				}
			})
		}
	});
});

app.post('/deleteQuestionDet', function(req, res) {
	var $cat;
	switch(req.body.category){
    case "gk":
        $cat = GKModel;
        break;
    case "sqm":
    	$cat = SQMModel;
        break;
    case "ep":
    	$cat = EPModel;
        break;
    case "pm":
    	$cat = PMModel;
        break;
    case "mam":
    	$cat = MAModel;
        break;
    case "svv":
    	$cat = SVVModel;
        break;
    case "scm":
    	$cat = SCMModel;
        break;
	}
	$cat.remove({
		_id : req.body._id,
		category : req.body.category
	}, function(err, num) {
		if (num.ok = 1) {
			console.log('success');
			res.send('success')
		} else {
			console.log('error');
			res.send('error')
		}
	});
});

// Updated by Srinivas Thungathurti for ASQ Upgrade 2.0.
app.post('/updateProfile', function(req, res) {
	userModel.findOne({
		email : req.body.email
	}, function(err, result) {
		if (result && result.email) {
			userModel.update({
				email : req.body.email
			}, {
				firstName 	: req.body.firstName,
				lastName 	: req.body.lastName,
				address1 	: req.body.address1,
				address2 	: req.body.address2,
				city 		: req.body.city,
				state 		: req.body.state,
				zipcode 	: req.body.zipcode,
				birthDate 	: req.body.birthDate
			}, false, function(err, num) {
				if (num.ok = 1) {
					console.log(req.body.email + ' User Profile Updated');
					res.send('success')
				} else {
					console.log('Error updaring User Profile ' + req.body.email);
					res.send('error')
				}
			})
		}
	})
});

//Added by Srinivas Thungathurti for ASQ Upgrade2.0.saveUserProfile function added to update the user profile information using Admin User Management screen.
app.post('/saveUserProfile', function(req, res) {
	userModel.findOne({
		email : req.body.email
	}, function(err, result) {
		if (result && result.email) {
			userModel.update({
				email : req.body.email
			}, {
				firstName 	: req.body.firstName,
				lastName 	: req.body.lastName,
				address1 	: req.body.address1,
				address2 	: req.body.address2,
				city 		: req.body.city,
				state 		: req.body.state,
				zipcode 	: req.body.zipcode,
				birthDate 	: req.body.birthDate,
				expiryDate 	: req.body.expiryDate,
				role 		: req.body.role,
				activeIn 	: req.body.activeIn				
			}, false, function(err, num) {
				if (num.ok = 1) {
					console.log('success');
					res.send('success')
				} else {
					console.log('error');
					res.send('error')
				}
			})
		}
	})
});

app.post('/addCertDet', function(req, res) {
	certModel.findOne({
		name : req.body.name
	}, function(err, result) {
		if (result) {
			res.send("0");
		} else {
			var newCert = new certModel(req.body);
			newCert.save(function(err, result) {
				if (err) {
					res.send('error')
				} else {
					res.send("1");
				}
			})
		}
	});
});

//Added by Srinivas Thungathurti for ASQ Upgrade2.0.Get all the Certificate information for Admin Exam Info screen.
app.post('/getCerts', function(req, res) {
	certModel.find().exec(function(err, result) {
		res.send(result)
	})
});

//Added by Srinivas Thungathurti for ASQ Upgrade2.0.deleteCertInfo function added to delete the certifications using Admin Exam Management screen.
app.post('/delCertDet', function(req, res) {
	certModel.remove({
		_id : req.body._id
	}, function(err, num) {
			if (num.ok = 1) {
				console.log('success');
				res.send('success')
			} else {
				console.log('error');
				res.send('error')
			}
	})
});

//Added by Srinivas Thungathurti for ASQ Upgrade 2.0.Change password fields are moved from Profile and added part of new Screen (Change Password).
app.post('/updatePassword', function (req, res) {
	userModel.find({email:req.body.email, password:encrypt(req.body.oldPassword)}, function (err, result) {
        if (result && result.length != 0) {
            userModel.update({email:req.body.email},{$set:{password:encrypt(req.body.password2)}},false,function (err, num){
                if (num.ok == 1){
                	console.log('success');
                	//sendMail(null,'changePassword',decrypt(req.body.password2));
                	//send email after successful registration.
    				var smtpTransport = mailer.createTransport(emailTransport, {
    					service : "Gmail",
    					auth : {
    						user : serviceUser,
    						pass : servicePasswd
    					}
    				});
    				var data = {
						password : req.body.password2,
						name 	 : result.firstName,
						url 	 : "http://"+req.headers.host+"/login"
    			            
    				}
    				var mail = {
    					from 	: emailFrom,
    					to 		: req.body.email,
    					subject : emailChangePwdSubject,
    					html 	: renderTemplate(chgPwdTemplate,data)
    				}

    				smtpTransport.sendMail(mail, function(error, response) {
    					if (error) {
    						console.log(error);
    					} else {
    						console.log("Message sent: " + response.message);
    					}
    				   smtpTransport.close();
    				});
    			    //End email communication here.
                    res.send('success')
                } else {
                	console.log('error');
                    res.send('error')
                }
            })
        } else {
            res.send('incorrect')
        }
    })
});
//End changes for ASQ Upgrade 2.0. 

app.listen(5137, function() {
	console.log("Server Lisening on Port 5137")
});