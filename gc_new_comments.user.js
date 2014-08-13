// ==UserScript==
// @name	govnokod: new comments
// @namespace	govnokod
// @description	Enables user to move between new comments.
// @include	http://govnokod.ru/*
// @include	http://www.govnokod.ru/*
// @version	1.3.0
// @updateURL	http://userscripts.org/scripts/source/211267.meta.js
// @downloadURL http://userscripts.org/scripts/source/211267.user.js
// @grant unsafeWindow
// ==/UserScript==

(function(){
var $ = unsafeWindow.jQuery;
var $html = $('html');
var $body = $('body');
var $page = $('body, html');

$('#content').after('<div style="height: ' + window.screen.height + 'px;">&nbsp;</div>');

function scrollTo(pos){
  if(pos == null) return;
  if(typeof pos === 'number')
    return $page.animate({ scrollTop: pos }, 50);
  return scrollTo(position(pos));
}

function position(x){
  if(x) return $(x).offset().top | 0;
  return Math.max($body.scrollTop(), $html.scrollTop()) | 0;
}

function nearest(arr, x){
  if(!arr.length) return 0;
  for(var i=0; i<arr.length; ++i) if(arr[i] > x) return i - 1;
  return arr.length - 1;
}

function elemAt(arr, id){
  if(!arr.length) return;
  if(id < 0) id = 0;
  if(id >= arr.length) id = arr.length - 1;
  return arr[id];
}

function moveTo(arr, id){ scrollTo(elemAt(arr, id)); }
function moveOn(poss, delta){ moveTo(poss, nearest(poss, position()) + delta); }

function list(sel){
  return $.makeArray($(sel)).map(position).sort(function(a,b){ return a-b; });
}

var highlighted = false;

$(unsafeWindow).keydown(function(event){
  if(event.which == 191 && event.ctrlKey){
    highlighted = !highlighted; // Ctrl + /
    $('li.hentry, .entry-comment-wrapper').css('background-color', highlighted ? '#4f4' : '#fff');
  }
});

var parents = [];

$body.keypress(function(event){
  if(event.target.type === 'textarea') return;
  var comments = list('.entry-comment-wrapper, li.hentry'), newComm = list('.entry-comment-wrapper.new, li.hentry');
  switch(String.fromCharCode(event.charCode).toLowerCase()){
    case 'ш': case 'i': moveOn(comments,              +1); break;
    case 'щ': case 'o': moveOn(comments,              -1); break;
    case 'г': case 'u': moveTo(comments,               0); break;
    case 'з': case 'p': moveTo(comments, comments.length); break;
    case 'о': case 'j': moveOn(newComm,               +1); break;
    case 'л': case 'k': moveOn(newComm,               -1); break;
    case 'р': case 'h': moveTo(newComm,                0); break;
    case 'д': case 'l': moveTo(newComm,   newComm.length); break;
    case 'ь': case 'm':
      var elems = $.makeArray($('li.hcomment, li.hentry'))
        .map(function(x){ return {elem:x, pos:position(x)}; })
        .sort(function(a,b){ return a.pos - b.pos; });
      var id = nearest(elems.map(function(x){ return x.pos; }), position());
      var cur = elemAt(elems, id);
      if(cur){
        var parent = $(cur.elem).parents('li.hcomment, li.hentry').first();
        if(parent.length){
          scrollTo(parent);
          parents.push(position());
        }
      }
      break;
    case 'т': case 'n':
      scrollTo(parents.pop());
      break;
    case 'б': case ',':
      scrollTo(parents[0]);
      parents = [];
      break;
  }
});

})();
