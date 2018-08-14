// ==UserScript==
// @name govnokod: new comments
// @namespace govnokod
// @description Enables user to move between new comments.
// @include *://govnokod.ru/*
// @include *://www.govnokod.ru/*
// @require      https://code.jquery.com/jquery-1.4.min.js
// @version 2.6.1
// @grant none
// ==/UserScript==

/*
  Используемые кнопки:
  h j k l - перемещение по новым комментариям
                  (j-k - вниз-вверх, h-l - первый-последний)
  u i o p - перемещение по всем комментариям
                  (i-o - вниз-вверх, u-p - первый-последний)
  m - переход к комментарию-родителю с записью позиции в стек
  n - возврат на одну позицию из стека
  , - возврат на последнюю позицию из стека
  [ ] - перемещение на комментарии того же уровня
  b - раскрытие поста в стоке или показ комментариев к текущему посту или
        раскрытие бесконечного стока Борманда или
  y - открытие поста в новой вкладке
  
  + - режим сортировки 1: согласно настройкам
  - - режим сортировки 2: по координате x
  0 - режим сортировки 3: по дате
  Ctrl+/ - включение/отключение зелёного фона
  
  Shift + h j k l u i o p - перемещение по странице
    j-k и i-o - вниз-вверх на shift пикселей (одна из настроек)
    h-l и u-p - на начало-конец страницы
  
  Shift+y - закрытие текущего окна
  Shift+b - открытие формы ответа на текущий комментарий
  
  Скрипт имеет некоторые параметры, которые можно настроить
        (см. "Настройки навигации" в меню пользователя)
*/

(function($){
var $html = $('html');
var $body = $('body');
var $page = $('body, html');
var SCRIPT_ID = 'beefdb51-28e7-4ff2-a74b-43d2971e4933';

// управление настройками скрипта ----------------------------------------------
function Option(defval){
  this.defaultValue = defval;
  this.value = defval;
}

Option.prototype.setDefault = function(){
  this.value = this.defaultValue;
};

Option.prototype.set = function(value){
  this.value = value;
};

Option.prototype.get = function(){
  return this.value == null ? this.defaultValue : this.value;
};

var options = {
  animation: new Option(0),
  expand:    new Option(false),
  by_date:   new Option(false),
  shift:     new Option(100)
}, optionString = loadOptions();

var sort_order = {
  USE_OPTIONS: 0,
  BY_POSITION: 1,
  BY_DATE:     2,
  
  by_position: function(a, b){ return a.y    - b.y;    },
  by_date:     function(a, b){ return a.date - b.date; },
  
  value_: 0,
  set: function(order){ this.value_ = order; },
  get: function(){
    var val = this.value_;
    if(val == this.USE_OPTIONS) val = options.by_date.get() ? this.BY_DATE : this.BY_POSITION;
    
    switch(val){
    case this.BY_DATE: return this.by_date;
    case this.BY_POSITION: return this.by_position;
    default:
      throw new Error('Unknown order: ' + val);
    }
  }
};

// установка опций по строке optstr
function applyOptions(optstr){
  optionString = optstr;
  for(var name in options) options[name].setDefault();
  optstr.split(/[^a-z_=0-9]+/).forEach(function(o){
    var option = o.split('='), oname = option[0];
    if(!(oname in options)) return;
    options[oname].set(option.length > 1 ? +option[1] : true);
  });
}

// загрузка строки опций из хранилища
function loadOptions(){
  var opts = localStorage.getItem(SCRIPT_ID + 'options') || 'animation=50, expand=1, by_date=0';
  applyOptions(opts);
  return opts;
}

// обработка пользовательской строки опций: применение и сохранение
function changeOptions(){
  var options = prompt(
    'Введите строку опций в формате <option>, <option>, ...\n' +
    'Если какой-то опции не будет в списке, она будет отключена\n' +
    'Возможные варианты:\n' +
    '  animation=<ms> - время анимации (0 - отключить)\n' +
    '  expand - расширять ли страницу с комментариями\n' +
    '  by_date=1 - перемещаться по комментариям по умолчанию в хронологическом порядке\n' +
    '  by_date=0 - перемещаться по комментариям по умолчанию порядке их высоты\n' +
    '  shift=<число> - количество пикселей, на которое можно перемещаться по Shift+j/k\n' +
    'Примеры:\n' +
    '  animation=0, expand - отключить анимацию, расширять страницу\n' +
    '  animation=0 - отключить анимацию, не расширять страницу'
    , optionString
  );
  if(options == null) return;
  applyOptions(options);
  localStorage.setItem(SCRIPT_ID + 'options', optionString);
}

applyOptions(optionString);

// управление CSS страницы (расширение) ----------------------------------------

// уровень вложенности комментария
function level(comm){
  var lvl = 0;
  var children = $(comm).children('ul').children();
  children.each(function(){
    var l = level(this);
    if(l > lvl) lvl = l;
  });
  return lvl + (children.length && 1);
}

var COMMENT_MARGIN = 20;

// "расширение" страницы: все комментарии - 75% старой ширины поста, включение
// иерархии, расчёт и увеличение ширины страницы
function expandPage(){
  var
    POST_WIDTH     = $('div.entry-content').width(),
    COMMENT_WIDTH  = 0.75 * POST_WIDTH | 0;
  
  if(!POST_WIDTH) return;

  var $hentry = $('li.hentry');
  var CONTENT_WIDTH = Math.max(
    $hentry.width(),
    COMMENT_WIDTH + COMMENT_MARGIN * level($('div.entry-comments').get(0))
  );

  $hentry.width(CONTENT_WIDTH + 'px');
  
  $hentry.find('h2, div.entry-content, p.description, p.author')
    .width(POST_WIDTH + 'px');
    
  $hentry.children('div:last').prev('div') // кнопки социальных сетей
    .css('margin-right', (CONTENT_WIDTH - POST_WIDTH) + 'px');
    
  $('div.entry-comments ul .hcomment ul')
    .css('margin-left', COMMENT_MARGIN + 'px');
    
  $('.entry-comment-wrapper')
    .width(COMMENT_WIDTH+'px')
    .css('box-shadow', '0 0 3px #888');
    
  $('span.comment-vote')
    .css('position', 'inherit')
    .css('float', 'right');
    
  $('p.vote').each(function(){
    var p = $(this);
    p.css('left', POST_WIDTH - p.width()).css('padding-left', '2em');
  });
  
  $('form dl dd textarea').css('max-width', COMMENT_WIDTH + 'px');
  
  $('form dl dd select').css('width', COMMENT_WIDTH + 'px');
}

// позиционирование ------------------------------------------------------------

// позиция: какая-то (x, y) или позиция конкретного элемента (x,y, элемент)
function Position(x, y, element){
  this.x = x | 0;
  this.y = y | 0;
  this.date = 0;
  if(element){
    element = $(element);
    this.width = element.width();
    this.element = element;
    
    var date = this.element.find('abbr.published').attr('title');
    if(date != null) this.date = +new Date(date);
  }
}

// простая прокрутка до (x|null, y), возможно с анимацией
function _scroll(x, y){
  var delay = options.animation.get();
  if(!delay){
    $page.scrollTop(y);
    if(x != null) $page.scrollLeft(x);
  }else{
    if(x == null) $page.animate({ scrollTop: y }, delay);
    else $page.animate({ scrollTop: y, scrollLeft: x }, delay);
  }
}

// умная прокрутка до позиции: двумерная, если есть элемент и он не влезает,
// одномерная, если элемент влезает, или позиция не относится к элементу
function _smartScroll(pos){
  if(!(pos instanceof Position)) throw 1;
    
  var scrollLeft = null;
  if(pos.element){
    var winPos = position();
    var winW = $('body').innerWidth();
    var elW = pos.width;
    var edge = 2 * COMMENT_MARGIN;
    //if(winW >= elW + 2 * edge && // эта фича вызвала баг
    if(pos.x - edge < winPos.x || pos.x + elW + edge > winPos.x + winW){
        scrollLeft = pos.x - edge;
    }
  }else{
    scrollLeft = pos.x;
  }
  _scroll(scrollLeft, pos.y);
  return;
}

// прокрутка до позиции/DOM-объекта
function scrollTo(pos){
  if(pos == null) return;
  if(pos instanceof Position){
    if(options.expand.get()) _smartScroll(pos);
    else _scroll(null, pos.y);
    return;
  }
  return scrollTo(position(pos));
}

// текущая позиция/позиция объекта x
function position(x){
  if(x){
    var offset = $(x).offset();
    return new Position(offset.left | 0, offset.top | 0, x);
  }
  return new Position(
    Math.max($body.scrollLeft(), $html.scrollLeft()) | 0,
    Math.max($body.scrollTop(), $html.scrollTop()) | 0
  );
}

// ближайшая позиция из arr к позиции value
function nearest(arr, value){
  if(!arr.length) return 0;
  var n = 0, d = Infinity;
  for(var i=0; i<arr.length; ++i){
    var delta = Math.abs(arr[i].y - value.y);
    if(delta < d){
      d = delta;
      n = i;
    }
  }
  return n;
}

// элемент номер id массива arr с автокоррекцией диапазона
function elementAt(arr, id){
  if(!arr.length) return;
  if(id < 0) id = 0;
  if(id >= arr.length) id = arr.length - 1;
  return arr[id];
}

// позиция из positions, которая ближе всего к текущей позиции
function nearestPosition(positions){
  var id = nearest(positions, position());
  return elementAt(positions, id);
}

// перехож к одной из позиций в массиве
function moveTo(positions, id){
  scrollTo(elementAt(positions, id)); 
}

// сдвинуться на delta элементов
function moveOn(positions, delta){
  moveTo(positions, nearest(positions, position()) + delta); 
}

// родительский комментарий/пост для данного элемента
function parent(element){
  if(!element) return;
  var $element = $(element);
  var parent = $element.parents('li.hcomment:first')
                       .find('.entry-comment-wrapper:first');
  if(!parent.length) parent = $element.parents('li.hentry:first');
  return parent;
}

// комментарии одного уровня для данного комментария (.entry-comment-wrapper)
function siblings(comment){
  if(!comment) return;
  return $(comment).closest('ul').children().children('.entry-comment-wrapper');
}

// список отсортированных позиций 
function positions(sel){
  return $.makeArray($(sel))
    .map(position)
    .sort(sort_order.get());
}

// список позиций постов и всех комментариев
function allComments(){
  return positions('.entry-comment-wrapper, li.hentry');
}

// список позиций постов и новых комментариев
function newComments(){
  return positions('.entry-comment-wrapper.new, li.hentry');
}

// список позициий комментариев одного уровня с текущим комментарием
function allSiblings(){
  var pos = nearestPosition(allComments());
  if(!pos) return [];
  return positions(siblings(pos.element));
}

// ближайший элемент 
function currentElement(sel){
  var cur = nearestPosition(positions(sel));
  return cur && cur.element;
}

// int main(){ -----------------------------------------------------------------

// увеличиваем страницу по вертикали
// для верного отображения последних комментариев
$('#content')
  .after('<div style="height: ' + window.screen.height + 'px;">&nbsp;</div>');

// увеличиваем страницу по горизонтали
if(window.location.pathname !== '/comments' && options.expand.get())
  expandPage();

// добавляем настройки
(function(){
  // (c)пёрто из https://github.com/bormand/govnokod-board/
  var configDialog = $("<li><div><p>Настройки навигации:</p></div></li>")
    .appendTo($('#userpane > .pane-content > ul'));
  
  configDialog.append($('<a href="#">открыть настройки навигации</a>')
    .click(function(event){
      changeOptions();
      return false;
    }));
  
})();

var highlighted = false;
$(window).keydown(function(event){
  if(event.which == 191 && event.ctrlKey){
    highlighted = !highlighted; // подсветка зелёным по Ctrl + /
    $('li.hentry, .entry-comment-wrapper').css('background-color', highlighted ? '#4f4' : '#fff');
  }
});

var children = []; // стек позиций комментариев-детей, от которых перешли
// к родительским комментариям

$body.keypress(function(event){

  // ничего не делать, если пользователь печатает комментарий
  if(event.target.type === 'textarea') return;
  
  var key = String.fromCharCode(event.charCode).toLowerCase();
  
  if(event.shiftKey){
    var pos = position();
  
    switch(key){
      // перемещение на начало страницы
      case 'р': case 'h': case 'г': case 'u':
        scrollTo(new Position(pos.x, 0));
        break;
      
      // перемещение на конец страницы
      case 'д': case 'l':case 'з': case 'p':
        scrollTo(new Position(pos.x, $(document).height()));
        break;

      // перемещение на несколько пикселей вниз
      case 'о': case 'j': case 'ш': case 'i':
        scrollTo(new Position(pos.x, pos.y + options.shift.get()));
        break;
      
      // перемещение на несколько пикселей вверх
      case 'л': case 'k': case 'щ': case 'o':
        scrollTo(new Position(pos.x, pos.y - options.shift.get()));
        break;
      
      // закрытие текущей вкладки
      case 'y': case 'н': window.close(); break;

      // открытие формы ответа на текущий комментарий
      case 'b': case 'и':
        var current = currentElement('.entry-comment-wrapper');
        if(current){
          current.find('a.answer').first().click();
          return false;
        }
        break;
      
    }
    return;
  }
  
  switch(key){
  
    // перемещение на один комментарий/пост среди постов и всех комментариев:
    case 'ш': case 'i': moveOn(allComments(),         +1); break; // ниже
    case 'щ': case 'o': moveOn(allComments(),         -1); break; // выше
    
    // перемещение на первый/последний комментарий/пост среди постов и
    // всех комментариев:
    case 'г': case 'u': moveTo(allComments(),          0); break; // первый
    case 'з': case 'p': var comments = allComments();
                        moveTo(comments, comments.length); break; // последний
                        
    // перемещение на один комментарий/пост среди постов и новых комментариев:
    case 'о': case 'j': moveOn(newComments(),         +1); break; // ниже
    case 'л': case 'k': moveOn(newComments(),         -1); break; // выше
    
    // перемещение на первый/последний комментарий/пост среди постов и
    //  новых комментариев:
    case 'р': case 'h': moveTo(newComments(),          0); break; // первый
    case 'д': case 'l': var comments = newComments();
                        moveTo(comments, comments.length); break; // последний
    
    // перемещение на комментарии того же уровня:
    case '[': case 'х': moveOn(allSiblings(),         +1); break; // ниже
    case ']': case 'ъ': moveOn(allSiblings(),         -1); break; // выше
    
    // переключение режимов сортировки
    case '=': sort_order.set(sort_order.USE_OPTIONS); break; // по умолчанию
    case '-': sort_order.set(sort_order.BY_POSITION); break; // по координате
    case '0': sort_order.set(sort_order.BY_DATE);     break; // по дате
    
    // перемещение на родительский комментарий с запоминанием текущей позиции
    case 'ь': case 'm':
      var current = currentElement('li.hcomment, li.hentry');
      var par = parent(current);
      if(par.length){
        children.push(current);
        scrollTo(par);
      }
      break;
    // перемещение на последнюю сохранённую позицию с удалением информации о ней
    case 'т': case 'n':
      scrollTo(children.pop());
      break;
    // перемещение на первую сохранённую позицию с удалением всей информации о
    // сохранённух позициях
    case 'б': case ',':
      scrollTo(children[0]);
      children = [];
      break;
    
    // раскрытие поста в стоке или показ комментариев к текущему посту или
    // раскрытие бесконечного стока Борманда или
    case 'b': case 'и':
      var current = currentElement('li.hentry');
      if(!current) break;
      current.find('a.entry-comments-load,' +
        'a[text=Все комментарии]:visible, a.show-code-trigger,' +
        'a.bormand-stok')
          .first().click();
      break;
    
    // открытие поста в новой вкладке
    case 'y': case 'н':
      var current = currentElement('li.hentry');
      if(!current) break;
      var href = current.find('a.entry-title:first').attr('href');
      if(href){
        window.open(href, '_blank');
        window.focus(); // не работает :(
      }
      break;
  }
});

})(window.jQuery || window.$);
