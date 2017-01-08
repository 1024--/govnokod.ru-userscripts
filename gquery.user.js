// ==UserScript==
// @name         gQuery
// @version      1.0.0.3
// @description  initializes gQuery plugin
// @match        http://govnokod.ru/*
// @match        http://www.govnokod.ru/*
// @grant        none
// ==/UserScript==

/*
    Run $.gk('help') to get help
*/

(function($) {
'use strict';

var VERSION = '1.0.0.3';
var PLUGIN_NAME = 'gk'; // $.fn._gk_, $._gk_
var SELECTOR_PREFIX = 'gk'; // $(...).filter(':_gk_')
var GETTER_PREFIX = '@'; // $.fn.gk.('_@_name')

var gk = {}, gkSelectors = {};
var gkHelp = [];

var TYPES = {
  OPTION: 1,
  GETTER: 2,
  SELECTOR: 3,
};

function HelpEntry(type, name, help) {
  this.type = type;
  this.name = name;
  this.help = help;
}

function helpEntryByName(x, y) {
  return x.name < y.name ? -1 : x.name > y.name ? 1 : 0;
}

function fail(message) {
  throw new Error(message);
}

function bind(xs, f) {
  if(xs.length <= 1) return f(xs);
  
  var r = [];
  
  xs.each(function() {
    f($(this)).each(function(){
      r.push(this);
    });
  });
  
  return $.merge($(), r);
}

function select($el, sel1, sel2) {
  var r = $el.find(sel1);
  if(r.length) return r;
  return $el.find(sel2);
}

function selectFirst($el, sel1, sel2) {
  if(!$el.length) return $el;
  return select($el.first(), sel1, sel2);
}

function addOption(name, help, func) {
  gk[name] = func;
  gkHelp.push(new HelpEntry(TYPES.OPTION, name, help));
}

function addGetter(name, help, func) {
  gk[GETTER_PREFIX + name] = func;
  gkHelp.push(new HelpEntry(TYPES.GETTER, GETTER_PREFIX + name, help));
}

function addSelector(name, help, func) {
  gkSelectors[SELECTOR_PREFIX + name] = func;
  gkHelp.push(new HelpEntry(TYPES.SELECTOR, SELECTOR_PREFIX + name, help));
}

function addParametrizedSelector(name, help, func) {
  gkSelectors[SELECTOR_PREFIX + name] = func;
  gkHelp.push(new HelpEntry(TYPES.SELECTOR, SELECTOR_PREFIX + name + '(...)', help));
}

// OPTIONS

addOption('', 'select all the posts in the elements/body', function($el) {
  return $el.find('li.hentry');
});

addOption('comments', 'select all the comments in the elements/body', function($el) {
  return $el.find('li.hcomment');
});

addOption('children', 'select children of the elements/body', function($el) {
  return $el.children('ul').children('li.hcomment');
});

addOption('parent', 'select parent comments/posts of th comments (one per element)', function($el) {
  return bind($el, function($el) {
    var parent = $el.parent().closest('li.hcomment');
    if(!parent.length) parent = $el.parent().closest('li.hentry');
    return parent;
  });
});

addOption('siblings', 'select all the siblings of the comments', function($el) {
  return gk.children(gk.parent($el)).not($el);
});

addOption('post', 'select parent posts of the comments (one per comment)', function($el) {
  return $el.closest('li.hentry');
});

addOption('posts', 'select all the posts in the elements/body', function($el) {
  return $el.find('li.hentry');
});

addOption('uinfo', 'select user info of the comments', function($el) {
  return bind($el, function($el) {
    return select($el, 'p.author', 'p.entry-info');
  });
});

addOption('user', 'select the authors links', function($el) {
  return bind($el, function($el) {
    return select($el,
      'p.author>a:nth-child(2)',
      '.entry-info:first>.entry-author>a');
  });
});

addGetter('name', 'select the author name of the first element', function($el) {
  return selectFirst($el,
    'p.author>a:nth-child(2)',
    '.entry-info:first>.entry-author>a').text();
});

addOption('ava', 'select the avatars info', function($el) {
  return bind($el, function($el) {
    return select($el, 
      'p.author img.avatar',
      '.entry-info:first>img.avatar');
  });
});

addGetter('ava', 'select the avatar link', function($el) {
  return selectFirst($el, 
    'p.author img.avatar',
    '.entry-info:first>img.avatar').attr('src');
});

addGetter('uid', 'select the author ID', function($el) {
  var author = selectFirst($el,
    'p.author>a:nth-child(2)',
    '.entry-info:first>.entry-author>a');
  var href = author.attr('href');
  if(!href) return null;
  var m = href.match(/\/user\/(\d+)$/);
  return m && Number(m[1]);
});

addOption('link', 'select the authors links', function($el) {
  return bind($el, function($el) {
    return select($el,
      '.entry-title',
      '.entry-info:first>.comment-link');
  });
});

addGetter('link', 'select the author link of the first item', function($el) {
  return selectFirst($el,
    '.entry-title',
    '.entry-info:first>.comment-link').attr('href');
});

addGetter('id', 'select the author ID of the first item', function($el) {
  var link = selectFirst($el,
    '.entry-title',
    '.entry-info:first>.comment-link');
  var href = link.attr('href');
  if(!href) return null;
  var m = href.match(/(\d+)$/);
  return m && Number(m[1]);
});

addOption('date', 'select the dates', function($el) {
  return bind($el, function($el) {
    return select($el,
    'p.author>abbr',
    '.entry-info:first>.published');
  });
});

addGetter('date', 'select the date of the first item', function($el) {
  var date = selectFirst($el,
    'p.author>abbr',
    '.entry-info:first>.published');
  return new Date(date.attr('title'));
});

addOption('container', 'select the container elements', function($el) {
  return bind($el, function($el) {
    if($el.has('.entry-title')) return $el;
    return $el.find('.entry-comment-wrapper');
  });
});

addOption('text', 'select the text container elements', function($el) {
  return bind($el, function($el) {
    return select($el,
      '.entry-content code',
      '.entry-comment:first');
  });
});

addGetter('text', 'select the text of the first item', function($el) {
  return selectFirst($el,
    '.entry-content code',
    '.entry-comment:first').text();
});

addOption('chapter', 'select the chapter links', function($el) {
  return $el.find('a[rel=chapter]');
});

addGetter('chapter', 'select the chapter of the first item', function($el) {
  return $el.first().find('a[rel=chapter]').text();
});

addGetter('chapterlink', 'select the chapter link of the first item', function($el) {
  return $el.first().find('a[rel=chapter]').attr('href');
});

addOption('descr', 'select the description containers', function($el) {
  return $el.find('.description');
});

addGetter('descr', 'select the description of the first item', function($el) {
  return $el.first().find('.description').text();
});

addOption('votes', 'select the vote info containers', function($el) {
  return bind($el, function($el) {
    return select($el, 
    '.vote>strong',
    '.entry-info:first>.comment-vote>strong');
  });
});

addGetter('rating', 'select rating of the first item', function($el) {
  var votes = selectFirst($el, 
    '.vote>strong',
    '.entry-info:first>.comment-vote>strong');
  return Number(votes.text().replace('−', '-'));
});

addGetter('votes', 'select [pluses, minuses, rating] of the first item', function($el) {
  var votes = selectFirst($el, 
    '.vote>strong',
    '.entry-info:first>.comment-vote>strong');
  var title = votes.attr('title');
  if(!title) return null;
  var m = title.match(/(\d+) за и (\d+) против/);
  return m && [Number(m[1]), Number(m[2]), Number(votes.text().replace('−', '-'))];
});

addOption('onbtn', 'select "vote on" buttons', function($el) {
  return bind($el, function($el) {
    return select($el,
      '.vote>.vote-on',
      '.entry-info:first>.comment-vote>.comment-vote-on');
  });
});

addOption('againstbtn', 'select "vote against" buttons', function($el) {
  return bind($el, function($el) {
    return select($el,
      '.vote>.vote-against',
      '.entry-info:first>.comment-vote>.comment-vote-against');
  });
});

addOption('answerbtn', 'select "answer" buttons', function($el) {
  return bind($el, function($el) {
    return select($el,
      '.entry-comments>h3>a',
      '.entry-comment-wrapper:first a.answer');
  });
});

addGetter('answerlink', 'select "answer" link', function($el) {
  return selectFirst($el,
    '.entry-comments>h3>a',
    '.entry-comment-wrapper:first a.answer').attr('href');
});

addOption('hide', 'hide the comments', function($el) {
  $el.each(function() {
    var $comment = $(this), text='показать всё, что скрыто';
    // from http://userscripts.org/scripts/source/393166.user.js (version 3.2.0) by Vindicar
    var $ec = $comment.find('.entry-comment:eq(0)');
    var $lnk;
    if (!$ec.hasClass('entry-comment-hidden')) {
      $lnk = $('<span class="hidden-text"><a class="ajax" href="#">'+text+'</a></span>');
      $ec
        .addClass('entry-comment-hidden')
        .find('.comment-text:eq(0)')
        .before($lnk);
    } else {
      $lnk = $ec.find('.hidden-text:eq(0)').find('a.ajax');
      $lnk.text(text);
    }
  });
  
  return $el;
});

addOption('show', 'show the comments hidden', function($el) {
  $el.each(function() {
    var $comment = $(this);
    // from http://userscripts.org/scripts/source/393166.user.js (version 3.2.0) by Vindicar
    var $ec = $comment.find('.entry-comment:eq(0)');
    if ($ec.hasClass('entry-comment-hidden'))
      $ec
        .removeClass('entry-comment-hidden')
        .find('.hidden-text:eq(0)')
        .remove();
  });
  
  return $el;
});

addGetter('version', 'get the plugin version', function($el) {
  return VERSION;
});

addOption('help', 'show gQuery help', function($el) {
  function showEntries(t) {
    gkHelp
      .filter(function(x){ return x.type == t; })
      .sort(helpEntryByName)
      .forEach(function(x) {
        console.log('    ' + x.name +
          '               '.substr(0, 15 - x.name.length) +
          ' ' + x.help);
      });
  }

  console.log('Use $(...).' + PLUGIN_NAME + '("sel1 > sel2:pseudoclass1 > :pseudoclass2 > sel3 > ...")');
  console.log('where sel* for selecting element is')
  showEntries(TYPES.OPTION);
  console.log('or where sel* for getting value')
  showEntries(TYPES.GETTER);
  console.log('or where pseudoclass* for filter value');
  console.log('(you may use the following pseudoclasses in jQuery selectors as well)');
  showEntries(TYPES.SELECTOR);
  console.log();
  console.log('Example: $.' + PLUGIN_NAME + '("comments:' + SELECTOR_PREFIX + 'user(1024--) > parent > container").css("color", "red")');
  
  return null;
});

// SELECTORS

addParametrizedSelector('user', 'if author\'s name is the value passed',
function(el, index, meta) {
  return gk[GETTER_PREFIX + 'name']($(el)) == meta[3];
});

addParametrizedSelector('uid', 'if author\'s ID is the value passed',
function(el, index, meta) {
  return gk[GETTER_PREFIX + 'uid']($(el)) == meta[3];
});

addParametrizedSelector('id', 'if ID of the item is the value passed',
function(el, index, meta) {
  return gk[GETTER_PREFIX + 'id']($(el)) == meta[3];
});

addParametrizedSelector('better', 'if rating of the item is more than the value passed',
function(el, index, meta) {
  return gk[GETTER_PREFIX + 'rating']($(el)) > meta[3];
});

addParametrizedSelector('worse', 'if rating of the item is less than the value passed',
function(el, index, meta) {
  return gk[GETTER_PREFIX + 'rating']($(el)) < meta[3];
});

addSelector('commented', 'if the item has children', function(el) {
  return gk.children($(el)).length > 0;
});

addSelector('good', 'if rating of the item is positive', function(el) {
  return gk[GETTER_PREFIX + 'rating']($(el)) > 0;
});

addSelector('bad', 'if rating of the item is negative', function(el) {
  return gk[GETTER_PREFIX + 'rating']($(el)) < 0;
});

addSelector('neutral', 'if rating of the item equals zero', function(el) {
  return gk[GETTER_PREFIX + 'rating']($(el)) == 0;
});

addSelector('hidden', 'if the comment is hidden', function(el) {
  return $(el).find('.entry-comment:first').hasClass('entry-comment-hidden');
});

addSelector('shown', 'if the comment is not hidden', function(el) {
  return !($(el).find('.entry-comment:first').hasClass('entry-comment-hidden'));
});

function runGK(command) {
  var obj = this.length ? this : $('body');
  
  if(!command || !command.trim()) return obj.find('li.hentry');
  
  command.split('>').forEach(function(command) {
    var commands = command.split(':');
    
    if(!commands.length) return;
    
    var command = commands[0].trim();
    if(command) {
      if(!(command in gk)) fail('Invalid command: "' + command + '"');
      obj = gk[command](obj);
    }
    
    for(var i=1; i<commands.length; ++i) obj = obj.filter(':' + commands[i]);
  });
  
  return obj;
}

$.fn[PLUGIN_NAME] = runGK;
$[PLUGIN_NAME] = runGK.bind($());
$.extend($.expr[':'], gkSelectors);

})($);