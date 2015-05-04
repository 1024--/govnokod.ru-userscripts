// ==UserScript==
// @name BB-codes
// @namespace userscripts_1024__
// @include http://govnokod.ru/*
// @include http://www.govnokod.ru/*
// @version 1.1.1
// @grant none
// ==/UserScript==

(function(){

// Описание кнопок в формате ["что написано на кнопке", "что оно сделает с xxx"]
// Можно добавить свои :)
var buttons = [
  ['<span style="color: green">[G]</span>', '[color=green]xxx[/color]'],
  ['[<b>B</b>]', '[b]xxx[/b]'],
  ['[<i>I</i>]', '[i]xxx[/i]'],
  ['[<s>S</s>]', '[s]xxx[/s]'],
  ['[<u>U</u>]', '[u]xxx[/u]'],
  ['[URL]', '[color=blue][u]xxx[/u][/color]'],
  ['[big]', '[size=20]xxx[/size]'],
  ['[small]', '[size=10]xxx[/size]'],
  ['[code]', '[code]xxx[/code]'],
  ['[spoiler]', '[color=white]xxx[/color]'],
  ['[fatroll]',
              '[size=20][color=green][u][color=red][s][color=blue][b][i]xxx' +
              '[/i][/b][/color][/s][/color][/u][/color][/size]'],
  ['[quote]', function(sel){
      return '>> ' + String(window.getSelection()) + '\n';
  }],
  // ['[capsbold]', function(sel){
    // return '[b]' + sel.toUpperCase() + '[/b]';
  // }]
];

function appendButtons() {
  var comment = document.querySelector('textarea#formElm_text');
  var info = comment.parentNode;

  if(!comment || !info) return;
  if(info.querySelector('.userscript-1024--bb-code')) return;
  
  buttons.forEach(function(b){
    var name = b[0], code = b[1];
    var action = typeof code === 'function' ? code : function(sel){
      return code.replace('xxx', sel);
    };
    
    var button = document.createElement('a');
    button.innerHTML = name;
    button.className = 'userscript-1024--bb-code';
    button.href = '#';
    button.title = code;
    button.addEventListener('click', function(event){
      var start = comment.selectionStart, end = comment.selectionEnd;
      var pre = comment.value.substring(0, start);
      var sel = comment.value.substring(start, end);
      var post = comment.value.substring(end);
      
      var newSel = action(sel);
      comment.value = pre + newSel + post;
      comment.selectionStart = comment.selectionEnd =
        typeof code === 'function' ?
          pre.length + newSel.length :
          pre.length + code.replace(/xxx.*$/,'').length + sel.length;
      comment.focus();
      
      event.preventDefault();
    });
    
    info.appendChild(document.createTextNode(' '));
    info.appendChild(button);
  });
}

$('a.answer, h3>a').live('click', appendButtons);

})();