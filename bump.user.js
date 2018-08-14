// ==UserScript==
// @name govnokod: bump
// @namespace govnokod.ru
// @include *://govnokod.ru/*
// @include *://www.govnokod.ru/*
// @require https://code.jquery.com/jquery-1.4.min.js
// @version 1.1.1
// @grant none
// ==/UserScript==

(function($) {

function bump() {
  function randomth(a) { return a[Math.random() * a.length | 0]; }
  function badSentence(s) {
    var wlen = s.split(' ').length;
    return wlen < 5 || s.replace(/ /g,'').length <= wlen;
  }
  
  var sentences = $('.comment-text')
    .map(function(){ return $(this).text().split(/[\.\n]/); })
    .filter(function(){ return /[А-ЯЁ][А-Яа-яЁё ]+/.test(this); })
    .map(function(){ return this.trim(); })
    .toArray();
  
  if(sentences.length == 0)
    return 'бамп';
  
  if(sentences.every(badSentence))
    return randomth(sentences);
  
  var words = (function sentence() {
    var s = randomth(sentences);
    return badSentence(s) ? sentence() : s;
  })().split(' ');
  
  var wordToChange = (function wtc() {
    var i = Math.random() * words.length | 0;
    return i == 0 || words[i].length <= 1 ? wtc() : i;
  })();
  
  return words.map(function(word, i) {
    if(i != wordToChange) return word;
    var l1 = Math.random() * word.length | 0;
    var l2 = (function l2(){
      var i = Math.random() * word.length | 0;
      return i != l1 ? i : l2();
    })();
    return word.split('').map(function(letter, i) {
      if(i == l1) return word[l2];
      if(i == l2) return word[l1];
      return letter;
    }).join('');
  }).join(' ');
}

$('a.answer, h3>a').each(function(){
  $(this).after($('<a href="#">Бамп</a>')
    .css('margin-left', '1ex')
    .addClass('answer')
    .click(function(){
      $('#formElm_text').val(bump());
    }));
});

})(window.jQuery || window.$);
