// ==UserScript==
// @name BB-codes
// @namespace userscripts_1024__
// @include http://govnokod.ru/*
// @include http://www.govnokod.ru/*
// @version 1.2.2
// @grant none
// ==/UserScript==

(function(){

// Описание кнопок в формате ["что написано на кнопке", "что оно сделает с xxx"]
// или ["что написано на кнопке", функция, возвращающая строку
// или [строку, позицию курсора относительно начала этой строки]"]
// Можно добавить свои :)
var buttons = [
  ['<span style="color: green">[G]</span>', '[color=green]xxx[/color]'],
  ['[<b>B</b>]', '[b]xxx[/b]'],
  ['[<i>I</i>]', '[i]xxx[/i]'],
  ['[<s>S</s>]', '[s]xxx[/s]'],
  ['[<u>U</u>]', '[u]xxx[/u]'],
  ['[URL]', function(sel){
      sel = sel.replace(/\S{30}/g, '$&[i][/i]');
      var pre = '[color=blue][u]', post = '[/u][/color]';
      return [pre + sel + post, pre.length + sel.length];
  }],
  ['[big]', '[size=20]xxx[/size]'],
  ['[small]', '[size=10]xxx[/size]'],
  ['[code]', '[code]xxx[/code]'],
  ['[spoiler]', '[color=white]xxx[/color]'],
  ['[fatroll]',
              '[size=20][color=green][u][color=red][s][color=blue][b][i]xxx' +
              '[/i][/b][/color][/s][/color][/u][/color][/size]'],
  ['[quote]', function(sel){
      var s = window.getSelection();
      var quote = String(s).replace(/\r\n|\r|\n|^/g, '$&>> ') + '\n';
      
      if(!s.anchorNode) return ['', 0];
      if($(s.anchorNode).closest('li.hcomment')
        .children('ul').children('li').children('form').length)
        return quote;
      
      var comment = $(s.anchorNode).closest('div.entry-comment-wrapper');
      if(!comment.length) return quote;
      return '[b]' + comment.find('.entry-author>a').text() + '[/b] в ' +
        '[color=blue][u]' + comment.find('a.comment-link').attr('href') +
        '[/u][/color] написал:\n' + quote;
  }],
  // ['[capsbold]', function(sel){
    // sel = sel.toUpperCase();
    // return ['[b]' + sel + '[/b]', '[b]'.length + sel.length];
  // }]
];

function appendButtons() {
  var comment = document.querySelector('textarea#formElm_text');
  var info = comment.parentNode;

  if(!comment || !info) return;
  if(info.querySelector('div.userscript-1024--bb-code')) return;
  var container = document.createElement('div');
  container.className = 'userscript-1024--bb-code';
  
  buttons.forEach(function(b){
    var name = b[0], code = b[1];
    var action = typeof code === 'function' ? code : function(sel){
      return code.replace('xxx', sel);
    };
    
    var button = document.createElement('a');
    button.innerHTML = name;
    button.href = '#';
    if(typeof code !== 'function') button.title = code;
    
    button.addEventListener('click', function(event){
      var start = comment.selectionStart, end = comment.selectionEnd;
      var pre = comment.value.substring(0, start);
      var sel = comment.value.substring(start, end);
      var post = comment.value.substring(end);
      
      var res = action(sel), newSel, pos;
      if(typeof res === 'string') {
        newSel = res;
        pos = res.length;
      } else {
        newSel = res[0];
        pos = res[1];
      }
      comment.value = pre + newSel + post;
      comment.selectionStart = comment.selectionEnd =
        typeof code === 'function' ?
          pre.length + pos :
          pre.length + code.replace(/xxx.*$/,'').length + sel.length;
      comment.focus();
      
      event.preventDefault();
    });
    
    container.appendChild(document.createTextNode(' '));
    container.appendChild(button);
  });
  
  info.appendChild(container);
}

appendButtons();
$('a.answer, h3>a').live('click', appendButtons);
$(document).ajaxComplete(appendButtons);

})();