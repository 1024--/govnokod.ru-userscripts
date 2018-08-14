// ==UserScript==
// @name Перемещение по j-k
// @namespace userscripts_1024__
// @description Enables user to move between entries.
// @exclude *://govnokod.ru/*
// @include *://*
// @require      https://code.jquery.com/jquery-1.4.min.js
// @version 1.2
// @grant none
// ==/UserScript==

/*
  Используемые кнопки:
  h j k l - перемещение по новым комментариям
                  (j-k - вниз-вверх, h-l - первый-последний)

  Shift + h j k l - перемещение по странице
    j-k - вниз-вверх на shift пикселей (одна из настроек)
    h-l - на начало-конец страницы
  
  Ctrl+/ - включение/отключение
  Ctrl+? - открытие настроек
*/

(function($){
if(!$) return;

var $html = $('html');
var $body = $('body');
var $page = $('body, html');
var SCRIPT_ID = '5885d307-6fd6-487e-8b19-448363fc4f96';

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
  shift:     new Option(100),
  enable:    new Option(false)
}, optionString = loadOptions();

var sites = {
  'bash.im': 'div.text',
  'ithappens.me': 'div.story',
};

function order_by_position(a, b){
  return a.y - b.y;
}

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
  var opts = localStorage.getItem(SCRIPT_ID + 'options') || 'animation=50';
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
    '  shift=<число> - количество пикселей, на которое можно перемещаться по Shift+j/k\n' +
    '  enable=1 или enable=0 - включить/отключить скрипт по умолчанию\n' +
    'Примеры:\n' +
    '  animation=0, shift=100 - отключить анимацию, сдвигать на 100 пикселей\n' +
    '  animation=0 - отключить анимацию'
    , optionString
  );
  if(options == null) return;
  applyOptions(options);
  localStorage.setItem(SCRIPT_ID + 'options', optionString);
}

applyOptions(optionString);

// позиционирование ------------------------------------------------------------

// позиция: какая-то (x, y) или позиция конкретного элемента (x,y, элемент)
function Position(x, y, element){
  this.x = x | 0;
  this.y = y | 0;
  if(element){
    element = $(element);
    this.width = element.width();
    this.element = element;
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

// прокрутка до позиции/DOM-объекта
function scrollTo(pos){
  if(pos == null) return;
  if(pos instanceof Position){
    _scroll(null, pos.y);
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

// список отсортированных позиций 
function positions(sel){
  return $.makeArray($(sel))
    .map(position)
    .sort(order_by_position);
}

// список позиций всех элементов
function allElements(){
  var sel = sites[window.location.hostname];
  if(!sel) return [];
  return positions(sel);
}

// ближайший элемент 
function currentElement(sel){
  var cur = nearestPosition(positions(sel));
  return cur && cur.element;
}

// int main(){ -----------------------------------------------------------------

var enabled = options.enable.get();

// добавляем настройки
$(window).keydown(function(event){
  if(event.which == 191 && event.ctrlKey){
    if(event.shiftKey) changeOptions();
    else enabled = !enabled;
  }
});

$body.keypress(function(event){
  
  if(!enabled) return;
  
  var key = String.fromCharCode(event.charCode).toLowerCase();
  
  if(event.shiftKey || !(location.hostname in sites)){
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
    }
    return;
  }
  
  switch(key){
    // перемещение на один комментарий/пост среди постов и новых комментариев:
    case 'о': case 'j': moveOn(allElements(),         +1); break; // ниже
    case 'л': case 'k': moveOn(allElements(),         -1); break; // выше
    
    // перемещение на первый/последний комментарий/пост среди постов и
    //  новых комментариев:
    case 'р': case 'h': moveTo(allElements(),          0); break; // первый
    case 'д': case 'l': var comments = allElements();
                        moveTo(comments, comments.length); break; // последний
  }
});

})(window.jQuery || window.$);
