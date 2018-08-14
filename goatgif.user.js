// ==UserScript==
// @name Псевдографические псевдогифки
// @namespace govnokod

// @include *://govnokod.ru/*
// @include *://www.govnokod.ru/*
// @version 1.0.8
// @grant none
// ==/UserScript==

/*

Юзерскрипт позволяет просматривать анимацию в goatgif.

Описание языка и скриптов:
  В начале goatgif-скрипта стоит GOATGIF:<версия>, затем на новой строке располагается тело скрипта.
  Пользователь может управлять глобальными переменными. Для отрисовки следует использовать команду show,
  для перерисовки - установить обработчик ONFRAME с помощью оператора @. Частотой анимации управляет переменная DELAY.
  Все переменные можно менять в любой момент. Ссылок нет, массивов нет, локальных переменных нет, циклов нет (но ONFRAME в вызывается в цикле)
  Внизу есть пример анимации.
  
  Этот скрипт можно запускать под Node.js. Тогда он принимает один параметр - имя файла со скриптом goatgif.

По умолчанию установлены следующие переменные/функции:
  Функции:
    = <name> <value> - присваивание
    : <name> <value> - создание выражения
    @ <actions...> - привязка действия по таймауту (переопределяет ONFRAME)
    do <actions...> - выполнение действий, возврат последнего значения
    mix <objects...> - сливает ASCII-кадры
    crop <w> <h> <object> - обрезает ASCII-кадр
    stop - остановка анимации (удаляет ONFRAME; следующий кадр не наступает)
    show <objects...> - показывает объекты
    shift <x> <y> <object> - свигает объект на (x, y)
    width <object> - ширина ASCII-объекта
    height <object> - высота ASCII-объекта
    wall <x> <y> <symb> - "стенка" из symb
    if <cond> <then>
    if <cond> <then> <else> - тернарный оператор

  Переменные:
    HEIGHT - высота кадра или автоматическая высота, если HEIGHT <= 0 или > 100 (по умолчанию HEIGHT = 0)
    WIDTH - ограничение по ширине (обрезка) или автоматическая ширина, если WIDTH <= 0 или > 100 (по умолчанию WIDTH = 0)
    DELAY - задержка перед следующим кадром (по умолчанию DELAY = 200)
    ONFRAME - обработчик события
  
  Также установлены функции + - * / % < > <= >= != ==
  
  Имеется два вида строковых литералов:
    '...' - строка
    #
    ...# - строка, захватывающая \n
    #херня
    ...#херня - строка, захватывающая \n

  
Пример анимации:

GOATGIF:1

(= gk 'Г К . Р У')

(= bagor #
--==========
 (
#)

(= vline #
*
g
o
a
t
g
i
f
*#)

(= hline '* g o a t g i f *')
(= len (- (width hline) 1))
(= frame (mix hline vline (shift 0 (/ len 2) hline) (shift len 0 vline)))
(= DELAY 200)
(= step 0)
(: print (show frame (shift (+ (% step 2) 4) 2 gk) (shift bx by bagor)))
(@ nextStep print)

(: nextStep (do
  (= step (+ step 1)) (if (> step 3) (= step 0))
  
  (if (== step 0) (do (= bx 3) (= by 4)))
  (if (== step 1) (do (= bx 2) (= by 4)))
  (if (== step 2) (do (= bx 2) (= by 5)))
  (if (== step 3) (do (= bx 3) (= by 5)))
))

конец примера анимации
*/

////////////////////////////////////////////////////////////////////////////////
// ASCIILIB

function image(txt){
  if(txt === 0) return ['0'];
  if(!txt) return [];
  if(txt instanceof Array) return txt;
  return String(txt).replace(/\t/g, '        ').split(/[\r\n]{1,2}/);
}

function shiftX(img, x){
  if(x > 0){
    var pixels = Array(x+1).join(' ');
    return img.map(function(line){ return pixels + line; });
  }
  
  if(x < 0) return img.map(function(line){ return line.substr(-x); });
  return img;
}

function shiftY(img, y){
  return y > 0 ? Array(y).join('*').split('*').concat(img) :
         y < 0 ? img.slice(-y) : img;
}

function shift(img, x, y){
  return shiftY(shiftX(img, x), y);
}

function width(img){
  return Math.max.apply(Math, img.map(function(line){ return line.length; }));
}

function height(img){
  return img.length;
}

function mix(i1, i2){
  var w = Math.max(width(i1), width(i2));
  var h = Math.max(height(i1), height(i2));
  var lines = [];
  
  for(var y=0; y<h; ++y){
    var fst = i1[y], snd = i2[y];
    if(!fst && !snd) lines.push('');
    else if(!fst) lines.push(snd);
    else if(!snd) lines.push(fst);
    else {
      var line = '';
      for(var x=0; x<w; ++x){
        var f = fst.charAt(x), s = snd.charAt(x);
        if(!f && !s) line += ' ';
        else if(!s) line += f;
        else if(!f) line += s;
        else line += s === ' ' ? f : s;
      }
      lines.push(line);
    }
  }
  
  return lines;
}

function string(img){
  return img.map(function(line){ return line.replace(/\s+$/g, ''); })
    .join('\n'); //.replace(/\n+$/, '');
}

function wall(w, h, e){
  return image(Array(h+1).join('x').replace(/x/g, Array(w+1).join(e) + '\n'));
}

function crop(img, w, h){
  var w_ = width(img), h_ = height(img);
  if(w >= w_ && h >= h_) return img;
  if(w >= w_) return img.slice(0, h);
  if(h < h_) img = img.slice(0, h);
  return img.map(function(line){ return line.substring(0, w); });
}

////////////////////////////////////////////////////////////////////////////////
// GOATGIF

function tryParse(txt){
  var m = /^GOATGIF:(\d+)[\r\n]+([\s\S]+)$/.exec(txt);
  if(!m) return null;
  if(+m[1] > 1) return null;
  
  var ast = [];
  var code = m[2].replace(/\r\n|\r/g, '\n');
  var result = -parse(code, ast, 0);
  
  if(result > 0) {
    console.error('Error near: "' +
      code.substring(result-50, result) + '$' +
      code.substring(result, result+50));
  }
  
  return result <= 0 ? ast : null;
}

function parse(code, expr, start){
  var current = '';
  
  function endCurrent(){
    if(current.length){
      expr.push(current);
      current = '';
    }
  }
  
  for(var i = start; i < code.length;){
    var c = code.charAt(i);
    switch(c){
    case '\'':
      endCurrent();
      var m = /'((?:\\'|[^'])*)'/.exec(code.substr(i));
      if(!m) return -i; // error at i
      i += m[0].length;
      expr.push(['(string)', m[1]]);
      break;
      
    case '#':
      endCurrent();
      var m = /#(.*?)\n([\s\S]*?)#(\1)/.exec(code.substr(i));
      if(!m) return -i; // error at i
      i += m[0].length;
      expr.push(['(string)', m[2]]);
      break;
      
    case '(':
      endCurrent();
      var node = [];
      var result = parse(code, node, ++i);
      if(result < 0) return result;
      expr.push(node);
      i = result;
      break;

    case ')':
      endCurrent();
      return ++i;
    
    case ' ':
    case '\t':
    case '\n':
      endCurrent();
      ++i;
      break;
      
    default:
      current += c;
      ++i;
    }
  }
  
  endCurrent();
  return i;
}

function processGIF(code, show){

  function setv(name, value){
    scope[name] = function(){
      return value;
    };
  }

  function getv(name){
    return name in scope ? scope[name]() : null;
  }
  
  function num(x){ return 0 | exec(x); }

  var scope = {
    '+':  function(a, b){ return num(a) +  num(b); },
    '-':  function(a, b){ return num(a) -  num(b); },
    '/':  function(a, b){ return num(a) /  num(b) | 0; },
    '%':  function(a, b){ return num(a) %  num(b) | 0; },
    '*':  function(a, b){ return num(a) *  num(b); },
    '<=': function(a, b){ return num(a) <= num(b); },
    '<':  function(a, b){ return num(a) <  num(b); },
    '>':  function(a, b){ return num(a) >  num(b); },
    '>=': function(a, b){ return num(a) >= num(b); },
    '==': function(a, b){ return exec(a) == exec(b); },
    '!=': function(a, b){ return exec(a) != exec(b); },
    
    'or':  function(a, b){ return exec(a) || exec(b); },
    'and': function(a, b){ return exec(a) && exec(b); },
    'not': function(a){ return !exec(a); },
    
    '(string)': function(str){ return str; },
    'DELAY': function(){ return 200; },
    'HEIGHT': function(){ return 0; },
    'WIDTH': function(){ return 0; },
    
    '=': function(name, value){
      var v = exec(value);
      setv(name, v);
      return v;
    },
    
    ':': function(name, value){
      scope[name] = function(){ return exec(value); };
      return null;
    },
    
    'do': function(){
      var v = null;
      for(var i=0; i<arguments.length; ++i)
        v = exec(arguments[i]);
      return v;
    },
    
    'shift': function(x, y, obj){ return shift(image(exec(obj)), num(x), num(y)); },
    'crop': function(w, h, obj){ return crop(image(exec(obj)), num(w), num(h)); },
    'width': function(obj){ return width(image(exec(obj))); },
    'height': function(obj){ return height(image(exec(obj))); },
    'wall': function(x, y, symb){ return wall(num(x), num(y), exec(symb)); },
    
    'if': function(cond, t, e){
      return exec(cond) ?
        t ? exec(t) : null :
        e ? exec(e) : null ;
    },
    
    '@': function(){
      var a = arguments;
      scope['ONFRAME'] = function(){
        return exec('do', a);
      };
    },
    
    'stop': function(){ delete scope['ONFRAME']; },
        
    'mix': function(){
      return Array.prototype.map.call(arguments, function(arg){
        return image(exec(arg));
      }).reduce(mix);
    },

    'show': function(arg){
      var frame = arguments.length > 1 ? exec('mix', arguments) : image(exec(arg));
      var H = getv('HEIGHT') | 0, h = height(frame);
      if(H <= 0 || H > 100) H = h;
      var W = getv('WIDTH') | 0, w = width(frame);
      if(W <= 0 || W > 100) W = w;
      
      if(H > h) frame = frame.concat(Array(H - h).join('*').split('*'));
      if(W > w) frame = mix(frame, image(Array(W + 1).join(' ')));
      if(W < w || H < h) frame = crop(frame, W, H);
      show(string(frame));
    },
    
  };
  
  function exec(expr, argv){
    // console.log('EXEC', expr, argv);
    
    switch(typeof expr){
    case 'string':
      if(/^[0-9]+$/.test(expr)) return +expr;
      var v = scope[expr];
      if(!v) return null;
      return argv ? v.apply(this, argv) : v();
    break;
    
    case 'object':
      if(expr.length < 1) return null;
      if(typeof expr[0] !== 'string') return null;
      return exec(expr[0], expr.slice(1));
    break;
    
    default:
      return null;
    }
  };

  var ast = tryParse(code);
  if(!ast) return;
  for(var i=0; i<ast.length; ++i) exec(ast[i]);
  
  (function next(){
    exec('ONFRAME');

    var d;
    if('ONFRAME' in scope && (d = getv('DELAY') | 0) >= 50) setTimeout(next, d);
  })();
}

////////////////////////////////////////////////////////////////////////////////
// TEST

(function(){
  function es(s){ return Array.prototype.slice.apply(document.querySelectorAll(s)); }
  function e(e, s){ return e.querySelectorAll(s)[0]; }
  
  var konardos = {
    'Konardo': true,
    'guest': true,
    'Igor_Gandonov': true,
    'anonimb84a2f6fd141': true,
  };

  if(typeof window !== 'undefined'){
    var comments = es('.entry-comment-wrapper').map(function(comm){
      if(e(comm, '.entry-author > a').textContent in konardos) return;
      var comment = e(comm, '.entry-comment');
      var prepared = 0, pre;
      
      processGIF(comment.textContent, function(text){
        if(!prepared){
          comment.innerHTML = '<pre>' + text.replace(/</g, '&gt;') + '</pre>';
          pre = e(comment, 'pre');
          prepared = true;
        }else{
          pre.textContent = text;
        }
      });
    });

  }else{
    var arg = process.argv[2];
    var code = arg ? String(require('fs').readFileSync(arg)) : "GOATGIF:1\n(show 'HELLO, WODLD!')";
    processGIF(code, console.log.bind(console));
  }
})();