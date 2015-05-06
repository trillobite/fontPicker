
/*
    var picker = new fontPicker({
      onActive: function() {
  
      },
      onSelect: function() {
  
      },
      fonts: [],
    }).load.selection().appendTo('body');
*/

var fontPicker = function(input) {
  var fontPickerDB = {
    fonts: {
      active: false,
    },
    selection: {
      active: false,
    }
  };
  var getGoogleAPI = function() {
    (function() {
      var wf = document.createElement('script');
      wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
    })();
  };

  var fonts = ['Open+Sans', 'Lora', 'Raleway', 'Inconsolata', 'Special+Elite', 'Alegreya+Sans', 'Great+Vibes', 'Tangerine'];

  var convertFonts = function(f) {
    fonts = f ? f : fonts;
    var tmp = [];
    for(var i = 0; i < fonts.length; ++i) {
      tmp[tmp.length] = fonts[i].replace(' ', '+') + '::latin';
    }
    return tmp;
  };

  var load = {
    fonts: function(fonts) {
      var dfd = new $.Deferred();
      WebFontConfig = { //creates a global variable.
        google: { 
          families: convertFonts(fonts),
        },
        active: function() {
          if(input.onActive) {
            input.onActive();
          }
          fontPickerDB.fonts.active = true;
          dfd.resolve();
        }
      };
      getGoogleAPI();
      return dfd.promise();
    },
    selection: function() {
      var loadIt = function() {
        var select = $jConstruct('select').event('change', function() {
          console.log(this.value);
          if(undefined !== input.onSelect) {
            input.onSelect(this.value);
          }
        });
        for(var i = 0; i < fonts.length; ++i) {
          var tmp = fonts[i].replace('+', ' ');
          select.addChild($jConstruct('option', {
            text: tmp,
            value: tmp,
          }).css({
            'font-family': tmp,
          }));
        }
        fontPickerDB.selection.active = true; //makes sure the user cannot attempt to execute selection loader more than once.
        return select;
      };
      console.log({
        selection: fontPickerDB.selection.active,
        font: fontPickerDB.fonts.active,
      });
      if(fontPickerDB.selection.active == false) {
        if(fontPickerDB.fonts.active == false) {
          loadFonts().done(function() {
            console.log('loaded fonts');
            loadIt();
          });
        } else {
          return loadIt();
        }
      };
    },
  };

  return {
    load: function(arg, arg2) {
      return load[arg](arg2);
    },
  };
};