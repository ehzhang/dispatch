var base = '/api/';

var api = [
{
  endpoint: 'restful',
  get: function(){
    this.response.end('get request\n');
  },
  post: function(){
    this.response.end('post request\n');
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
