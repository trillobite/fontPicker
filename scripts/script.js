
var picker = new fontPicker({
  onActive: function() {
    $jConstruct('div').addChild($jConstruct('div', {
      id: 'paragraph',
      text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minimveniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex eacommodo consequat. Duis aute irure dolor in reprehenderit in voluptatevelit esse cillum dolore eu fugiat nulla pariatur. Excepteur sintoccaecat cupidatat non proident, sunt in culpa qui officia deseruntmollit anim id est laborum.',
    })).appendTo('body');
  },
  onSelect: function(value) {
    $('#paragraph').css({
      'font-family': value,
    });
  },
});

var fonts = ['Open Sans', 'Oswald', 'Lora', 'Raleway', 'Indie Flower', 'Lobster', 'Play', 'Inconsolata', 'Pacifico', 'Dancing Script', 'Architects Daughter', 'Lobster Two', 'Amatic SC', 'Courgette', 'Playball', 'Comfortaa', 'Playfair Display+SC', 'Pinyon Script', 'Cinzel', 'Luckiest Guy', 'Special Elite', 'Alegreya Sans', 'Great Vibes', 'Tangerine'];

picker.load('fonts', fonts).done(function() {
  picker.load('selection').appendTo('body');
});