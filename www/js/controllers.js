angular.module('starter.controllers', [])
  .controller('AppCtrl', function($scope, $ionicModal, MessageService, $rootScope) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // MESSAGE ALERT
  $rootScope.$on('messagesUpdated', function(event, data) {
    $scope.unread = data.unread;
    $scope.$apply();
  });

  // USER AUTH

  $rootScope.user = false;
  $scope.photoURL = 'img/user.png';

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      if(user.photoURL){
        $scope.photoURL = user.photoURL;
      }
      $rootScope.user = user;
      
      MessageService.updateMessages($rootScope);
      $scope.unread = MessageService.getUnread();
      
    } else {
      $rootScope.user = false;
    }
  });

  $scope.getAvatar = function(callback){
    if(navigator && navigator['camera']){
      const options = {
        quality: 50,
        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: navigator.camera.DestinationType.DATA_URL,
        encodingType: navigator.camera.EncodingType.PNG,
        mediaType: navigator.camera.MediaType.PICTURE,
        targetHeight: 512,
        targetWidth: 512
      }
      
      navigator.camera.getPicture((image) => {
          callback(image);
        }, (error) => {
          console.error("Error: ", error);
        },
        options);
    }else{
      callback("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
    }
  }

  $scope.dataURItoBlob = function(dataURI) {
    let binary = atob(dataURI);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
  };

  $scope.changeAvatar = function(){
    var user = firebase.auth().currentUser;

    $scope.getAvatar(function(avatar){

      var storageRef = firebase.storage().ref('photos/'+user.email+'/avatar.png');
      storageRef.put($scope.dataURItoBlob(avatar)).then((snapshot)=>{
        window['snapshot'] = snapshot.ref;
        snapshot.ref.getDownloadURL().then((photoURL)=>{
          $scope.photoURL = photoURL;
          user.updateProfile({
            photoURL: photoURL
          }).then(function() {
            //console.log('Update successful');
          }).catch(function(error) {
            //console.log(error.code);
            //console.log(error.message);
          });
          $scope.$apply();
        });
      }, (error)=>{
        //console.log('Upload FAIL!', error);
        //console.log(error.message);
      });
    });
  }

  // LOGIN

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Open the login modal
  $scope.logout = function() {
    //console.log('Doing logout', $scope.loginData);
    $scope.photoURL = 'img/user.png';
    firebase.auth().signOut();
    // Do logout
  };

  $scope.createUser = function(){
    firebase.auth().createUserWithEmailAndPassword($scope.loginData.username, $scope.loginData.password).then(function(user) {
      $scope.doLogin();
    },function(error) {
      alert(error.message);
    });
  }

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    //console.log('Doing login', $scope.loginData);

    firebase.auth().signInWithEmailAndPassword($scope.loginData.username, $scope.loginData.password)
    .then(function() {
      $scope.closeLogin();
    },function(error) {
      // Handle Errors here.
      if(error.code == 'auth/user-not-found'){
        // New user
        $scope.createUser();
      }else{
        alert(error.message);
      }
    });
  };

  // MESSAGE

  // Form data for the message modal
  $scope.messageData = {};

  // Create the message modal that we will use later
  $ionicModal.fromTemplateUrl('templates/messageForm.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalMessage = modal;
  });

  // Triggered in the message modal to close it
  $scope.closeMessage = function() {
    $scope.modalMessage.hide();
  };

  // Open the message modal
  $scope.createMessage = function() {
    $scope.modalMessage.show();
  };

  // Open the message modal
  $scope.saveMessage = function() {
    if(!$scope.messageData.title || !$scope.messageData.text){
      return;
    }

    MessageService.saveMessage({
      unread: 1,
      title: $scope.messageData.title,
      text: $scope.messageData.text,
      date: Date.now()
    }, $scope);
  };
});