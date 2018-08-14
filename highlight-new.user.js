// ==UserScript==
// @name           Comment Highlighter
// @description    Подсвечивает новые комментарии
// @include        *://govnokod.ru/*
// @include        *://www.govnokod.ru/*
// @version        2.1
// @grant          none
// ==/UserScript==

(function() {

function updateState(data, lastPID, updater) {
  // use `cid = 0` to enable highlighting comments in unvisited posts
  // use `cid = Infinity` to disable highlighting in unvisited posts
  var out, idx, pid, i = 0, cid = 0; // here
  
  while(i < data.length) {
    idx = i;
    pid = data.charCodeAt(i++);
    if(pid & 0x8000) {
      pid &= 0x7fff;
      pid <<= 16;
      pid |= data.charCodeAt(i++);
    }
    if(pid == lastPID) {
      cid = data.charCodeAt(i++) << 16 | data.charCodeAt(i++);
      break;
    } else {
      i += 2;
    }
  }
  
  data = pid == lastPID ? data.substring(0, idx) + data.substring(i) : data;
  
  var lastCID = updater(cid);
  
  if(isFinite(lastPID) && lastPID >= 0 && lastPID < 0x80000000) {
    data += (lastPID >= 0x8000 ? String.fromCharCode(0x8000 | lastPID >> 16) : '') +
      String.fromCharCode(lastPID & 0xffff) + String.fromCharCode(lastCID >> 16) +
      String.fromCharCode(lastCID & 0xffff);
  }
  
  return data;
}

function commentID(comment) {
  var commentLink = comment.querySelector('a.comment-link');
  return Number(commentLink.href.match(/comment(\d+)$/)[1]);
}

function updateComments(prevCID) {
  var comments = document.querySelectorAll('.entry-comment-wrapper');
  var lastCID = prevCID;

  for(var i=0; i<comments.length; ++i) {
    var comment = comments[i];
    var cid = commentID(comment);
    if(cid <= prevCID) continue;
    if(cid > lastCID) lastCID = cid;
    comment.classList.add('new');
  }
  
  return lastCID;
}

var post = location.pathname.match(/^\/(\d+)/);
if(!post) return;

var PARAM = '8a9bd32e-20bc-42c7-bcdd-b65bb1fc2d0b-visited2';
var postID = +post[1];
var oldState = localStorage.getItem(PARAM) || '';
var newState = updateState(oldState, postID, updateComments);
localStorage.setItem(PARAM, newState);

})();