// ==UserScript==
// @name govnokod: post changes
// @namespace govnokod
// @description Logs changed topics.
// @include http://govnokod.ru/*
// @include http://www.govnokod.ru/*
// @require https://code.jquery.com/jquery-1.4.min.js
// @version 2.1.0
// @grant none
// ==/UserScript==

(function($){
  
  var SCRIPT_ID = '5e46435b-58ec-4516-92b5-8251cc89c80e';

  function pack(obj){
    var posts = Object.keys(obj)
      .map(function(x){ return +x; })
      .filter(function(x){ return x > 0 && isFinite(x); })
      .sort(function(x, y){ return x < y ? -1 : x > y ? 1 : 0; });
    if(!posts.length) return '';
    
    var res = [String(posts[0])], sequence = false;
    
    for(var i=1; i<posts.length; ++i){
      if(posts[i] == posts[i-1] + 1) sequence = true;
      else {
        if(sequence){
          sequence = false;
          res.push('..', String(posts[i-1]));
        }
        res.push(',', String(posts[i]));
      }
    }
    
    if(sequence) res.push('..', String(posts[posts.length - 1]));
      
    return res.join('');
  }
  
  function unpack(str){
    var obj = {};
    
    str.split(',').map(function(group){
      var g = /(\d+)\.\.(\d+)/.exec(group);
      if(!g){
        obj[group] = true;
        return;
      }
      for(var i = +g[1], n = +g[2]; i<=n; ++i)
        obj[i] = true;
    });
    
    return obj;
  }
  
  function Range(first, last) {
    this.first = first;
    this.last = last;
    this.range = [];
  }
  
  Range.prototype.pack = function() {
    this.reduce();
    var packed = String(this.first) + ':' +
                 String(this.last) + ':' +
                 String(this.range.length) + ':';
    var b = 0;
    for(var i=0; i<this.range.length; ++i) {
      if(i % 8 === 0 && i > 0) {
        packed += String.fromCharCode(b);
        b = 0;
      }
      b <<= 1;
      b += Number(this.range[i]);
    }
    if(i > 0) {
      while(i % 8 !== 0) {
        b <<= 1;
        ++ i;
      }
      packed += String.fromCharCode(b);
    }
    return packed;
  };
  
  Range.fromString = function(packed) {
    var range = new Range(0,0);
    var m = packed.match(/^(\d+):(\d+):(\d+):/);
    if(!m) return range;
    range.first = Number(m[1]);
    range.last = Number(m[2]);
    var r = Array(Number(m[3])), b;
    for(var i=m[0].length, j=0; j<r.length; ++j) {
      if(j % 8 === 0) {
        b = packed.charCodeAt(i);
        ++ i;
      }
      r[j] = Boolean(b & 128);
      b <<= 1;
    }
    range.range = r;
    return range;
  };
  
  Range.prototype.reduce = function() {
    var i = 0, j = this.range.length;
    while(i < this.range.length && this.range[i] === true) ++ i;
    while(j > 0 && this.range[j - 1] === false) -- j;
    if(i === 0 && j === this.range.length) return;
    this.first += i;
    this.range = this.range.slice(i, j);
  };
  
  Range.prototype.set = function(i, value) {
    if(i < this.first) return;
    if(i >= this.last) this.last = i+1;
    if(i - this.first >= this.range.length) {
      for(var j = this.range.length; j <= i - this.first; ++ j)
        this.range[j] = false;
    }
    this.range[i - this.first] = Boolean(value);
  };
  
  Range.prototype.get = function(i) {
    if(i < this.first) return true;
    if(i - this.first >= this.range.length) return false;
    return this.range[i - this.first];
  };
  
  Range.prototype.forEach = function(f) {
    for(var i=0; i<this.range.length; ++i)
      f(i + this.first, this.range[i]);
    for(var i=this.range.length+this.first; i<this.last; ++i)
      f(i, false);
  };
    
  function appendPosts($from, posts){
    $from.find('a.entry-title').each(function(_,x){
      var link = x.href.match(/\d+$/);
      if(link){
        $(x).parents('li.hentry>h2').append(' <sup style="color: red">new</sup>');
        posts[link[0]] = true;
        console.log('A new post: ' + link[0]);
      }else console.error('Invalid entry-title', x);
    });
  }

  var ls = window.localStorage;
  if(!ls.getItem(SCRIPT_ID + 'time')) ls.setItem(SCRIPT_ID + 'time', '0');
  
  switch(location.pathname){
  
  case '/user/login':
    if(!ls.getItem(SCRIPT_ID + 'time')) break;
    
    var deletePosts = document.createElement('a');
    deletePosts.href = '#';
    deletePosts.innerHTML = 'удалить';
    
    deletePosts.addEventListener('click', function(event){
      if(confirm('Вы действительно хотите удалить всю информацию о постах?')){
        ls.setItem(SCRIPT_ID + 'time', +new Date - 1000 * 3600);
        ls.setItem(SCRIPT_ID + 'posts', '');
        $('.user-changed-posts').remove();
      }
      event.preventDefault();
    });
    
    var clearVisited = document.createElement('a');
    clearVisited.href = '#';
    clearVisited.innerHTML = 'очистить';
    
    clearVisited.addEventListener('click', function(event){
      if(confirm('Вы действительно хотите сбросить счётчик просмотренных?')){
        ls.setItem(SCRIPT_ID + 'visited', (new Range(visited.last, visited.last)).pack());
        $('.user-changed-posts').remove();
      }
      event.preventDefault();
    });
    
    var empty = '', visited = Range.fromString(ls.getItem(SCRIPT_ID + 'visited') || '');
    var last = String(ls.getItem(SCRIPT_ID + 'posts')).match(/\d+$/);
    if(last) visited.set(+last[0], visited.get(+last[0]));
    visited.forEach(function(i, visited) {
      if(!visited) empty += '<a href="/' + i + '">' + i + '</a> ';
    });
    empty += '[<a href="/' + visited.last + '">' + visited.last + '</a>]';
    
    $('li.hentry')
      .append('<div class="user-changed-posts"><br/>Изменённые посты с ' +
        (new Date(+ls.getItem(SCRIPT_ID + 'time'))).toLocaleString() +
        ': <tt style="word-break: break-all;">"' + 
        String(ls.getItem(SCRIPT_ID + 'posts')).replace(/\d+/g, '<a href="/$&">$&</a>') +
        '"</tt> </div>')
      .find('.user-changed-posts')
      .append(deletePosts);
    
    if(visited.first === visited.last)
      $('li.hentry')
        .append('<div class="user-visited-posts">Просмотрено: [1; ' + visited.first + ') </div>');
    else
      $('li.hentry')
        .append('<div class="user-visited-posts">Просмотрено: [1; ' + visited.first +
                '), имеется дыра на [' + visited.first + '; ' + visited.last + ') </div>')
        .find('.user-visited-posts')
        .append(clearVisited);
    
    $('li.hentry')
      .append('<div class="user-visited-posts">Непосещённые: <tt>' + empty + '</tt></div>')
    break;
    
  case '/comments':
  case '/':
  default:
    var posts = unpack(ls.getItem(SCRIPT_ID + 'posts') || '');
    
    appendPosts($('abbr.published, p.author>abbr').filter(function() {
      return new Date($(this).attr('title')) > new Date(+ls.getItem(SCRIPT_ID + 'time'));
    }).parents('li.hentry'), posts);
    
    appendPosts($('.entry-comments-new').parents('li.hentry'), posts);
    
    ls.setItem(SCRIPT_ID + 'posts', pack(posts));
    
    var visited = Range.fromString(ls.getItem(SCRIPT_ID + 'visited') || '');
    var post = location.pathname.match(/^\/(\d+)/);
    if(post && $('li.hentry>.entry-content:first').length) {
      visited.set(+post[1], true);
      ls.setItem(SCRIPT_ID + 'visited', visited.pack());
    }
    break;
  }
  
})(window.jQuery || window.$);