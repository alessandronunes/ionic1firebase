angular.module('starter.controllers').controller('MessageCtrl', function($scope, $stateParams, MessageService) {
  
  $scope.message = {
     title: '',
     text: '', 
     date: 0,
     unread: 0
  };
  
  $scope.message = MessageService.searchMessage($stateParams.messageId);
  
  if($scope.message.unread == 1){
    MessageService.readMessage($stateParams.messageId);
  }
  
});


