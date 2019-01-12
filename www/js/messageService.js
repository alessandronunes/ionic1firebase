angular.module('starter').service('MessageService', function(){
    return {
      userEmail: '',
      messages: [],
      unread: 0,
      getUnread: function(){
        return this.unread;
      },
      getMessages: function(){
        return this.messages;
      },
      saveMessage(newMessage, $scope){
        db.doc("messages/"+this.userEmail).collection("messages").add(newMessage)
        .then(function(docRef) {
            //console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
            //console.error("Error adding document: ", error);
        }).finally(function() {
          $scope.messageData.title = '';
          $scope.messageData.text = '';
          $scope.closeMessage();
        });
      },
      searchMessage: function(id, update){
        var msg = false;
        this.messages.forEach((msgSearch, key) => {
          if(msgSearch.id == id){
            msg = msgSearch;
            if(update){
              this.messages[key].unread = 0;
            }
          }
        });
        return msg;
      },
      readMessage: function(messageId){
        // Set read
        var messageRef = db.doc("messages/"+this.userEmail).collection("messages").doc(messageId);
    
        // Set the "capital" field of the city 'DC'
        messageRef.update({
            unread: 0
        })
        .then(function() {
            //console.log("Document successfully updated!");
        })
        .catch(function(error) {
            // The document probably doesn't exist.
            //console.error("Error updating document: ", error);
        });
      
      },
      updateMessages: function($rootScope){
        var me = this;
        this.userEmail = $rootScope.user.email;
        db.doc("messages/"+this.userEmail).collection("messages").orderBy("date", "desc").onSnapshot(function(querySnapshot) {
          var messages = [];
          var unread = 0;
          
          querySnapshot.forEach((msg) => {
            var msgTemp = msg.data();
            msgTemp.id = msg.id;
            messages.push(msgTemp);
            if(msgTemp.unread){
              unread += parseInt(msgTemp.unread);
            }
          });

          me.unread = unread;
          me.messages = messages;
          
          $rootScope.$broadcast('messagesUpdated', {
            unread: unread,
            messages: messages
          });
        });
      }
    };
  });