


var fonts = ['Open+Sans', 'Slabo+27px', 'Oswald', 'Lora', 'Raleway', 'Indie+Flower', 'Lobster', 'Play', 'Inconsolata', 'Pacifico', 'Dancing+Script', 'Architects+Daughter', 'Lobster+Two', 'Amatic+SC', 'Courgette', 'Playball', 'Comfortaa', 'Playfair+Display+SC', 'Pinyon+Script', 'Cinzel', 'Luckiest+Guy', 'Special+Elite', 'Alegreya+Sans', 'Great+Vibes', 'Tangerine'];

var complete = (function() {
  var tmp = [];
  for(var i = 0; i < fonts.length; ++i) {
    tmp[tmp.length] = fonts[i]+'::latin';
  }
  return tmp;
})();

var selection = function(func) {
  var select = $jConstruct('select');
  for(var i = 0; i < fonts.length; ++i) {
    var tmp = fonts[i].replace('+', ' ');
    select.addChild($jConstruct('option', {
      text: tmp,
      value: tmp,
    }).css({
      'font-family': tmp,
    }).event('click', function() {
      //console.log(this.value);
      if(undefined !== func) {
        func(this.value);
      }
    }));
  }
  return select;
};

WebFontConfig = {
  google: { 
    families: complete,
  },
  active: function() {
    $jConstruct('div').addChild($jConstruct('div', {
      id: 'paragraph',
      text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minimveniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex eacommodo consequat. Duis aute irure dolor in reprehenderit in voluptatevelit esse cillum dolore eu fugiat nulla pariatur. Excepteur sintoccaecat cupidatat non proident, sunt in culpa qui officia deseruntmollit anim id est laborum.',
    })).appendTo('body');
    selection(function(value) {
      console.log(value);
      $('#paragraph').css({
        'font-family': value,
      });
      //arrdb.get('paragraph').refresh();
    }).appendTo('body');
  }
};

(function() {
  var wf = document.createElement('script');
  wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
    '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
  wf.type = 'text/javascript';
  wf.async = 'true';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(wf, s);
})();
