var base = '/api/';

var api = [
  {
    endpoint: 'twilio',
    post: function() {
      // TODO verify that this message is actually coming from Twilio!
      var body = this.request.body; // already JSON
      var twilio = Meteor.npmRequire('twilio');
      console.log('body: ' + JSON.stringify(this.request.body));
      var resp = new twilio.TwimlResponse();
      resp.message(new Date().toString());
      console.log(resp.toString());
      this.response.writeHead(200, { 'Content-Type': 'text/xml' });
      this.response.end(resp.toString());
    }
  }
];

// Build the API
api.forEach(function(endpoint){
  var route = Router.route(base + endpoint.endpoint, {where: 'server'});
  if (endpoint.get) {
    route.get(endpoint.get);
  }
  if (endpoint.post) {
    route.post(endpoint.post);
  }
});
