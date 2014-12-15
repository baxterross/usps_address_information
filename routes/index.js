var express = require('express');
var router = express.Router();

var qs = require('qs');
var http = require('http')
var https = require('https')
var parseString = require('xml2js').parseString;
var dotenv = require('dotenv');
dotenv.load();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Express'
  });
});

router.get('/autocomplete', function(req, res) {
  var autocompleteServer = 'https://maps.googleapis.com/maps/api/place/autocomplete',
      format = 'json',
      queryParameters = {
        input : req.query.address,
        key : process.env.GOOGLE_API_KEY
      },
      queryString = qs.stringify(queryParameters),
      requestUrl = [autocompleteServer, format].join('/')+'?'+queryString;

  https.get(requestUrl, function(response) {
    var data = '';

    response.on('data', function(chunk) {
      data += chunk;
    });

    response.on('end', function() {
      data = JSON.parse(data);
      console.log(data.predictions[0]);
      var testServer = 'http://production.shippingapis.com/ShippingAPITest.dll',
          liveServer = 'http://production.shippingapis.com/ShippingAPI.dll',
          address = data.predictions[0],
          queryParameters = {
            API : 'Verify',
            XML : '<AddressValidateRequest USERID="'+process.env.USPS_API_UID+'">\
                    <Address ID="0">\
                      <Address1>'+address.terms[0].value+'</Address1>\
                      <Address2></Address2>\
                      <City>'+address.terms[1].value+'</City>\
                      <State>'+address.terms[2].value+'</State>\
                      <Zip5></Zip5>\
                      <Zip4></Zip4>\
                    </Address>\
                   </AddressValidateRequest>'
          },
          queryString = qs.stringify(queryParameters),
          requestUrl = liveServer+'?'+queryString;

      http.get(requestUrl, function(response) {
        var data = '';

        response.on('data', function(chunk) {
          data += chunk;
        });

        response.on('end', function() {
          parseString(data, function (err, result) {
            var addresses = result.AddressValidateResponse.Address;
            res.render('queryResponse', {
              requestUrl: requestUrl,
              address: addresses[0],
              query: req.query
            });
          });
        });
      }).on('error', function(e) {
        res.render('requestError', {
          error: error.message
        });
      });
    });
  });
});

router.get('/query', function(req, res) {
  var testServer = 'http://production.shippingapis.com/ShippingAPITest.dll',
      liveServer = 'http://production.shippingapis.com/ShippingAPI.dll',
      queryParameters = {
        API : 'Verify',
        XML : '<AddressValidateRequest USERID="'+process.env.USPS_API_UID+'">\
                <Address ID="0">\
                  <Address1>'+req.query.street+'</Address1>\
                  <Address2></Address2>\
                  <City>'+req.query.city+'</City>\
                  <State>'+req.query.state+'</State>\
                  <Zip5></Zip5>\
                  <Zip4></Zip4>\
                </Address>\
               </AddressValidateRequest>'
      },
      queryString = qs.stringify(queryParameters),
      requestUrl = liveServer+'?'+queryString;

  http.get(requestUrl, function(response) {
    var data = '';

    response.on('data', function(chunk) {
      data += chunk;
    });

    response.on('end', function() {
      parseString(data, function (err, result) {
        var addresses = result.AddressValidateResponse.Address;
        res.render('queryResponse', {
          requestUrl: requestUrl,
          address: addresses[0],
          query: req.query
        });
      });
    });
  }).on('error', function(e) {
    res.render('requestError', {
      error: error.message
    });
  });
});
module.exports = router;
