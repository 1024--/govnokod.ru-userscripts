// ==UserScript==
// @name govnokod: post changes
// @namespace govnokod
// @description Logs changed topics.
// @include http://govnokod.ru/*
// @include http://www.govnokod.ru/*
// @version 1.1.1
// @grant none
// ==/UserScript==

(function(){

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
  
  function appendPosts($from){
    var posts = unpack(ls.posts || '');
  
    $from.find('a.entry-title').each(function(_,x){
      var link = x.href.match(/\d+$/);
      if(link){
        posts[link[0]] = true;
        console.log('A new post: ' + link[0]);
      }else console.error('Invalid entry-title', x);
    });
    
    ls.posts = pack(posts);
  }

  var ls = window.localStorage || {};
  if(!ls.time) ls.time = '0';
  
  switch(location.pathname){
  
  case '/user/login':
    if(!ls.posts) break;
    
    var deletePosts = document.createElement('a');
    deletePosts.href = '#';
    deletePosts.innerHTML = 'удалить';
    
    deletePosts.addEventListener('click', function(event){
      if(confirm('Вы действительно хотите удалить всю информацию о постах?')){
        ls.time = +new Date - 1000 * 3600;
        ls.posts = '';
        $('.user-changed-posts').remove();
      }
      event.preventDefault();
    });
    
    $('li.hentry')
      .append('<div class="user-changed-posts"><br/>Изменённые посты с ' +
        (new Date(+ls.time)).toLocaleString() + ': <tt>"' + 
        String(ls.posts).replace(/\d+/g, '<a href="/$&">$&</a>') +
        '"</tt> </div>')
      .find('.user-changed-posts')
      .append(deletePosts);
    break;
    
  case '/comments':
  case '/':
  default:
    appendPosts($('abbr.published, p.author>abbr').filter(function() {
      return new Date($(this).attr('title')) > new Date(+ls.time);
    }).parents('li.hentry'));
    break;
  }
  
})();