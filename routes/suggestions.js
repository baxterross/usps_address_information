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
        types : 'address',
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
        suggestions = suggestions.map(function(item, index) {
          var suggestion = {
            description: item.description,
            street: '',
            city: '',
            state: '',
            zip: '',
            termsLength: item.terms.length
          };
          if (item.terms.length == 5) {
            suggestion.street = [item.terms[0].value, item.terms[1].value].join(' ');
            suggestion.city = item.terms[2].value;
            suggestion.state = item.terms[3].value;
            suggestion.zip = '';
          } else if (item.terms.length == 4) {
            suggestion.street = item.terms[0].value;
            suggestion.city = item.terms[1].value;
            suggestion.state = item.terms[2].value;
            suggestion.zip = '';
          }
          return suggestion;
        });
        res.send('window.updateAddressAutocomplete('+JSON.stringify(suggestions)+');');
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
