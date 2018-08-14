// ==UserScript==
// @name Выполнить JavaScript
// @namespace govnokod
// @description Добавляет скриптам кнопку "Выполнить"
// @include *://govnokod.ru/*
// @include *://www.govnokod.ru/*
// @require https://code.jquery.com/jquery-1.4.min.js
// @version 0.0.5
// @grant none
// ==/UserScript==

(function($){

$('li.hentry:has(a[rel=chapter][text=JavaScript])').each(function(){
  var entry = $(this),
      result = $('<pre id="result">...</pre>');
  
  var execute = $('<a href="#">Выполнить</a>').click(function(){
    alert('Выполнять всякую хрень опасно!');
    return false;
    
    var code = entry.find('div.entry-content>pre');
    try {
      result.text('Успех: ' + String(eval(code.text())));
    } catch(e) {
      result.text('Ошибка: ' + e.message);
    }
    return false;
  });
  
  var edit = $('<a href="#">Редактировать</a>').click(function(){
    entry.find('div.entry-content>pre').attr('contentEditable', true);
    $(this).remove();
    return false;
  });
  
  var panel = $('<div>')
    .append(execute)
    .append(document.createTextNode(' '))
    .append(edit);
  
  entry.find('div.entry-content').after(panel).after(result);
});

})(window.jQuery || window.$);