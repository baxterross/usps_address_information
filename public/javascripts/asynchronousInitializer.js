(function(window, document) {

  var autocomplete = new Autocomplete();
  function Autocomplete() {
    this.server = 'http://localhost:3000';
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
      var wrapper = this.wrapper = document.getElementById('j_id0:j_id1:leadPB:AddressInformationPBS'),
          street = this.street = document.getElementById('j_id0:j_id1:leadPB:AddressInformationPBS:j_id7'),
          city = this.city = document.getElementById('j_id0:j_id1:leadPB:AddressInformationPBS:j_id9'),
          state = this.state = document.getElementById('j_id0:j_id1:leadPB:AddressInformationPBS:j_id11'),
          zip = this.zip = document.getElementById('j_id0:j_id1:leadPB:AddressInformationPBS:j_id13'),
          eventName = 'input',
          eventHandler = function() {
            var values = [
                  street.value.trim(),
                  city.value.trim(),
                  state.value.trim(),
                  zip.value.trim()
                ],
                value = values.join(' ').replace(['  '], [' ']).trim();
            this.getSuggestions(value);
          }.bind(this);
      street.addEventListener(eventName, eventHandler);
      city.addEventListener(eventName, eventHandler);
      state.addEventListener(eventName, eventHandler);
      zip.addEventListener(eventName, eventHandler);
      this.hinter = document.createElement('ul'),
      wrapper.insertBefore(this.hinter, wrapper.firstChild);
    }.bind(this);
    this.getSuggestions = function(text) {
      this.request('/suggestions/js/'+text);
    }.bind(this);
    this.cb_getSuggestions = function(suggestions) {
      this.suggestions = suggestions;
      this.showSuggestions()
    }.bind(this);
    this.showSuggestions = function() {
      var suggestion,
          child;
      while (child = this.hinter.firstChild) {
        this.hinter.removeChild(child);
      }
      for (var i = 0; i < this.suggestions.length; i++) {
        var item = this.suggestions[i];
        suggestion = document.createElement('li');
        suggestion.innerHTML = item.description;
        suggestion.setAttribute('street', item.street);
        suggestion.setAttribute('city', item.city);
        suggestion.setAttribute('state', item.state);
        suggestion.setAttribute('zip', item.zip);
        suggestion.addEventListener('click', this.selectHint.bind(this, suggestion));
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
