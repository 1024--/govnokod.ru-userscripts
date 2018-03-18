// ==UserScript==
// @name           Comment Highlighter
// @description    Подсвечивает новые комментарии
// @include        http://govnokod.ru/*
// @include        http://www.govnokod.ru/*
// @version        1.0.1
// @grant          none
// ==/UserScript==

(function() {

function updateState(data, PID, newDate) {
  // use `date = 0` to enable highlighting comments in unvisited posts
  // use `date = Date.now() / 1000` to disable highlighting in unvisited posts
  var out, idx, pid, i = 0, date = 0; // here
  
  while(i < data.length) {
    idx = i;
    pid = data.charCodeAt(i++);
    if(pid & 0x8000) {
      pid &= 0x7fff;
      pid <<= 16;
      pid |= data.charCodeAt(i++);
    }
    if(pid == PID) {
      date = data.charCodeAt(i++) << 16 | data.charCodeAt(i++);
      break;
    } else {
      i += 2;
    }
  }
  
  data = pid == PID ? data.substring(0, idx) + data.substring(i) : data;
  
  if(isFinite(PID) && PID >= 0 && PID < 0x80000000) {
    newDate /= 1000;
    data += (PID >= 0x8000 ? String.fromCharCode(0x8000 | PID >> 16) : '') +
      String.fromCharCode(PID & 0xffff) + String.fromCharCode(newDate >> 16) +
      String.fromCharCode(newDate & 0xffff);
  }
  
  return {
    data: data,
    date: date * 1000
  };
}

var post = location.pathname.match(/^\/(\d+)/);
if(!post) return;

var PARAM = '8a9bd32e-20bc-42c7-bcdd-b65bb1fc2d0b-visited';
var postID = +post[1];
var state = updateState(localStorage.getItem(PARAM) || '', postID, Date.now());
var lastVisitTime = state.date;
localStorage.setItem(PARAM, state.data);

var comments = document.querySelectorAll('.entry-comment-wrapper');

for(var i=0; i<comments.length; ++i) {
  var comment = comments[i];
  var published = comment.querySelector('abbr.published');
  if(!published) continue;
  var p = Number(new Date(published.title)) + 10000; // +10s to catch all up
  if(!isFinite(p) || p < lastVisitTime) continue;
  comment.classList.add('new');
}

})();