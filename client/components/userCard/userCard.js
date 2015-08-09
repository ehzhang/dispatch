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
  'statusClass': function(){
    var userId = this._id;

    if (!this.profile.online){
      return 'red'; // Unavailable
    }

    var task = Tasks.findOne({
      workers: {
        $in: [userId]
      }
    });

    if (task){
      return 'yellow'; // Busy
    }

    return 'green';

  },
  'channels': function(){
    if (this.profile.channels){
      return this.profile.channels.map(function(channelId){
        return Channels.findOne({_id: channelId});
      });
    }
    return [];
  },
});