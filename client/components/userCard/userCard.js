Template.userCard.events({

});

Template.userCard.helpers({
  'facebookImageUrl': function(){
    if (this.services.facebook){
      return 'https://graph.facebook.com/' +
        this.services.facebook.id +
        '/picture?type=large';
    } else {
      return '/assets/images/stardust.png';
    }
  },
  'statusIs': function(state){
    return  true;
  },
  'channels': function(){
    // TODO WHEN ADD ACTUAL CHANNELS
    return [
      {color: '#3498db', name: 'dev', _id: '1'},
      {color: '#9b59b6', name: 'support', _id: '3'},
      {color: '#e67e22', name: 'logs', _id: '5'},
      {color: '#2c3e50', name: 'volunteers', _id: '9'},
    ];
  }
});