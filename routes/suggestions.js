var express = require('express');
var router = express.Router();

var qs = require('qs');
var parseString = require('xml2js').parseString;

var http = require('http');
var https = require('https');

var Receiver = require('receiver');

var dotenv = require('dotenv');
dotenv.load();

var Collection = function(size, callback) {
  this._end = size;
  this._collection = [];
  this._length = 0;
  this.callback = callback;
  this.add = function(item) {
    if (item) {
      this._collection.push(item);
    }
    this._length++;
    if (this._length >= this._end) {
      this.callback(this._collection);
    }
  }.bind(this);
};

var validateAddress = function(address, city, state, collection) {
  var testServer = 'http://production.shippingapis.com/ShippingAPITest.dll',
      liveServer = 'http://production.shippingapis.com/ShippingAPI.dll',
      queryParameters = {
        API : 'Verify',
        XML : '<AddressValidateRequest USERID="'+process.env.USPS_API_UID+'">\
                <Address ID="0">\
                  <Address1>'+address+'</Address1>\
                  <Address2></Address2>\
                  <City>'+city+'</City>\
                  <State>'+state+'</State>\
                  <Zip5></Zip5>\
                  <Zip4></Zip4>\
                </Address>\
               </AddressValidateRequest>'
      },
      queryString = qs.stringify(queryParameters),
      requestUrl = liveServer+'?'+queryString;

  http.get(requestUrl, function(response) {
    var data = new Receiver();
    response.on('data', data.receive);

    response.on('end', function() {
      parseString(data, function (err, result) {
        var address = result.AddressValidateResponse.Address[0];
        if (address.Error) {
          collection.add();
        } else {
          collection.add({
            description: [address.Address2, address.City, address.State, address.Zip5].join(' '),
            street: address.Address2,
            city: address.City,
            state: address.State,
            zip: address.Zip5
          });
        }
      });
    });
  });
};

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
        var collection = new Collection(5, function(suggestions) {
          res.send('window.updateAddressAutocomplete('+JSON.stringify(suggestions)+');');
        });
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
          validateAddress(suggestion.street, suggestion.city, suggestion.state, collection);
        });
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
