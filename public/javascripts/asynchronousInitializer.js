(function(window, document) {

  var autocomplete = new Autocomplete();
  function Autocomplete() {
    if (window.location.href.indexOf('localhost') >= 0) {
      this.server = window.location.origin;
    } else {
      this.server = '//address-autocomplete.herokuapp.com';
    }
    this.suggestions = [];
    this.states = {
      AL: 'Alabama',
      AK: 'Alaska',
      AZ: 'Arizona',
      AR: 'Arkansas',
      CA: 'California',
      CO: 'Colorado',
      CT: 'Connecticut',
      DE: 'Delaware',
      DC: 'DC',
      FL: 'Florida',
      GA: 'Georgia',
      HI: 'Hawaii',
      ID: 'Idaho',
      IL: 'Illinois',
      IN: 'Indiana',
      IA: 'Iowa',
      KS: 'Kansas',
      KY: 'Kentucky',
      LA: 'Louisiana',
      ME: 'Maine',
      MD: 'Maryland',
      MA: 'Massachusetts',
      MI: 'Michigan',
      MN: 'Minnesota',
      MS: 'Mississippi',
      MO: 'Missouri',
      MT: 'Montana',
      NE: 'Nebraska',
      NV: 'Nevada',
      NH: 'New Hampshire',
      NJ: 'New Jersey',
      NM: 'New Mexico',
      NY: 'New York',
      NC: 'North Carolina',
      ND: 'North Dakota',
      OH: 'Ohio',
      OK: 'Oklahoma',
      OR: 'Oregon',
      PA: 'Pennsylvania',
      RI: 'Rhode Island',
      SC: 'South Carolina',
      SD: 'South Dakota',
      TN: 'tennessee',
      TX: 'Texas',
      UT: 'Utah',
      VT: 'Vermont',
      VA: 'Virginia',
      WA: 'Washington',
      WV: 'West Virgina',
      WI: 'Wisonsin',
      WY: 'Wyoming'
    };
    this.init = function() {
      var wrapper = this.wrapper = document.getElementById('j_id0:j_id1:leadPB:PropertyInformation:j_id37'),
          street = this.street = document.getElementById('j_id0:j_id1:leadPB:PropertyInformation:j_id37:j_id38'),
          city = this.city = document.getElementById('j_id0:j_id1:leadPB:PropertyInformation:j_id37:j_id40'),
          state = this.state = document.getElementById('j_id0:j_id1:leadPB:PropertyInformation:j_id37:j_id42'),
          zip = this.zip = document.getElementById('j_id0:j_id1:leadPB:PropertyInformation:j_id37:j_id44');
      street.addEventListener('input', function() {
          this.getSuggestions(street.value.trim());
      }.bind(this));
      this.hinter = document.createElement('ul'),
      this.hinter.style.width = street.offsetWidth+'px';
      this.hinter.style.listStyle = 'none';
      this.hinter.style.margin = 0;
      this.hinter.style.padding = 0;
      this.hinter.style.position = 'absolute';
      this.hinter.style.background = '#fff';
      street.parentElement.appendChild(this.hinter);
    }.bind(this);
    this.getSuggestions = function(text) {
      this.request('/suggestions/js/'+text);
    }.bind(this);
    this.cb_getSuggestions = function(suggestions) {
      this.suggestions = suggestions;
      this.showSuggestions()
    }.bind(this);
    this.removeSuggestions = function() {
      var child;
      while (child = this.hinter.firstChild) {
        this.hinter.removeChild(child);
      }
    }.bind(this);
    this.showSuggestions = function() {
      var suggestion;
      this.removeSuggestions();
      for (var i = 0; i < this.suggestions.length; i++) {
        var item = this.suggestions[i];
        suggestion = document.createElement('li');
        suggestion.innerHTML = item.description;
        suggestion.setAttribute('street', item.street);
        suggestion.setAttribute('city', item.city);
        suggestion.setAttribute('state', item.state);
        suggestion.setAttribute('zip', item.zip);
        suggestion.addEventListener('click', this.selectHint.bind(this, suggestion));
        suggestion.style.fontSize = '12px';
        suggestion.style.margin = '0';
        suggestion.style.padding = '2px 6px';
        suggestion.style.background = i % 2 == 0 ? '#eaeaea' : '#fff';
        this.hinter.appendChild(suggestion);
      }
    }.bind(this);
    this.selectHint = function(suggestion) {
      var street = suggestion.getAttribute('street'),
          city = suggestion.getAttribute('city'),
          state = suggestion.getAttribute('state'),
          zip = suggestion.getAttribute('zip');
      this.street.value = street;
      this.city.value = city;
      this.state.value = this.states[state];
      this.zip.value = zip;
      this.removeSuggestions();
    }.bind(this);
    this.request = function(path) {
      var doc = document.getElementsByTagName('head')[0],
          tag = document.createElement('script'),
          el = document.getElementById('address'),
          requestUrl = this.server+path;
      tag.setAttribute('type', 'text/javascript');
      tag.setAttribute('src', requestUrl);
      doc.appendChild(tag);
    }.bind(this);
  };

  window.initAddressAutocomplete = autocomplete.init;  
  window.updateAddressAutocomplete = autocomplete.cb_getSuggestions;

})(window, document);
