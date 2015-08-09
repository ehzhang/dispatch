var statusUrl = 'http://dispatch32.ngrok.com/api/pebblestatus/IDENTIFIER';

var cache = null;
var index = null;

function redraw() {
  if (cache === null || index === null) {
    simply.text({ title: 'Loading', subtitle: '', body: '' });
  } else if (cache.tasks && index >= cache.length) {
    simply.text({ title: 'No Tasks', subtitle: '', body: '' });
  } else {
    if (cache.tasks) {
      var item = cache.tasks[index];
      var title = '' + item.code + ' (' + (index + 1) + ' of ' + (cache.tasks.length) + ')';
      var subtitle = item.description;
      simply.text({ title: title, subtitle: subtitle, body: '' });
    } else if (cache.current) {
      var item = cache.current;
      var title = '[' + item.code + ']';
      simply.text({ title: title, subtitle: item.description, body: ''});
    }
  }
}

redraw();

simply.on('singleClick', function(e) {
  if (e.button === 'up') {
    if (index === null) {
      index = 0;
    } else {
      index--;
      if (index < 0) index = 0;
    }
    redraw();
  } else if (e.button === 'down') {
    if (index === null || cache === null || !cache.tasks) {
      index = 0;
    } else {
      index++;
      if (index >= cache.tasks.length) index = cache.tasks.length - 1;
    }
    redraw();
  } else if (e.button === 'select') {
    fetchData();
  }
});

function fetchData() {
  ajax({url: statusUrl}, function(data) {
    var body = JSON.parse(data);
    cache = body;
    index = 0;
    redraw();
  });
}

simply.on('longClick', function(e) {
  if (e.button === 'select') {
    if (cache === null) return;
    if (cache.tasks) {
      var item = cache.tasks[index];
      if (item) {
        ajax({method: 'post',
             url: statusUrl, type: 'json', data: {call: 'start', code: item.code}}, function(data) {
               fetchData();
             });
      }
    } else {
      ajax({method: 'post',
           url: statusUrl, type: 'json', data: {call: 'done'}}, function(data) {
             fetchData();
           });
    }
  } else if (e.button === 'up') {
    if (cache && cache.current) {
      ajax({method: 'post',
           url: statusUrl, type: 'json', data: {call: 'close'}}, function(data) {
             fetchData();
           });
    }
  }
});
