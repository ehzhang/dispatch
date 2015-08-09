var base = '/api/';

var api = [
  {
    endpoint: 'twilio',
    post: handleTwilio,
    get: function() {
      this.response.end('GET not supported');
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
