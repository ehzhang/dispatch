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
    if (this.profile.channels){
      return this.profile.channels.map(function(channelId){
        return Channels.findOne({_id: channelId});
      });
    }

    return [];
  }
});