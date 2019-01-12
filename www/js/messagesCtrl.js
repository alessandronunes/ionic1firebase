angular.module('starter.controllers').controller('MessagesCtrl', function($scope, MessageService, $rootScope) {
  $scope.messages = MessageService.getMessages();
  $rootScope.$on('messagesUpdated', function(event, data) {
    $scope.messages = data.messages;
    $scope.$apply();
  });
});