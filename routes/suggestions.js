var express = require('express');
var router = express.Router();

var qs = require('qs');
var https = require('https')

var Receiver = require('receiver');

var dotenv = require('dotenv');
dotenv.load();


router.get('/:format/:query', function(req, res) {
  var url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      query = qs.stringify({
        input : req.params.query,
        key : process.env.GOOGLE_API_KEY
      }),
      requestUrl = [url, query].join('?'),
      error = function() {
        res.render('requestError', {
          error: error.message
        });
      };

  https.get(requestUrl, function(response) {
    var data = new Receiver();
    response.on('data', data.receive);

    response.on('end', function() {
      var suggestions = JSON.parse(data).predictions;
      if (req.params.format == 'json') {
        res.send({
          suggestions: suggestions.map(function(item, index) {
            return item.description
          })
        });
      } else if (req.params.format == 'js') {
        res.set('Content-Type', 'application/javascript');
        res.send('window.updateAddressAutocomplete(['+suggestions.map(function(item, index) {
            return '"'+item.description+'"'
          }).join(',')+']);');
      } else {
        res.render('suggestions', {
          query: req.params.query,
          suggestions: suggestions
        });
      }
    });
  }).on('error', error);
});

module.exports = router;
