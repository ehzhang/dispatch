handlePebbleGet = function() {
  // TODO use an auth token instead of a user ID here
  // this is insecure!
  var id = this.params.id;
  console.log('gen for id: ' + id);
  this.response.writeHead(200, { 'Content-Type': 'text/javascript' });
  this.response.end(Assets.getText('pebble.js').replace('IDENTIFIER', id));
};

handlePebbleStatusGet = function() {
  var id = this.params.id;
  var status = {};
  var task = Tasks.findOne({workers: id});
  if (task) {
    status.current = task;
    this.response.writeHead(200, { 'Content-Type': 'text/javascript' });
    this.response.end(JSON.stringify(status, null, 1));
  } else {
    // TODO show only relevant ones, not all
    var tasks = Tasks.find({status: 'open'}).fetch();
    status.tasks = tasks;
    this.response.writeHead(200, { 'Content-Type': 'text/javascript' });
    this.response.end(JSON.stringify(status, null, 1));
  }
};

handlePebblePost = function() {
  // TODO verify that this message is actually coming from hackbot before doing
  // any processing!
  console.log('got post')
  console.log(this.request.body);
  var body = this.request.body; // already parsed object
  if (body.call === 'start') {
    var id = this.params.id;
    var code = body.code;
    var result = Meteor.call('startTask', id, code);
    this.response.writeHead(200, { 'Content-Type': 'application/javascript' });
    this.response.end(JSON.stringify({status: 'ok'}));
  } else if (body.call === 'done') {
    var id = this.params.id;
    var res = Meteor.call('stopTask', id);
    this.response.writeHead(200, { 'Content-Type': 'application/javascript' });
    this.response.end(JSON.stringify({status: 'ok'}));
  } else if (body.call === 'close') {
    var id = this.params.id;
    var res = Meteor.call('closeTask', id);
    this.response.writeHead(200, { 'Content-Type': 'application/javascript' });
    this.response.end(JSON.stringify({status: 'ok'}));
  }
};
