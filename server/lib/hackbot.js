handleHackbotGet = function() {
  // return status information
  var status = {};
  var tasks = Tasks.find({status: 'open'}).fetch();
  status.tasks = tasks;
  this.response.writeHead(200, { 'Content-Type': 'application/json' });
  this.response.end(JSON.stringify(status, null, ' '));
}

handleHackbotPost = function() {
  // TODO verify that this message is actually coming from hackbot before doing
  // any processing!
  var body = this.request.body; // already parsed object
  console.log('got post!');
  console.log(body);
  if (body.call === 'create') {
    var args = body.arguments;
    var min = args.min;
    var max = args.max;
    var description = args.description;
    var channelNames = args.channelNames;

    var channels = Channels.find({name: {$in: channelNames}}).fetch();
    var channelIds = [];
    for (var i = 0; i < channels.length; i++) {
      channelIds.push(channels[i]._id.toString());
    }
    if (channelIds.length > 0) {
      var code = Meteor.call('createTask', null, [], channelIds, description, min, max);
    }

    var channelNamesReal = [];
    for (var i = 0; i < channels.length; i++) {
      channelNamesReal.push(channels[i].name);
    }
    var response = {code: code, channels: channelNamesReal};
    this.response.writeHead(200, { 'Content-Type': 'application/json' });
    this.response.end(JSON.stringify(response, null, ' '));
  } else if (body.call === 'close') {
    // TODO handle
    // TODO respond
  }
};
