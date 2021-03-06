// ------------------------------------------ INITIATE APP MODULES -------------------------------------------------------
var app = angular.module('Mean-ASQ', ['ngRoute', 'highcharts-ng','toggle-switch','timer','ui.bootstrap', 'ngMaterial']);

// ------------------------------------------ BEGIN APP CONFIGURATION ----------------------------------------------------

app.config(function ($routeProvider, $locationProvider, $mdThemingProvider) {

	// Configure Angular Material
	$mdThemingProvider.theme('default').primaryPalette('blue');	

	$routeProvider.
		// Web Pages
		when('/', {
			templateUrl : 'pages/home.html',
			controller 	: 'homeController',
			access 		: { restricted: false }
		}).
		when('/help', {
			templateUrl : 'pages/help.html',
			access 		: { restricted: false }
		}).
		when('/support', {
			templateUrl : 'pages/support.html',			
			access 		: { restricted: false }
		}).
		// Account Control
		when('/register', {
			templateUrl : 'pages/register.html',
			controller 	: 'registerController',
			access 		: { restricted: false }
		}).		
		when('/login', {
			templateUrl : 'pages/signin.html',
			controller 	: 'loginController',			
			access 		: { restricted: false }
		}).		
		when('/forgotPassword', {
			templateUrl : 'pages/forgotpassword.html',
			controller 	: 'loginController',
			access 		: { restricted: false }
		}).
		when('/changepassword', {
			templateUrl : 'pages/changepassword.html',
			controller 	: 'changePasswordController',
			access 		: { restricted: true }
		}).
		when('/profile', {
			templateUrl : 'pages/profile.html',
			controller 	: 'profileController',
			access 		: { restricted: true }
		}).
		// Dashbord Control
		when('/myaccount', {
			templateUrl : 'pages/dashboard.html',
			controller 	: 'dashboardController',
			access 		: { restricted: true }
		}).
		// Test Control				
		when('/exam/:id', {
			templateUrl : 'pages/exam.html',
			controller 	: 'examController',
			access 		: { restricted: true }
		}).
		when('/examinfo', {
			templateUrl : 'pages/examinfo.html',
			controller 	: 'dashboardController',
			access 		: { restricted: true }
		}).
		when('/practice', {
			templateUrl : 'pages/practiceselect.html',
			controller 	: 'practiceSelectController',
			access 		: { restricted: true }
		}).
		when('/practice/:id', {
			templateUrl : 'pages/practice.html',
			controller 	: 'practiceController',
			access 		: { restricted: true }
		}).
		// History Control
		when('/report', {
			templateUrl : 'pages/historydetail.html',
			controller 	: 'reportController',
			access 		: { restricted: true }
		}).
		when('/history', {
			templateUrl : 'pages/history.html',
			controller 	: 'historyController',
			access 		: { restricted: true }
		}).		
		when('/historydetail', {
			templateUrl : 'pages/historydetail.html',
			controller 	: 'historyController',
			access 		: { restricted: true }
		}).
		when('/historydetailsstatus', {
			templateUrl : 'pages/historydetailstatus.html',
			controller 	: 'historyController',
			access 		: { restricted: true }
		}).		
		when('/testdynamic', {
			templateUrl : 'pages/testdynamic.html',
			controller 	: 'historyController',
			access 		: { restricted: true }
		}).		
		// Admin Control
		when('/admin', {
			templateUrl : 'pages/admin.html',
			controller 	: 'adminController',
			access 		: { restricted: true }
		}).
		when('/userlist', {
			templateUrl : 'pages/userlist.html',
			controller 	: 'usersController',
			access 		: { restricted: true }
		}).
		when('/updateuser', {
			templateUrl : 'pages/updateuser.html',
			controller 	: 'usersController',
			access 		: { restricted: true }
		}).
		when('/questionlist', {
			templateUrl : 'pages/questionlist.html',
			controller 	: 'adminController',
			access 		: { restricted: true }
		}).		
		when('/addquestion', {
			templateUrl : 'pages/addquestion.html',
			controller 	: 'adminController',
			access 		: { restricted: true }
		}).
		when('/updatequestion', {
			templateUrl : 'pages/updatequestion.html',
			controller 	: 'adminController',
			access 		: { restricted: true }
		}).
		// Error Redirect
		when('/404', {
			templateUrl : 'pages/404.html',
			access 		: { restricted: false }
		}).
		otherwise({
			templateUrl : 'pages/404.html',
			access 		: { restricted: false }
		});
});

// ----------------------------------------------- END APP CONFIGURATION --------------------------------------------------

// ------------------------------------------ BEGIN INITIATION FUNCTIONS SECTION ------------------------------------------ 
app.run(["$rootScope", "$anchorScroll", "$location", "$route", "AppFunctions",
	function ($rootScope, $anchorScroll, $location, $route, AppFunctions) {
    
	// Execute on Page Change
    $rootScope.$on("$routeChangeSuccess", function() {		
		
		// Scroll to top when Page Loading
		$anchorScroll();				
    });

    // Execute on Begin Page Load
	$rootScope.$on('$routeChangeStart',	function (event, next, current) {
		
		// Get User Details
		AppFunctions.getUser();

		// Get User Status
		AppFunctions.UserStatus().then(function(){
		// Restriction & Login Check
		if ( next.access.restricted && !AppFunctions.userLoggedin ) {
			AppFunctions.showAlert("ERROR !!","You have to be logged in to access this page.");
			$location.path('/login');	
		}
			
		});				
	});    	

    // File / URL not found Redirect
    $rootScope.$on('$routeChangeError', function(event, current, previous, error) {		
		if(error.status === 404)
			$location.path('/404');			
   });

}]);

// ----------------------------------------- END INITIATION FUNCTIONS SECTION -----------------------------------------

// ------------------------------------------ BEGIN CUSTOM FUNCTIONS SECTION ------------------------------------------ 
app.factory('AppFunctions', 
	function($q, $timeout, $mdDialog, $http, $rootScope, $location, $anchorScroll, $route) {
	
	var appFunc = {};

	appFunc.userLoggedin = null;

	// Alert Function
	appFunc.showAlert = function($textTitle, $textMsg) {    
	    $mdDialog.show(
	      $mdDialog.alert()			        
	        .clickOutsideToClose(true)
	        .title($textTitle)
	        .textContent($textMsg)	        
	        .ariaLabel('Alert Dialog')
	        .ok('OK')
		);
	};

	// Populate States Dropdown
	appFunc.states = [
		{ "name": "Alabama",				"abbreviation": "AL" },
		{ "name": "Alaska",					"abbreviation": "AK" },
		{ "name": "Arizona",				"abbreviation": "AZ" },
		{ "name": "Arkansas",				"abbreviation": "AR" },
		{ "name": "California",				"abbreviation": "CA" },
		{ "name": "Colorado",				"abbreviation": "CO" },
		{ "name": "Connecticut",			"abbreviation": "CT" },
		{ "name": "Delaware",				"abbreviation": "DE" },
		{ "name": "District Of Columbia",	"abbreviation": "DC" },
		{ "name": "Florida",				"abbreviation": "FL" },
		{ "name": "Georgia",				"abbreviation": "GA" },
		{ "name": "Hawaii",					"abbreviation": "HI" },
		{ "name": "Idaho",					"abbreviation": "ID" },
		{ "name": "Illinois",				"abbreviation": "IL" },
		{ "name": "Indiana",				"abbreviation": "IN" },
		{ "name": "Iowa",					"abbreviation": "IA" },
		{ "name": "Kansas",					"abbreviation": "KS" },
		{ "name": "Kentucky",				"abbreviation": "KY" },
		{ "name": "Louisiana",				"abbreviation": "LA" },
		{ "name": "Maine",					"abbreviation": "ME" },
		{ "name": "Maryland",				"abbreviation": "MD" },
		{ "name": "Massachusetts",			"abbreviation": "MA" },
		{ "name": "Michigan",				"abbreviation": "MI" },
		{ "name": "Minnesota",				"abbreviation": "MN" },
		{ "name": "Mississippi",			"abbreviation": "MS" },
		{ "name": "Missouri",				"abbreviation": "MO" },
		{ "name": "Montana",				"abbreviation": "MT" },
		{ "name": "Nebraska",				"abbreviation": "NE" },
		{ "name": "Nevada",					"abbreviation": "NV" },
		{ "name": "New Hampshire",			"abbreviation": "NH" },
		{ "name": "New Jersey",				"abbreviation": "NJ" },
		{ "name": "New Mexico",				"abbreviation": "NM" },
		{ "name": "New York",				"abbreviation": "NY" },
		{ "name": "North Carolina",			"abbreviation": "NC" },
		{ "name": "North Dakota",			"abbreviation": "ND" },
		{ "name": "Ohio",					"abbreviation": "OH" },
		{ "name": "Oklahoma",				"abbreviation": "OK" },
		{ "name": "Oregon",					"abbreviation": "OR" },
		{ "name": "Pennsylvania",			"abbreviation": "PA" },
		{ "name": "Rhode Island",			"abbreviation": "RI" },
		{ "name": "South Carolina",			"abbreviation": "SC" },
		{ "name": "South Dakota",			"abbreviation": "SD" },
		{ "name": "Tennessee",				"abbreviation": "TN" },
		{ "name": "Texas",					"abbreviation": "TX" },
		{ "name": "Utah",					"abbreviation": "UT" },
		{ "name": "Vermont",				"abbreviation": "VT" },
		{ "name": "Virginia",				"abbreviation": "VA" },
		{ "name": "Washington",				"abbreviation": "WA" },
		{ "name": "West Virginia",			"abbreviation": "WV" },
		{ "name": "Wisconsin",				"abbreviation": "WI" },
		{ "name": "Wyoming",				"abbreviation": "WY" }
	];

	// Get Logged in User Details
	appFunc.getUser = function() {		
		$http.get('/loggedin').success(function (user) {			
			if (user !== '0'){								 
				$rootScope.currentUser =  user;				
			} else {				
				$rootScope.currentUser = null;
			}
		}).error(function (user) {          	
          	$$rootScope.currentUser = null;
        });        
    }

    // Get Login Status
    appFunc.UserStatus = function () {
    	var deferred = $q.defer();
		return $http.get('/status')
			.success(function (data) {
				if(data.status){
					$rootScope.isLoggedIn = appFunc.userLoggedin = true;
					deferred.resolve();				
				} else {
					$rootScope.isLoggedIn = appFunc.userLoggedin = false;
					deferred.reject();
				}
	  		})  		
	  		.error(function (data) {
	    		$rootScope.isLoggedIn = appFunc.userLoggedin = false;
	    		deferred.reject();
	  		});
	}

	// Check if User is Admin
	appFunc.checkAdmin = function (user) {
		if (user.role !=='admin') {
			appFunc.showAlert("ERROR !!", "You do not have ADMIN permissions to access this page.");
			$location.url('/');
			
			// Use this to re-inistatiate controller and its servercies			
			// $route.reload();
		}
	}

	// Logout Function
	appFunc.logout = function () {
		var deferred = $q.defer();
		$http.post('/logout',$rootScope.user)
			.success(function () {						
				$rootScope.currentUser = undefined;
				$rootScope.user = undefined;
				appFunc.userLoggedin = false;
				appFunc.showAlert("SUCCESS!!","You have been successfully logged out.");
				$location.url('/');
				// Use this to re-inistatiate controller and its servercies
				$route.reload();
				$anchorScroll();
				deferred.resolve();
			})
			.error(function (data) {
				user = false;
				deferred.reject();
        	});
        return deferred.promise;
	};

	return appFunc;
});

// ------------------------------------------- END CUSTOM FUNCTIONS SECTION ------------------------------------------ 

// ------------------------------------------ BEGIN NAV ACTIVE LINK SECTION ------------------------------------------ 
app.directive('bsActiveLink', 
	function ($location) {
    
    return {
        restrict: 'A', 
        replace: false,
        link: function ($scope, $elem) {            
            $scope.$on("$routeChangeSuccess", function () {
                var hrefs = [ '/#' + $location.path(),
							  '#'  + $location.path(), 
							  $location.path()
				]; 

                angular.forEach($elem.find('a'), function (a) {
					a = angular.element(a);
                    
                    if ( -1 !== hrefs.indexOf( a.attr('href') ) )
                        a.parent().addClass('active');
                    else
                        a.parent().removeClass('active');   
                });                
            });
        }
    }
});

// ----------------------------------------- END NAV ACTIVE LINK SECTION ----------------------------------------- 

// ------------------------------------------ BEGIN DATE PICKER SECTION ------------------------------------------ 
app.directive('jqdatepicker', 
	function () {
	
	return {
		restrict: 'A',
		require: 'ngModel',	        
		link: function ($scope, $element, $attrs, $ngModelCtrl) {
			$element.datepicker({
		    	dateFormat 	: 'mm/dd/yy',
		        changeMonth : true,
	      		changeYear 	: true,
	      		yearRange 	: '1960:2060', 
	      		maxDate 	: 'today',

		        onChange: function (date) {		            
		            $scope.$element = date;		            
		            $scope.$apply();
		        }
			});
		}
    };
});	

// -------------------------------------------- END DATE PICKER SECTION ------------------------------------------- 

// ------------------------------------------ BEGIN LANDING PAGE SECTION ------------------------------------------ 
app.controller('homeController', 
	function($scope, $location, $anchorScroll) {
   
	// Scroll to Section
	$scope.scrollTo = function(id) {
		$location.hash(id);
		$anchorScroll();
	}
});

// ------------------------------------------- END LANDING PAGE SECTION ------------------------------------------- 

// ------------------------------------------ BEGIN REGISTRATION SECTION ------------------------------------------ 
app.controller('registerController', 
	function($q, $scope, $location, $rootScope, $http, $route, $mdDialog, AppFunctions, $anchorScroll) {

	// Initialize Error Status	
	$scope.passwordErr   = false;
    $scope.usernameErr   = false;
    $scope.passwordShort = false;
	
	// Populate States Dropdown
	$scope.states = AppFunctions.states;

	// Registration Fields
	$scope.user = { 
		email:'', firstName:'',	lastName:'', passwd1:'', passwd2:'', address1:'', city:'', state:'',
		zipcode:'',	role:'', activeIn:'', expiryDate:'', birthDate:''
	};
	
	//Email Validation
    $scope.testUsername = function () {
        var ValString = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

        if($scope.user.email != "")
			$scope.usernameErr = !ValString.test($scope.user.email);
        else
			$scope.usernameErr = false;
    };
	
	//Check Password Length
    $scope.testPwdLength = function () {
        $scope.passwordShort = $scope.user.passwd1.length <= 5
    };

    //Check Password Match
    $scope.testPwdMatch = function () {
        $scope.passwordErr = ($scope.user.passwd1 != $scope.user.passwd2);
    };
	
	//FirstName Checks
    $('#fName').keypress(function(key) {
        //Prevent user from input non-letter chars.
        if((key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90)
            && ($.inArray(key.charCode, [0, 8, 16, 20, 45, 46]))) {
            //Show a tooltip 
            $('[data-toggle="tooltip"]').tooltip('show');            
            return false;
        } else {
            $('[data-toggle="tooltip"]').tooltip('hide');
        }
    });

    //LastName Checks
    $('#lName').keypress(function(key) {
        if((key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90)
            && ($.inArray(key.charCode, [0, 8, 16, 20, 45, 46]))) {          
            $('[data-toggle="tooltip1"]').tooltip('show');            
            return false;
        } else {
            $('[data-toggle="tooltip1"]').tooltip('hide');
        }
    });    
    
    //Zip Validation
    $('#zip').keypress(function(key) {
    	var ValString = /^(\d{5}-\d{4}|\d{5})$/;
    	if(((key.charCode < 48 && key.charCode != 45) || key.charCode > 57) && ($.inArray(key.charCode, [0, 8, 16, 20, 46]))) {	            
	    		$('[data-toggle="tooltip2"]').tooltip('show');
	            return false;
	    } else {
	        $('[data-toggle="tooltip2"]').tooltip('hide');
	        
	        if($scope.user.zipcode != "")
	        	$scope.zipCodeErr = !ValString.test($scope.user.zipcode);
	        else
	        	$scope.zipCodeErr = false;
	    }
    });
    
    // City Validation
    $('#city').keypress(function(key) {        
        if(((key.charCode < 97 && key.charCode != 32) || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90)
            && ($.inArray(key.charCode, [0, 8, 16, 20, 45, 46]))) {
            $('[data-toggle="tooltip3"]').tooltip('show');
            return false;
        } else {
            $('[data-toggle="tooltip3"]').tooltip('hide');
        }
    });
    	
    // Clear Form Confirmation Dialog Box
    $scope.showConfirm = function(ev) {    
    var confirm = $mdDialog.confirm() 
          .title('CONFIRM !!')
          .textContent("Are you sure you want to clear the form?")        
          .ariaLabel('confirm')          
          .ok('YES')
          .cancel('NO');
    		
    	$mdDialog.show(confirm).then(function() {
    		$scope.user = {}
        	$scope.selectedState = "";
    	});
  	};  	

  	// Register Function
  	$scope.register = function (user){
		
		var deferred = $q.defer();

		// Account Expiry Period of 3 Months
		var currentDate = new moment();		
		var expDate = moment(currentDate.add(3,'months')).format('MM/DD/YYYY');								

		if ($scope.user.email == "" || 
			$scope.user.firstName == "" || $scope.user.lastName == "" || 
			$scope.user.passwd1 == "" || $scope.user.passwd2 == "" || 
			$scope.user.address1 == "" || $scope.user.city == "" || $scope.selectedState == "" || $scope.user.zipcode == "" || 
			$scope.user.birthDate == "" || 	$scope.user.birthDate == undefined) {
			
			AppFunctions.showAlert("ERROR !!","Please fill in all Required Fields.");
		}
		else {			
			$scope.user.password 	= $scope.user.passwd1;
			$scope.user.expiryDate 	= expDate;
			$scope.user.role 		= "user";
			$scope.user.activeIn 	= "Y";			
			$scope.user.state 		= $scope.selectedState;
			$scope.user.birthDate 	= moment($scope.user.birthDate).format('MM/DD/YYYY');			

			$http.post('/register', user)
				.success(function (response) {
					if (response != "0") {
						AppFunctions.showAlert("CONGRATULATIONS !!",
							"Your Account has been created! Use your registered email \"" + user.email + 
							"\" and password you created to login.");
						$rootScope.currentUser = '';
						$location.path('/login');
						// Use this to re-inistatiate controller and its servercies
						$route.reload();
						$anchorScroll();
						deferred.resolve();
					} else {
						AppFunctions.showAlert("ERROR !!","Sorry, \"" + user.email + 
							"\" has already been registered! Please use differnt Email ID.");
						deferred.reject();
					}
				})
				.error(function (response) {
					deferred.reject();
	        	})
		}
	};
});

// ------------------------------------------ END REGISTRATION SECTION ------------------------------------------ 

// --------------------------------------------- BEGIN LOGIN SECTION -------------------------------------------- 
app.controller('loginController', 
	function ($q, $scope, $rootScope, $http, $routeParams, $location, $route, $mdDialog, AppFunctions, $anchorScroll) {
	
	// Redirect to Dashboard if logged in
	$scope.$on('$routeChangeSuccess', function () {	
		if (AppFunctions.userLoggedin) {
			$location.url('/myaccount');
			// Use this to re-inistatiate controller and its servercies
			$route.reload();
		}
	});

	// Login Function
	$scope.login = function (user){
		var deferred = $q.defer();

		$http.post('/login', user)
			.success(function (response){			
				$rootScope.currentUser = response;				
				$location.url('/myaccount');
				deferred.resolve();
			})
			.error(function (err) {
				if(err == "Unauthorized") 
					AppFunctions.showAlert("ERROR !!","Invlaid Email ID or password. Please try again!");
				else
					AppFunctions.showAlert("ERROR !!","Account doesn't exist or expired. Please contact Administrator!");
			
				deferred.reject();
			})		
	};
	
	// Validate Email
    $scope.testLoginName = function () {
        var ValString = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if($scope.user.email != "") {
			$scope.loginEmailErr = !ValString.test($scope.user.email);
        } else {
			$scope.loginEmailErr = false;
        }
    };

	// Validate Password Length
	$scope.testPassword = function () {		
        $scope.passwordShort = $scope.user.password.length <= 5
    };
	
	//Forgot Password Function
	$scope.forgot = function (emailID){
		var postData = {
			email: emailID
		}
		$http.post('/forgot', postData)
			.success(function (response){
				AppFunctions.showAlert("MESSAGE !!","Please check the registered email for instructions.");			
				$location.url('/login');
			})
			.error(function (err) {
				if(err = "NotFound" ) {
					AppFunctions.showAlert("ERROR !!","Email ID not registered in ASQ Portal. Please try again!");
				}
			})
	};
	
	// Reset Password Functions
	$scope.pwReset = function (user){
		var postData = {
				password : user.password1,
				token 	 : $routeParams.token
		}
		$http.post('/reset', postData)
			.success(function (response){			
				AppFunctions.showAlert("SUCCESS !!","Password Updated Successfully!");			
				$location.url('/login');
			})
			.error(function (err) {
				if(err) {
					AppFunctions.showAlert("ERROR !!","Error while updating password. Please try again!");				
				}
			})
	};
	
	// Enter Key press for Login
	$scope.pressEnter = function (e,user) {
		if (e.keyCode == 13)
			$scope.login(user);
	};	
});

// ------------------------------------------------ END LOGIN SECTION ------------------------------------------------ 

// ------------------------------------------ BEGIN PROFILE EDITING SECTION ------------------------------------------ 
app.controller('profileController', 
	function ($q, $scope, $rootScope, $http, $location, $mdDialog, AppFunctions, $anchorScroll) {	
	
	// Populate States Dropdown
	$scope.states 		 = AppFunctions.states;	
	$scope.selectedState = $rootScope.currentUser.state;

	// Logout Function
	$scope.logout = AppFunctions.logout;

	// Save Profile Function
	$scope.save = function (currentUser) {		
	   if (	$scope.currentUser.firstName == "" || $scope.currentUser.lastName == "" || 
	   		$scope.currentUser.address1 == "" || $scope.currentUser.city == "" || 
	   		$scope.selectedState == "" || $scope.currentUser.zipcode == "" || 
	   		$scope.currentUser.birthDate == "") {

			AppFunctions.showAlert("ERROR !!", "Please fill in all the blanks!");
		}
		else {
			var postData = {
				email 		: currentUser.email,
				firstName 	: currentUser.firstName,
				lastName 	: currentUser.lastName,
				address1 	: currentUser.address1,
				address2 	: currentUser.address2,
				city 		: currentUser.city,
				state 		: $scope.selectedState,
				zipcode 	: currentUser.zipcode,
				birthDate 	: moment(currentUser.birthDate).format("MM/DD/YYYY")
			};
		}
		
		$http.post('/updateProfile', postData)
			.success(function (response) {
				if (response == 'success'){				
					// console.log("Update "+response);
					AppFunctions.showAlert("SUCCESS !!", "Profile Updated Successfully.");
					$location.url('/myaccount');
					$anchorScroll();
				} else 
					AppFunctions.showAlert("ERROR !!", "Unable to update profile. Please try again.");
			})		
	};	

});

// ------------------------------------------- END PROFILE EDITING SECTION ------------------------------------------- 

// ------------------------------------------ BEGIN CHANGE PASSWORD SECTION ------------------------------------------ 
app.controller('changePasswordController', 
	function ($q, $scope, $rootScope, $http, $location, AppFunctions, $anchorScroll, $route) {
	
	$scope.currentUser.oldPassword 	= "";
	$scope.currentUser.password2 	= "";

	$scope.firstName = $rootScope.currentUser.firstName;
	$scope.lastName  = $rootScope.currentUser.lastName;
	
	// Logout Function
	$scope.logout = AppFunctions.logout;
	
	// Save Password Function
	$scope.pwSave = function (currentUser) {
        var postData = {
            email 		: $rootScope.currentUser.email,
            oldPassword : currentUser.oldPassword,
            password2 	: currentUser.password2
        };
        
        $http.post('/updatePassword', postData)
	        .success(function (response) {
	            if (response == 'success'){
	                AppFunctions.showAlert("SUCCESS !!","Password Updated Successfully! Please login using New Password. ");
	                $scope.currentUser=response;          
	                $scope.logout;
	            } else if (response == 'incorrect') {
	                AppFunctions.showAlert("ERROR !!", 'Invlaid old password. Please enter your current password.');
	                $scope.currentUser={};                				
	                $location.url('/changepassword');
	                // Use this to re-inistatiate controller and its servercies
	                $route.reload();          
	                $anchorScroll();
	            } else if (response == 'error'){
	                AppFunctions.showAlert("ERROR !!", "Unable to change password. Please try again.");
	                $scope.currentUser={};
	                $location.url('/changepassword');
	                // Use this to re-inistatiate controller and its servercies
	                $route.reload();          
	                $anchorScroll();
	            }
	        })
    };
    
    // Initialize Error
    $scope.wrong 		= false;
	$scope.errorClass 	= "";

	// Password Validation
	$scope.checkPasswd = function () {
		if ($scope.currentUser.password1 !== $scope.currentUser.password2) {
			$scope.wrong 	 = true;
			$scope.passwdErr = true;
		}
		else {
			$scope.wrong 	 = false;
			$scope.passwdErr = false;
		}
	};
	
	// Test Password Length
    $scope.testPass = function () {
        $scope.passwordSh = $scope.currentUser.password1.length <= 5;
    };
});

// ------------------------------------------ END CHANGE PASSWORD SECTION ------------------------------------------ 

// -------------------------------------------- BEGIN DASHBOARD SECTION -------------------------------------------- 
app.controller('dashboardController', 
	function ($q, $scope, $rootScope, $http, $location, $interval, AppFunctions) {		
		
	// Initialize user Answer and Report
	$rootScope.wrong  = 0;
	$rootScope.report = { type:'',wrong:[] };
	
	// Start Quiz
	$scope.exam = function (){
		$rootScope.submited = false;
		$http.get('/quiz')
			.success(function (response) {
				$rootScope.questions = response;			
				$location.path('/exam/0');
			});
	};
	
	// Get if Multiple Exams Enabled -- Not used in Current Version as this App is only for CSQE 
	$scope.getCerts = function (){
		$scope.wrong = true;
		$http.post('/getCerts','')
			.success(function (response) {
				$scope.certifications = response;
				
				if ($scope.certifications[0] != undefined) {
					//console.log(response);
					$location.url('/examinfo');
			  	} else {
					AppFunctions.showAlert("ERROR !!", "No Certification found.");
			  	}
			})
			.error(function (err) {
				AppFunctions.showAlert("ERROR !!", "Something went wrong. Please try again.");
				//console.log(err);
			})
	};
	
	// Check if Selected Exam is CSQE -- Not used in Current Version as this App is only for CSQE 
	$scope.getValue = function(value) {
		if(value == "CSQE") { 
			$scope.wrong = false;
		} else {
			$scope.wrong = true;
		}
		$scope.selectedValue = value;
    }	

    // Logout Function
	$scope.logout = AppFunctions.logout;

});

// ------------------------------------------ END DASHBOARD SECTION ------------------------------------------ 

// --------------------------------------- BEGIN ADMIN DASHBOARD SECTION -------------------------------------
app.controller('adminController', 
	function ($q, $scope, $rootScope, $http, $location, $route, AppFunctions, $anchorScroll, $mdDialog) {

	// Redirect to Dashboard if not admin
	$scope.$on('$routeChangeSuccess', function () {			
		AppFunctions.checkAdmin($rootScope.currentUser);		
	});
		
	// Pagination Initialisation
	$scope.selectedValue = "";
	$scope.currentPage 	 = 1;
	$scope.numPerPage 	 = 10;
	$scope.maxSize 		 = 5;

	var begin 	= (($scope.currentPage - 1) * $scope.numPerPage),
        end 	= begin + $scope.numPerPage;

	// Get Questions on selected Category
	$scope.searchQuestions = function (currentUser){
		$scope.searchCat 		= currentUser.searchCat;
		$scope.count 			= 20;
		$scope.partialQuestions = [];
		$scope.allQuestions 	= [];
		
		if(currentUser.searchCat == undefined) {
			$scope.searchCat = $rootScope.searchCat;
		}

		var postData = { 
			category : $scope.searchCat,
			count 	 : $scope.count
		};

		$http.post('/getQuestions',postData)
			.success(function (response){
				$scope.questionsList = response;
			
				for(i=0;i<=$scope.questionsList.length-1;i++) {
					$scope.allQuestions.push($scope.questionsList[i]);
				}			
				$scope.partialQuestions = $scope.allQuestions.slice(begin, end);
				$location.url('/questionlist');
				$anchorScroll();
			})
			.error(function (err) {
				AppFunctions.showAlert("ERROR !!", "Something went wrong. Please try again.");
					//console.log(err);
			})
	};
		
	// Monitor Pagination			
	$scope.$watch('currentPage + numPerPage', function() {
	    begin 	= (($scope.currentPage - 1) * $scope.numPerPage);
	    end 	= begin + $scope.numPerPage;

	    $scope.partialQuestions = $scope.allQuestions.slice(begin, end);
	});
			
	// Add New Question
	$scope.addQuestion = function () {
		var splitChoice  = $scope.addQueChoice.split("\n");
		var formatChoice = angular.toJson(splitChoice);

		formatChoice = formatChoice.replace('"A:',' "A" : "');
		formatChoice = formatChoice.replace('"B:',' "B" : "');
		formatChoice = formatChoice.replace('"C:',' "C" : "');
		formatChoice = formatChoice.replace('"D:',' "D" : "');
		formatChoice = formatChoice.replace('[','{ ');
		formatChoice = formatChoice.replace(']',' }');

		var postData = { 
			category 		: $scope.addQueCat,
			content 		: $scope.addQueContent,
			//choices 		: JSON.parse($scope.addQueChoice),
			choices 		: JSON.parse(formatChoice),
			correctChoice 	: $scope.addQueCorChoice
		};

		$http.post('/addQuestionDet',postData)
			.success(function (response) {
				if (response != 0){
					AppFunctions.showAlert("SUCCESS !!", "Question Added Successfully.");
					$location.url('/questionlist');
					// Use this to re-inistatiate controller and its servercies
					$route.reload();
					$anchorScroll();
				} else if (response == 'error') {
					AppFunctions.showAlert("ERROR !!", "Something went wrong. Please try again.");
					// Use this to re-inistatiate controller and its servercies
					$route.reload();
					$anchorScroll();
				}
			})
			.error(function (err) {
				AppFunctions.showAlert("ERROR !!", "Something went wrong. Please try again.");
				//console.log(err);
			})
	};

	// Edit Question Redirect			
	$scope.editQuestion = function (question){
		$scope.searchCat = question.category;
	
		var postData = { 
			category 		: question.category,
			content 		: question.content,
			choices			: question.choices,
			correctChoice 	: question.correctChoice
		};
	
		$http.post('/getQuestionInfo',postData)
			.success(function (response){			    
			    $rootScope.QueCat 		= question.category;
				$rootScope.QueContent 	= postData.content;
				$rootScope.QueChoice 	= "A:" + postData.choices.A +
									 	  "\nB:" + postData.choices.B +
										  "\nC:" + postData.choices.C +
										  "\nD:" + postData.choices.D;
				//$rootScope.choice 	= JSON.stringify(postData.choice);
				$rootScope.QueCorChoice = postData.correctChoice;
				$rootScope.questionID 	= question._id;

				$location.url('/updatequestion');
			})
			.error(function (err) {
				AppFunctions.showAlert("ERROR !!", "Something went wrong. Please try again.");
				$route.reload();
				//console.log(err);
			})
	};

	// Get Edit Function Question Values
	$scope.getQuestionValues = function() {		
		$scope.QueCat 		= $rootScope.QueCat;
		$scope.QueContent 	= $rootScope.QueContent;
		$scope.QueChoice 	= $rootScope.QueChoice;
		$scope.QueCorChoice = $rootScope.QueCorChoice;
	}
			
	// Update Question Function
	$scope.updateQuestion = function (){
		var splitChoice  = $scope.QueChoice.split("\n");
		var formatChoice = angular.toJson(splitChoice);

		formatChoice = formatChoice.replace('"A:',' "A" : "');
		formatChoice = formatChoice.replace('"B:',' "B" : "');
		formatChoice = formatChoice.replace('"C:',' "C" : "');
		formatChoice = formatChoice.replace('"D:',' "D" : "');
		formatChoice = formatChoice.replace('[','{ ');
		formatChoice = formatChoice.replace(']',' }');

		var postData = { 
			_id 		: $rootScope.questionID,
			category 	: $scope.QueCat,
			content 	: $scope.QueContent,
			choices 	: JSON.parse(formatChoice),
			correctChoice 	: $scope.QueCorChoice
		};

		$http.post('/updateQuestionDet',postData)
			.success(function (response){
				if (response == 'success'){
					AppFunctions.showAlert("SUCCESS !!", "Question details have been updated.");
					$location.url('/questionlist');
					// Use this to re-inistatiate controller and its servercies
					$route.reload();
					$anchorScroll();
				} else {
					AppFunctions.showAlert("ERROR !!", "Something went wrong. Please try again.");
				}
			})
			.error(function (err) {
				AppFunctions.showAlert("ERROR !!", "Something went wrong. Please try again.");
				//console.log(err);
			})
	};

	// Delete Question Function
    $scope.deleteQuestion = function(ev, question) {    
    	var postData = {
			_id 	 : question._id,
			category : question.category
		};

    	var confirm = $mdDialog.confirm() 
          .title('CONFIRM !!')
          .textContent("Are you sure you want to delete?")        
          .ariaLabel('confirm')          
          .ok('YES')
          .cancel('NO');
    		
    	$mdDialog.show(confirm).then(function() {
    		$http.post('/deleteQuestionDet',postData)
				.success(function (response) {
					if (response == 'success') {
						AppFunctions.showAlert("SUCCESS !!", "Question deleted successfully.");
						// console.log("User removed from application");
						$location.url('/questionlist');
						// Use this to re-inistatiate controller and its servercies
	                	$route.reload();
	                	$anchorScroll();
					}
				})
				.error(function (err) {
					AppFunctions.showAlert("ERROR !!", "Something went wrong. Please try again.");
					//console.log(err);
				})
    	});
  	};	
			
	//Added for ASQ Upgrade2.0.Exam Management Screen Flow methods.
	$scope.addCertification = function (){
		var postData = { 
			name 		: $scope.name,
			description : $scope.description
		};
	
		$http.post('/addCertDet',postData)
			.success(function (response){
				if (response != 0){
					alert('Success!');
					$scope.name = undefined;
					$scope.description = undefined;
					$scope.getCerts();
					$location.url('/examInfo');
				} else if (response == 'error') {
					alert('error')
				}
			})
			.error(function (err) {
				alert("Error!");
				//console.log(err);
			})
	};
			
	// Get Exam List
	$scope.getCerts = function (){
		$http.post('/getCerts','')
			.success(function (response) {
				$scope.certifications = response;
				if ($scope.certifications[0] != undefined) {
					//console.log(response);
					$location.url('/examInfo');
				}else {
					alert("No Certification found.");
				}
			})
			.error(function (err) {
				alert("Error!");
				//console.log(err);
			})
	};
			
	// Get Selected Exam
	$scope.getValue = function(value) {
		$scope.selectedValue = value;
		$scope.wrong 		 = false;
	}
			
	//Added for ASQ Upgrade2.0.Exam Management Screen Flow methods.
	$scope.removeCert = function (){
		var postData = { 
			_id : $scope.selectedValue
		};
	
		if(confirm('Are you sure you want you delete this certification?')) {
			$http.post('/delCertDet',postData)
				.success(function (response){
					if (response == "success"){
						alert('Success!');
						$scope.selectedValue = "";
						$scope.getCerts();
						$scope.wrong = true;
						$location.url('/examInfo');
					} else if (response == 'error') {
						alert('error');
						//console.log("ERROR::");
					}
				})
				.error(function (err) {
					alert("Error!");
					//console.log(err);
				})
		}
	};
			
	$scope.wrong 		= false;
	$scope.errorClass 	= "";
	
	if($scope.currentUser.searchCat == undefined) 
		$scope.wrong = true;
	
	if($scope.selectedValue == "" || $scope.selectedValue == undefined) 
		$scope.wrong = true;
			
	$scope.disableSearch = function () {
		if ($scope.currentUser.searchCat == "Select" || $scope.currentUser.searchCat == "") {
			$scope.wrong 		= true;
			$scope.errorClass 	= "has-error";
		}
		else {
			$scope.wrong 		= false;
			$scope.errorClass 	= "";
		}
	};
	
	$scope.addQueChoiceErr = false;
	
	//test on the format of Question choices on admin add question page.
	$scope.testQueChoice = function () {
	    if( !($scope.addQueChoice.contains("A:") && $scope.addQueChoice.contains("B:") && 
	    	$scope.addQueChoice.contains("C:") && $scope.addQueChoice.contains("D:"))) {

	    	$scope.addQueChoiceErr = true;
	    	alert("NOTE:Please enter the choices using below format.\n\t\t A:answer1 \n\t\t B:answer2 \n\t\t C:answer3 \n\t\t D:answer4");
	    }
	};
	
	//test on the format of Question choices on admin update question page.
	$scope.testChoice = function () {
	   	if( !($scope.choice.contains("A:") && $scope.choice.contains("B:") && 
	   		$scope.choice.contains("C:") && $scope.choice.contains("D:"))) {
	   		
	   		$scope.choiceErr = true;
	   		alert("NOTE:Please enter the choices using below format.\n\t\t A:answer1 \n\t\t B:answer2 \n\t\t C:answer3 \n\t\t D:answer4");
	   	}
	};
		    
	// Logout Fucntion
	$scope.logout = AppFunctions.logout;

	// Press Enter Key
	$scope.pressEnter = function (e,user) {
		if (e.keyCode == 13){
			$scope.admin(user);
		}
	};	
});

// --------------------------------------- END ADMIN DASHBOARD SECTION -----------------------------------------

// -------------------------------------- BEGIN USER MANAGEMENT SECTION ---------------------------------------- 
app.controller('usersController', 
	function ($q,$scope, $rootScope, $http, $location, $route, $anchorScroll, AppFunctions, $mdDialog) {
	
	// Redirect to Dashboard if not admin
	$scope.$on('$routeChangeSuccess', function () {			
		AppFunctions.checkAdmin($rootScope.currentUser);		
	});

	// Pagination Initialisation
	$scope.currentPage	= 1;
	$scope.numPerPage	= 10;
	$scope.maxSize	 	= 5;

	var begin = (($scope.currentPage - 1) * $scope.numPerPage),
		end   = begin + $scope.numPerPage;
	
	// Monitor Pagination			
	$scope.$watch('currentPage + numPerPage', function() {
	    begin 	= (($scope.currentPage - 1) * $scope.numPerPage);
	    end 	= begin + $scope.numPerPage;

	    $scope.partialUsers = $scope.allUsers.slice(begin, end);
	});	

	// Search Function
	$scope.search = function (user) {
		if($scope.user != undefined)
			var postData = { email: $scope.user.search };
		else
			var postData = {};		

		$http.post('/getUsers',postData)
			.success(function (response) {
				$scope.partialUsers = [];
				$scope.allUsers = [];
				$scope.users = response;

				for( i = 0; i <= $scope.users.length-1; i++ ) {
					$scope.allUsers.push($scope.users[i]);
				}
			
				$scope.partialUsers = $scope.allUsers.slice(begin, end);

		  		if ($scope.users[0] != undefined) {			
					$location.url('/userlist');
		  		} else {
					AppFunctions.showAlert("ERROR !!", "User not found !! Please try again.");
					// console.log("No Users found for your Search.");
		  		}
			})
			.error(function (err) {
				AppFunctions.showAlert("ERROR !!", "Something went wrong. Please try again.");
				// console.log(err);
			})
	};
	
	// Populate States Dropdown
	$scope.states = AppFunctions.states;
	
	// Edit Re-route Function
	$scope.editUser = function (username) {
		$scope.search = username;
		var postData = { search: $scope.search };

		$http.post('/getUserInfo', postData)
			.success(function (response) {
				$rootScope.user 	= response;
				$scope.selectState  = $rootScope.user.state;

				$location.url('/updateuser');
			})
			.error(function (err) {
				AppFunctions.showAlert("ERROR !!", "Something went wrong. Please try again.");
				//console.log(err);
			})
	};
		
	// Update User Function
	$scope.saveUser = function (user) {
		if ( $scope.user.firstName == "" || $scope.user.lastName == "" || 
			 $scope.user.address1 == "" || $scope.user.city == "" || 
			 $scope.selectedState == "" || $scope.user.zipcode == "" || 
			 $scope.user.birthDate == "") {

			AppFunctions.showAlert("ERROR !!", "Please fill in all the blanks!");
		}
		else {
			var postData = {
				email 		: user.email,
				firstName 	: user.firstName,
				lastName 	: user.lastName,
				address1 	: user.address1,
				address2 	: user.address2,
				city 		: user.city,
				state 		: user.state,
				zipcode 	: user.zipcode,
				birthDate 	: moment(user.birthDate).format("MM/DD/YYYY"),
				expiryDate 	: moment(user.expiryDate).format("MM/DD/YYYY"),
				role 		: user.role,
				activeIn 	: user.activeIn	
			};
		}

		$http.post('/saveUserProfile', postData)
			.success(function (response) {
				if (response == 'success'){
					$scope.firstName = postData.firstName;
					//console.log("Update "+response);
					AppFunctions.showAlert("SUCCESS !!", "Profile Updated Successfully.");
					$location.url('/userlist');
					// Use this to re-inistatiate controller and its servercies
					$route.reload();
				} else {
					AppFunctions.showAlert("ERROR !!", "Unable to update profile. Please try again.");
				}
			})
	};

	// Delete User Function
    $scope.deleteUser = function(ev, user) {    
    	var postData = {
			email : user.email
		};

    	var confirm = $mdDialog.confirm() 
          .title('CONFIRM !!')
          .textContent("Are you sure you want to delete?")        
          .ariaLabel('confirm')          
          .ok('YES')
          .cancel('NO');
    		
    	$mdDialog.show(confirm).then(function() {
    		$http.post('/deleteUserInfo',postData)
				.success(function (response) {
					if (response == 'success') {
						AppFunctions.showAlert("SUCCESS !!", "User deleted successfully.");
						// console.log("User removed from application");
						$location.url('/userlist');
						// Use this to re-inistatiate controller and its servercies
	                	$route.reload();
	                	$anchorScroll();
					}
				})
				.error(function (err) {
					AppFunctions.showAlert("ERROR !!", "Something went wrong. Please try again.");
					//console.log(err);
				})
    	});
  	};	
	  
	// Logout Function
	$scope.logout = AppFunctions.logout;

	// Press Enter Key
	$scope.pressEnter = function (e,user) {
		if (e.keyCode == 13){
			$scope.admin(user);
		}
	};
});

// --------------------------------------- END ADMIN DASHBOARD SECTION -----------------------------------------

// ------------------------------------- BEGIN PRACTICE CATEGORY SECTION ---------------------------------------
app.controller('practiceSelectController', 
	function($q, $scope, $http, $rootScope, $location, ObserverService, AppFunctions) {
	
	// Logout Function
	$scope.logout = AppFunctions.logout;

	$rootScope.questions 			= [];
	$rootScope.report 				= {};
	$rootScope.report.wrong 		= [];
	$rootScope.wrong 				= 0;
	$rootScope.questionDistribution = {	total : 0 };

	$scope.GKValue  = 
	$scope.EPValue  = 
	$scope.MAValue  = 
	$scope.PMValue  = 
	$scope.SCMValue = 
	$scope.SQMValue = 
	$scope.SVVValue = 5;

	var postData = {};

	$scope.submit = function () {
		if ($scope.GK) {
			postData.GK = $scope.GKValue;
			$rootScope.questionDistribution.total += postData.GK
		}
		if ($scope.EP) {
			postData.EP = $scope.EPValue;
			$rootScope.questionDistribution.total += postData.EP
		}
		if ($scope.MA) {
			postData.MA = $scope.MAValue;
			$rootScope.questionDistribution.total += postData.MA
		}
		if ($scope.PM) {
			postData.PM = $scope.PMValue;
			$rootScope.questionDistribution.total += postData.PM
		}
		if ($scope.SCM) {
			postData.SCM = $scope.SCMValue;
			$rootScope.questionDistribution.total += postData.SCM
		}
		if ($scope.SQM) {
			postData.SQM = $scope.SQMValue;
			$rootScope.questionDistribution.total += postData.SQM
		}
		if ($scope.SVV) {
			postData.SVV = $scope.SVVValue;
			$rootScope.questionDistribution.total += postData.SVV
		}

		$rootScope.questionDistribution.data = postData;

		$http.post('/practice', postData)
			.success(function (response) {
				$rootScope.questions = response;
				//console.log("questions "+response);
				$location.url('practice/0')
			})
	}
});

// ------------------------------------- END PRACTICE CATEGORY SECTION ---------------------------------------

// -------------------------------------- BEGIN PRACTICE EXAM SECTION ----------------------------------------
app.controller('practiceController', 
	function($scope, $routeParams, $http, $rootScope, $location, $timeout, AppFunctions) {
	
	$scope.index 		= Number($routeParams.id);
	$rootScope.wrong  	= 0;
	$rootScope.report 	= {
		ep 		: 0,
		gk 		: 0,
		ma 		: 0,
		pm 		: 0,
		scm 	: 0,
		sqm 	: 0,
		svv 	: 0,
		wrong 	: []
	};

	$scope.choose = function (index,choice) {
		$rootScope.questions[index].answer = choice;
	};

	$scope.previous = function(){
		$location.path('/practice/'+(Number($routeParams.id) - 1));
		if ($scope.choice){
			$rootScope.questions[$scope.index].answer = $scope.choice;
		}

	};

	$scope.next = function(){
		$location.path('/practice/'+(Number($routeParams.id) + 1));
		if ($scope.choice){
			$rootScope.questions[$scope.index].answer = $scope.choice;
		}
	};

	$scope.quit = function () {
		$rootScope.questions = [];
		$location.url('/home')
	};

	$scope.logout = AppFunctions.logout;

	$scope.submit = function () {
		$rootScope.submited = true;
		$rootScope.latest 	= Date.now();

		var epwrong = gkwrong = mawrong = pmwrong = scmwrong = sqmwrong = svvwrong = 0;
		
		var postData = {
			email 		: $rootScope.currentUser.email,
			mode 		: "Practice",
			date 		: $rootScope.latest,			
			time 		: new Date(),
			category 	: "",
			score 		: 0,
			epWrong 	: 0,
			gkWrong 	: 0,
			maWrong 	: 0,
			pmWrong 	: 0,
			scmWrong 	: 0,
			sqmWrong 	: 0,
			svvWrong 	: 0,
			epNumber 	: 0,
			gkNumber 	: 0,
			maNumber 	: 0,
			pmNumber 	: 0,
			scmNumber 	: 0,
			sqmNumber 	: 0,
			svvNumber 	: 0,
			total 		: $rootScope.questionDistribution.total,
			report 		: {}
		};

		$rootScope.questions.forEach(function (value, index, array) {
			if (value.answer != value.correctChoice) {
				$rootScope.wrong ++;
				$rootScope.report.wrong.push(value);

				switch (value.category){
					case 'ep':
						epwrong ++;
						$rootScope.report.ep ++;
						break;
					case 'gk':
						gkwrong ++;
						$rootScope.report.gk ++;
						break;
					case 'mam':
						mawrong ++;
						$rootScope.report.ma ++;
						break;
					case 'pm':
						pmwrong ++;
						$rootScope.report.pm ++;
						break;
					case 'scm':
						scmwrong ++;
						$rootScope.report.scm ++;
						break;
					case 'sqm':
						sqmwrong ++;
						$rootScope.report.sqm ++;
						break;
					case 'SVV':
						svvwrong ++;
						$rootScope.report.svv ++;
						break;
				}
			}

			if (index == array.length - 1){
				console.log($rootScope.questionDistribution.total);
				
				postData.category 	= value.category,
				postData.score 		= Math.round((1-($rootScope.wrong/$rootScope.questionDistribution.total))*100);
				
				$rootScope.report.score 	= postData.score;
				$rootScope.report.epScore 	= $rootScope.questionDistribution.data.EP?Math.round((1-(epwrong/$rootScope.questionDistribution.data.EP))*100):null;
				$rootScope.report.gkScore 	= $rootScope.questionDistribution.data.GK?Math.round((1-(gkwrong/$rootScope.questionDistribution.data.GK))*100):null;
				$rootScope.report.maScore  	= $rootScope.questionDistribution.data.MA?Math.round((1-(mawrong/$rootScope.questionDistribution.data.MA))*100):null;
				$rootScope.report.pmScore  	= $rootScope.questionDistribution.data.PM?Math.round((1-(pmwrong/$rootScope.questionDistribution.data.PM))*100):null;
				$rootScope.report.scmScore 	= $rootScope.questionDistribution.data.SCM?Math.round((1-(scmwrong/$rootScope.questionDistribution.data.SCM))*100):null;
				$rootScope.report.sqmScore 	= $rootScope.questionDistribution.data.SQM?Math.round((1-(sqmwrong/$rootScope.questionDistribution.data.SQM))*100):null;
				$rootScope.report.svvScore 	= $rootScope.questionDistribution.data.SVV?Math.round((1-(svvwrong/$rootScope.questionDistribution.data.SVV))*100):null;

				postData.epNumber  = $rootScope.questionDistribution.data.EP;
				postData.gkNumber  = $rootScope.questionDistribution.data.GK;
				postData.maNumber  = $rootScope.questionDistribution.data.MA;
				postData.pmNumber  = $rootScope.questionDistribution.data.PM;
				postData.scmNumber = $rootScope.questionDistribution.data.SCM;
				postData.sqmNumber = $rootScope.questionDistribution.data.SQM;
				postData.svvNumber = $rootScope.questionDistribution.data.SVV;

				postData.epWrong  = epwrong;
				postData.gkWrong  = gkwrong;
				postData.maWrong  = mawrong;
				postData.pmWrong  = pmwrong;
				postData.scmWrong = scmwrong;
				postData.sqmWrong = sqmwrong;
				postData.svvWrong = svvwrong;
				postData.report   = $rootScope.report;

				$http.post('/saveRecord', postData).success(function () {
					 $timeout(function () {
					 $location.url('/report')
					 },20);
				});
			}
		});
	};

});

// -------------------------------------------- BEGIN EXAM SECTION --------------------------------------------- 
app.controller('examController', 
	function ($q, $scope, $rootScope, $http, $location, $routeParams, ObserverService, $timeout, AppFunctions, $mdBottomSheet) {
	
	$rootScope.questionDistribution = undefined;
	$rootScope.wrong = 0;	

	$scope.showGridBottomSheet = function() {    
    	$mdBottomSheet.show({
      		templateUrl: 'quizJumpList.html'      		
    	}).then(function(clickedItem) {
      		jump(clickedItem);      		
    	});
  	};

  	$scope.ItemClick = function($index) {
    	var clickedItem = $index;
    	$mdBottomSheet.hide(clickedItem);
  	};

	$scope.choose = function (index,choice) {
		$rootScope.questions[index].answer = choice;
	};

	var jump = function (index) {
		$location.url('/exam/' + index)
	};
	
	function getStyle(obj, name) {
		if(obj.currentStyle) {
			return obj.currentStyle[name];
		}
		else {
			return getComputedStyle(obj, false)[name];
		}
	}

	$rootScope.timer = true;
	$rootScope.report ={
		ep:0,
		gk:0,
		ma:0,
		pm:0,
		scm:0,
		sqm:0,
		svv:0,
		wrong:[]
	};
	$scope.index =Number($routeParams.id);
	$scope.previous = function(){
		$location.path('/exam/'+(Number($routeParams.id) - 1));
	};
	$scope.next = function(){
		$location.path('/exam/'+(Number($routeParams.id) + 1));
	};
	$scope.quit = function () {
		$rootScope.questions = [];
		$location.url('/myaccount')
	};

	$scope.logout = AppFunctions.logout;
	
	$scope.submit = function () {
		$rootScope.latest = Date.now();
		$rootScope.timer = false;
		$rootScope.submited = true;
		var epwrong = 0, gkwrong = 0, mawrong = 0, pmwrong = 0, scmwrong = 0, sqmwrong = 0, svvwrong = 0;
		var postData = {
			"email":$rootScope.currentUser.email,
			"mode": "Exam",
			date: $rootScope.latest,
			score: 0,
			epWrong: 0,
			gkWrong: 0,
			maWrong: 0,
			pmWrong: 0,
			scmWrong: 0,
			sqmWrong: 0,
			svvWrong: 0,
			epNumber: 11,
			gkNumber: 11,
			maNumber: 11,
			pmNumber: 11,
			scmNumber: 12,
			sqmNumber: 12,
			svvNumber: 12,
			total:80,
			report:{},
		    epScore: 0,
            gkScore: 0,
            maScore: 0,
            pmScore: 0,
            scmScore: 0,
            sqmScore: 0,
            svvScore: 0
		};
		$rootScope.questions.forEach(function (value, index, array) {
			if (value.answer != value.correctChoice){
				$rootScope.wrong ++;
				$rootScope.report.wrong.push(value);
				switch (value.category){
					case 'ep':
						epwrong ++;
						$rootScope.report.ep ++;
						break;
					case 'gk':
						gkwrong ++;
						$rootScope.report.gk ++;
						break;
					case 'mam':
						mawrong ++;
						$rootScope.report.ma ++;
						break;
					case 'pm':
						pmwrong ++;
						$rootScope.report.pm ++;
						break;
					case 'scm':
						scmwrong ++;
						$rootScope.report.scm ++;
						break;
					case 'sqm':
						sqmwrong ++;
						$rootScope.report.sqm ++;
						break;
					case 'SVV':
						svvwrong ++;
						$rootScope.report.svv ++;
						break;
				}

			}

			if (index == array.length - 1){
				postData.score = Math.round((1-($rootScope.wrong/80))*100);
				$rootScope.report.score = postData.score;
				$rootScope.report.epScore = Math.round((1-(epwrong/11))*100);
				$rootScope.report.gkScore = Math.round((1-(gkwrong/11))*100);
				$rootScope.report.maScore = Math.round((1-(mawrong/11))*100);
				$rootScope.report.pmScore = Math.round((1-(pmwrong/11))*100);
				$rootScope.report.scmScore = Math.round((1-(scmwrong/12))*100);
				$rootScope.report.sqmScore = Math.round((1-(sqmwrong/12))*100);
				$rootScope.report.svvScore = Math.round((1-(svvwrong/12))*100);
				postData.epWrong  = epwrong;
				postData.gkWrong  = gkwrong;
				postData.maWrong  = mawrong;
				postData.pmWrong  = pmwrong;
				postData.scmWrong = scmwrong;
				postData.sqmWrong = sqmwrong;
				postData.svvWrong = svvwrong;
				postData.report = $rootScope.report;
				//Added by Srinivas Thungathurti for Dynamic Chart to display on the View History screen.
				postData.epScore = $rootScope.report.epScore;
                postData.gkScore = $rootScope.report.gkScore;
                postData.maScore = $rootScope.report.maScore;
                postData.pmScore = $rootScope.report.pmScore;
                postData.scmScore = $rootScope.report.scmScore;
                postData.sqmScore = $rootScope.report.sqmScore;
                postData.svvScore = $rootScope.report.svvScore;
				$http.post('/saveRecord', postData).success(function () {
					$timeout(function () {
						$location.url('/report')
					},20);
				});
			}
		});
	};

	$scope.$on('$destroy', function () {
		$rootScope.timer = false;
	});

	ObserverService.detachByEventAndId('timeUp', 'exam');
	ObserverService.attach( function () { $scope.submit(); }, 'timeUp', 'exam' );
});

// Report History
app.controller('reportController', function ($q, $scope, $rootScope, $http, $location, AppFunctions) {

	$scope.showReview = false;
	$scope.logout = AppFunctions.logout;
	
	var detailData = {
		email:$rootScope.currentUser.email,
		date: $rootScope.latest
	};
	$http.post('/getRecord',detailData).success(function (response) {
		$rootScope.historyDetail = response;
		$location.url('historyDetail/');

	});

	$scope.vis = true;
	$scope.invis = false;
	$scope.review = function () {
		$scope.showReview = true;
		$scope.vis = false;
		$scope.invis = true;
	};

	$scope.hide = function () {
		$scope.showReview = false;
		$scope.vis = true;
		$scope.invis = false;
	};

	$scope.cate = function (category) {
		var cate = "";
		switch(category)
		{
			case "ep":
				cate = "Software Engineering Processes";
				break;
			case "gk":
				cate = "Software Engineering Processes";
				break;
			case "mam":
				cate = "Software Metrics & Analysis";
				break;
			case "pm":
				cate = "Software Project Management";
				break;
			case "scm":
				cate = "Software Configuration Management";
				break;
			case "sqm":
				cate = "Software Quality Management";
				break;
			case "SVV":
				cate = "Software Verification & Validation";
				break;
			default:
				cate = "";
		}
		return cate;
	};

	//Added by Srinivas Thungathurti for ASQ Upgrade2.0.For integrating Dynamic Chart application part of ASQ Exam portal.
	function getData (postData,number){
        var deferred = $q.defer();
        if (number){
            postData.number = number
        }
        $http.post('/getRecordForChart', postData).success(function(response){
            deferred.resolve(response)
        });
        return deferred.promise
    }
	
	var quizPostData = {
	        email: $rootScope.currentUser.email,
	        mode:'Exam',
	        number: 3
	};

	var practicePostData = {
	        email: $rootScope.currentUser.email,
	        mode:'Practice',
	        number: 3
	};
	
	$scope.init = function (num){
		if(num > 3) $rootScope.numbers = num;
        quizPostData.number = $rootScope.numbers? $rootScope.numbers: 3;
        practicePostData.number = $rootScope.numbers? $rootScope.numbers: 3;
        $scope.quizChartConfig = {
            "options": {
                "chart": {
                    "type": "areaspline"
                },
                "plotOptions": {
                    "series": {
                        "stacking": ""
                    }
                }
            },
            xAxis: {
                categories: []
            },
            yAxis:{
                title:{text:"Score"},
                max: 100,
                min: 0
            },
            "series": [
                {
                    "name": "Overall Score",
                    "data": [],
                    "connectNulls": true,
                    "id": "series-1"
                },
                {
                    "name": "General Knowledge",
                    "data": [],
                    "type": "column",
                    "id": "series-2"
                },
                {
                    "name": "Software Quality Management",
                    "data": [],
                    "type": "column",
                    "id": "series-3"
                },
                {
                    "data": [],
                    "id": "series-4",
                    "name": "Engineering Process",
                    "type": "column",
                    "dashStyle": "Solid"
                },
                {
                    "data": [],
                    "id": "series-5",
                    "name": "Project Management",
                    "dashStyle": "Solid",
                    "type": "column"
                },
                {
                    "data": [],
                    "id": "series-6",
                    "type": "column",
                    "name": "Metrics & Analysis"
                },
                {
                    "data": [],
                    "id": "series-7",
                    "type": "column",
                    "name": "Software Verification & Validation"
                },
                {
                    "data": [],
                    "id": "series-8",
                    "type": "column",
                    "name": "Software Configuration Management"
                }
            ],
            "title": {
                "text": "Exam Mode Progression"
            },
            "credits": {
                "enabled": false
            },
            "loading": false,
            "size": {}
        };

        $scope.practiceChartConfig = {
            "options": {
                "chart": {
                    "type": "line"
                },
                "plotOptions": {
                    "series": {
                        "stacking": ""
                    }
                }
            },
            xAxis: {
                categories: []
            },
            yAxis:{
                title:{text:"Score"},
                max: 100,
                min: 0
            },
            "series": [
                {
                    "name": "Score",
                    "data": [],
                    "type": "spline",
                    "id": "series-3",
                    "dashStyle": "LongDash",
                    "connectNulls": false
                }
            ],
            "title": {
                "text": "practice Mode Progression"
            },
            "credits": {
                "enabled": false
            },
            "loading": false,
            "size": {}
        };


        getData(practicePostData).then(function(data){
            data.forEach(function (value) {
                $scope.practiceChartConfig.xAxis.categories.unshift(value.time);
                $scope.practiceChartConfig.series[0].data.unshift(value.score)
            })

        });

        getData(quizPostData).then(function(data){
            data.forEach(function (value) {
                $scope.quizChartConfig.xAxis.categories.unshift(value.time);
                $scope.quizChartConfig.series[0].data.unshift(value.score);
                $scope.quizChartConfig.series[1].data.unshift(value.gkScore);
                $scope.quizChartConfig.series[2].data.unshift(value.sqmScore);
                $scope.quizChartConfig.series[3].data.unshift(value.epScore);
                $scope.quizChartConfig.series[4].data.unshift(value.pmScore);
                $scope.quizChartConfig.series[5].data.unshift(value.maScore);
                $scope.quizChartConfig.series[6].data.unshift(value.svvScore);
                $scope.quizChartConfig.series[7].data.unshift(value.scmScore);

            })
        });
    };

});

// History
app.controller('historyController', function ($q, $scope, $rootScope, $http, $location, AppFunctions) {
	
	//Updated for ASQ Upgrade2.0 and added code for Pagination.
	$scope.currentPage = 1;
	$scope.numPerPage = 10;
	$scope.maxSize = 5;
	var begin = (($scope.currentPage - 1) * $scope.numPerPage)
    , end = begin + $scope.numPerPage;

	$scope.showReview = false;
	$scope.logout = AppFunctions.logout;
	var postData ={
		email: $rootScope.currentUser.email
	};

	//Modified below code to add the Pagination for all the history records.
	$http.post('/getRecord',postData).success(function (response) {
		$scope.partialHistory = [];
		$scope.allHistory = [];
		$scope.histories = response;
		for(i=0;i<=$scope.histories.length-1;i++) {
			$scope.allHistory.push($scope.histories[i]);
		}
		$scope.partialHistory = $scope.allHistory.slice(begin, end);
		console.log(response);
	});
	
	$scope.$watch('currentPage + numPerPage', function() {
	    begin = (($scope.currentPage - 1) * $scope.numPerPage);
	    end = begin + $scope.numPerPage;
	    $scope.partialHistory = $scope.allHistory.slice(begin, end);
	  });
	//End Pagination changes here.
	
	$scope.detail = function (lol) {
		var detailData = {
			email:$rootScope.currentUser.email,
			date: lol
		};
		$http.post('/getRecord',detailData).success(function (response) {
			$rootScope.historyDetail = response;
			$location.url('historyDetail/');

		});
	};
	
	//Added this method to get the details related to practice/exam history progress details.
	$scope.detailProgress = function (histDate) {
		var detailProgressData = {
			email:$rootScope.currentUser.email,
			date: histDate
		};
		$http.post('/getRecord',detailProgressData).success(function (response) {
			$rootScope.historyProgressDetail = response;
			console.log("historyProgressDetail is "+$rootScope.historyProgressDetail);
			$location.url('historyDetailsStatus/');

		});
	};

	$scope.vis = true;
	$scope.invis = false;
	$scope.review = function () {
		$scope.showReview = true;
		$scope.vis = false;
		$scope.invis = true;
	};

	$scope.hide = function () {
		$scope.showReview = false;
		$scope.vis = true;
		$scope.invis = false;
	};

	$scope.cate = function (category) {
		var cate = "";
		switch(category)
		{
			case "ep":
				cate = "Software Engineering Processes";
				break;
			case "gk":
				cate = "Software Engineering Processes";
				break;
			case "mam":
				cate = "Software Metrics & Analysis";
				break;
			case "pm":
				cate = "Software Project Management";
				break;
			case "scm":
				cate = "Software Configuration Management";
				break;
			case "sqm":
				cate = "Software Quality Management";
				break;
			case "SVV":
				cate = "Software Verification & Validation";
				break;
			default:
				cate = "";
		}
		return cate;
	};

	//Added by Srinivas Thungathurti for ASQ Upgrade2.0.For integrating Dynamic Chart application part of ASQ Exam portal.
	function getData (postData,number){
        var deferred = $q.defer();
        if (number){
            postData.number = number
        }
        $http.post('/getRecordForChart', postData).success(function(response){
            deferred.resolve(response)
        });
        return deferred.promise
    }
	
	var quizPostData = {
	        email: $rootScope.currentUser.email,
	        mode:'Exam',
	        number: 3
	};

	var practicePostData = {
	        email: $rootScope.currentUser.email,
	        mode:'Practice',
	        number: 3
	};
	
	$scope.init = function (num){
		if(num > 3) $rootScope.numbers = num;
        quizPostData.number = $rootScope.numbers? $rootScope.numbers: 3;
        practicePostData.number = $rootScope.numbers? $rootScope.numbers: 3;
        $scope.quizChartConfig = {
            "options": {
                "chart": {
                    "type": "areaspline"
                },
                "plotOptions": {
                    "series": {
                        "stacking": ""
                    }
                }
            },
            xAxis: {
                categories: []
            },
            yAxis:{
                title:{text:"Score"},
                max: 100,
                min: 0
            },
            "series": [
                {
                    "name": "Overall Score",
                    "data": [],
                    "connectNulls": true,
                    "id": "series-1"
                },
                {
                    "name": "General Knowledge",
                    "data": [],
                    "type": "column",
                    "id": "series-2"
                },
                {
                    "name": "Software Quality Management",
                    "data": [],
                    "type": "column",
                    "id": "series-3"
                },
                {
                    "data": [],
                    "id": "series-4",
                    "name": "Engineering Process",
                    "type": "column",
                    "dashStyle": "Solid"
                },
                {
                    "data": [],
                    "id": "series-5",
                    "name": "Project Management",
                    "dashStyle": "Solid",
                    "type": "column"
                },
                {
                    "data": [],
                    "id": "series-6",
                    "type": "column",
                    "name": "Metrics & Analysis"
                },
                {
                    "data": [],
                    "id": "series-7",
                    "type": "column",
                    "name": "Software Verification & Validation"
                },
                {
                    "data": [],
                    "id": "series-8",
                    "type": "column",
                    "name": "Software Configuration Management"
                }
            ],
            "title": {
                "text": "Exam Mode Progression"
            },
            "credits": {
                "enabled": false
            },
            "loading": false,
            "size": {}
        };

        $scope.practiceChartConfig = {
            "options": {
                "chart": {
                    "type": "line"
                },
                "plotOptions": {
                    "series": {
                        "stacking": ""
                    }
                }
            },
            xAxis: {
                categories: []
            },
            yAxis:{
                title:{text:"Score"},
                max: 100,
                min: 0
            },
            "series": [
                {
                    "name": "Score",
                    "data": [],
                    "type": "spline",
                    "id": "series-3",
                    "dashStyle": "LongDash",
                    "connectNulls": false
                }
            ],
            "title": {
                "text": "practice Mode Progression"
            },
            "credits": {
                "enabled": false
            },
            "loading": false,
            "size": {}
        };


        getData(practicePostData).then(function(data){
            data.forEach(function (value) {
                $scope.practiceChartConfig.xAxis.categories.unshift(value.time);
                $scope.practiceChartConfig.series[0].data.unshift(value.score)
            })

        });

        getData(quizPostData).then(function(data){
            data.forEach(function (value) {
                $scope.quizChartConfig.xAxis.categories.unshift(value.time);
                $scope.quizChartConfig.series[0].data.unshift(value.score);
                $scope.quizChartConfig.series[1].data.unshift(value.gkScore);
                $scope.quizChartConfig.series[2].data.unshift(value.sqmScore);
                $scope.quizChartConfig.series[3].data.unshift(value.epScore);
                $scope.quizChartConfig.series[4].data.unshift(value.pmScore);
                $scope.quizChartConfig.series[5].data.unshift(value.maScore);
                $scope.quizChartConfig.series[6].data.unshift(value.svvScore);
                $scope.quizChartConfig.series[7].data.unshift(value.scmScore);

            })
        });
    };
});
