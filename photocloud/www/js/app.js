// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('photocloud', ['ionic','ngCordova','firebase'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

// set up url router and state provider
.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider){
	$stateProvider.state('login',{
			url: '/login',
			templateUrl: 'templates/login.html',
			controller: 'AuthCtrl',
			cache: false
		})
		.state('photos',{
			url: '/photos',
			templateUrl: 'templates/photos.html',
			controller: 'PhotosCtrl'
		});
	$urlRouterProvider.otherwise('login');
}])

.controller('AuthCtrl',['$scope','$state','$firebaseAuth',function($scope,$state,$firebaseAuth){
	console.log('AuthCtrl');
	
	$scope.login = function(username, password){
		console.log('Login ' + username + ', ' + password);
		
		firebase.auth().signInWithEmailAndPassword(username, password).then(function(){
			// Sign-in successful.
			console.log('You are Logged in');
			$state.go('photos');
		}).catch(function(error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log('Error: ' + errorMessage);
		});
	}
	
	$scope.register = function(username, password){
		console.log('Register ' + username + ', ' + password);
		
		firebase.auth().createUserWithEmailAndPassword(username, password).then(function(){
			// Register successful.
			console.log('You are registered');
			$state.go('photos');
		}).catch(function(error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log('Error: ' + errorMessage);
		});
	}
	
	$scope.logout = function(){
		console.log('Logging Out...');
		
		firebase.auth().signOut().then(function() {
			// Sign-out successful.
			console.log('You are Logged Out.');
			$state.go('login');
		}, function(error) {
			// An error happened.
			var errorMessage = error.message;
			console.log('Error: ' + errorMessage);
		});
	}
}])

.controller('PhotosCtrl',['$scope','$state','$ionicHistory','$cordovaCamera','$firebaseArray',function($scope,$state,$ionicHistory,$cordovaCamera,$firebaseArray){
	console.log('PhotosCtrl');
	// clear history
	$ionicHistory.clearHistory();
	
	// array of images
	$scope.images = [];
	
	// Get Login Status
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// User is signed in.
			var isAnonymous = user.isAnonymous;
			var userReference = firebase.database().ref('users/' + user.uid);
			console.log(user);
			// users images in firebase 
			var syncArray = $firebaseArray(userReference.child('images'));
			//console.log(syncArray);
			$scope.images = syncArray;
		} else {
			// User is signed out.
			console.log('User is signed out....');
			// redirect
			$state.go('login');
		}
		// ...
		console.log('end...');
	});
	
	$scope.upload = function(){
		console.log('Uploading images...');
		
		// phonegap camera api options
		var options = {
			quality: 75,
			destinationType: Camera.DestinationType.DATA_URL,
			sourceType: Camera.PictureSourceType.CAMERA,
			allowEdit: true,
			encodingType: Camera.EncodingType.JPEG,
			popoverOptions: Camera.PopoverOptions,
			targetWidth: 500,
			targetHeight: 500,
			saveToPhotoAlbum: false
		};
		
		// camera api
		$cordovaCamera.getPicture(options).then(function(data){
			syncArray.$add({
				image: data
			}).then(function(){
				alert('Image Uploaded...');
			});
		}, function(error){
			// An error happened.
			var errorMessage = error.message;
			console.log('Upload Error: ' + errorMessage);
		});
	}
}])
