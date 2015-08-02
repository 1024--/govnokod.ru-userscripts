// ==UserScript==
// @name Шифрованный чат
// @namespace govnokod
// @include http://govnokod.ru/*
// @include http://www.govnokod.ru/*
// @include http://gvforum.ru/*
// @version 0.0.22
// @grant none
// ==/UserScript==

/*

  Скрипт позволяет добавлять в комментарии секретные сообщения.
  Шифрование симметричное (AES, 256b).
  Работает обмен ключами (Diffie-Hellman, 2048b).
  ----------------------------------------------------------------
  У пользователя имеется несколько ключей для шифрования сообщений
  (один генерируется по умолчанию; можно добавлять и управлять)
  и один ключ для обмена ключами ("приватный ключ D-H";
  генерируется по умолчанию; можно менять). Каждое сообщение
  автоматически расшифровывается и указывается, каким ключом.
  Около окошка ввода сообщения добавляются кнопки управления.
  В меню пользователя на ГК или внизу страницы на форуме
  появляется меню настроек "Настройки шифрования".
  ----------------------------------------------------------------
  ##################### Шифрование сообщений #####################
  Введите текст в поле ввода, выберите ключ в выпадающем списке,
  нажмите "зашифровать". Если требуется зашифровать фрагмент,
  выделите его в поле ввода и нажмите "зашифровать".
  Если надо зашифровать и сразу отправить, нажмите "шифр.+отпр."
  По умолчанию в выпадающем списке выбирается ключ, соответствующий
  данному пользователю, или ключ, которым было зашифровано
  сообщение, на которое вы собираетесь ответить.
  Если требуется прочитать свой текст, нажмите "расшифровать"
  (или перед этим выделите зашифрованный фрагмент).
  В одном сообщении может быть несколько зашифрованных участков.
  ----------------------------------------------------------------
  ######################### Обмен ключами ########################
  1. Нажмите "DH:вставить" для вставки открытого ключа
    (он зависит от приватного ключа D-H) и отправьте сообщение.
  2. Нажмите "DH: принять публичный ключ" в сообщении собеседника.
  3. Отредактируйте параметры в появившемся диалоге и нажмите OK.
  !! Внимание: интерфейс браузера может при этом тормозить.

  Также можно вручную ввести ключ собеседника, нажав
  "Ввести публичный ключ D-H" в настройках шифрования.
  ----------------------------------------------------------------
  ###################### Настройки скрипта #######################
  В меню "Настройки шифрования" есть несколько пунктов:
  "Новый ключ AES", "Управление ключами AES", "Приватный ключ D-H"
  и "Опции".

  "Новый ключ AES" генерирует новый ключ и предлагает
                   отредактировать его, комментарий к нему и
                   соответствующего пользователя
  "Управление ключами AES" отображает все ключи, предлагает
                           их отредактировать
  "Приватный ключ D-H" показывает приватный ключ для обмена
                       ключами и предлагает отредактировать его
  "Ввести публичный ключ D-H" предлагает ввести публичный ключ
                              собеседника и сгенерировать общий
                              ключ для шифрования
  "Опции" показывает настройки: цвет расшифрованного текста,
          цвет имени ключа, показ имени ключа (1 или 0)
          около расшифрованного текста
  ----------------------------------------------------------------
  ########################### Миграция ###########################
  Для полной миграции (например, для копирования данных из скрипта
  на ГК в скрипт на форуме)
  1. на исходном компьютере нажмите "Управление ключами AES",
     скопируйте ключи; нажмите "Приватный ключ D-H", скопируйте;
     нажмите "Опции", скопируйте опции
  2. на конечном компьютере вставьте скопированное
     в соответствующие три поля

*/

(function(){
  
  var ID = 'dbdf6b41-e08a-4046-809f-50f513fd0756';
  
  var inputField, commentElement, settingsElement, inputFieldContainer,
    sendButton;
  
  if('govnokod.ru' === location.host) {
    inputField = 'textarea#formElm_text';
    commentElement = 'div.entry-comment';
    settingsElement = '#userpane > .pane-content > ul';
    inputFieldContainer = function(e){ return e.parent(); };
    sendButton = '#formElm_commentSubmit';
  } else {
    inputField = 'textarea.wysibb-texarea';
    commentElement = 'div.entry-content';
    settingsElement = 'body';
    inputFieldContainer = function(e){ return e.closest('div.txt-set'); };
    sendButton = '';
  }
  
  function SumHandler(cb) {
    var n = 1;
    var handler = function(){
      console.log('SumHandler.event: ' + (n-1));
      if(!--n) cb();
    };
    
    return {
      copy: function(){
        console.log('SumHandler.copy: ' + (n-1));
        ++n;
        return handler;
      },
      enable: handler
    };
  }
  
  function loadScript(url, sumHandler) {
    var script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
    
    script.addEventListener('load', sumHandler);
    script.addEventListener('error', function(){
      setTimeout(function(){
        loadScript(url, sumHandler);
      }, 1000);
    });
  }
  
  function checksum(text) {
    var cs = 0;
    for(var i=0; i<text.length; ++i) {
      cs *= 109;
      cs += text.charCodeAt(i);
    }
    
    var s = (cs % 0xffff).toString(16);
    while(s.length < 4) s = '0' + s;
    return s;
  }
  
  checksum.LENGTH = 4;
  
  function Key(str, id) {
    var m = str.match(/^(?:\(([^)]*)\))?(?:\[([^\]]*)\])?(.+)$/);
    if(!m) {
      alert('Неправильная строка с ключом: "' + str + '"');
      m = ['','неверный ключ', '', ''];
    }
    this.key = CryptoJS.enc.Hex.parse(m[3]);
    this.username = m[2];
    this.name = m[1];
    this.id = id == null ? -1 : id|0;
  }
  
  Key.prototype.toString = function(){
    return this.name ? this.name : 'Ключ ' +
      String(CryptoJS.MD5(this.key)).substr(0,16);
  };
  
  // AES:версия:IV:сумма:сообщение
  function decrypt(text, keys, firstKey) {
    if(!/^\[?AES:/.test(text)) return null;
    text = text.replace(/\s+/g, '').replace(/^\[(.+)\]$/, '$1');
    var m = text.match(/^AES:(.+?):(.+?):(.+)$/);
    if(!m) return null;
    
    var ver = m[1];
    
    if(Number(ver) !== 1) return null;
    var iv = CryptoJS.enc.Hex.parse(m[2]);
    var msg = m[3];

    // console.log('INFO [' + ver + ' ' + iv + ' ' + ' ' + msg + ']');
    
    function tryDecrypt(key) {
      var decrypted;
      try {
        decrypted = CryptoJS.AES
          .decrypt(msg, key.key, { iv: iv })
          .toString(CryptoJS.enc.Utf8);
      } catch(e) {
        return;
      }
      var cs = decrypted.substring(0, checksum.LENGTH);
      decrypted = decrypted.substring(checksum.LENGTH);
      // console.log('DECR [' + decrypted + ']');
      if(checksum(decrypted) === cs)
        return {text: decrypted, key: key};
    }
    
    if(firstKey) {
      var res = tryDecrypt(firstKey);
      if(res) return res;
    }
    
    for(var i=0; i<keys.length; ++i) {
      var res = tryDecrypt(keys[i]);
      if(res) return res;
    }
    
    return null;
  }
  
  function encrypt(text, key) {
    var iv_txt = createKey(key.key.sigBytes * 8);
    var iv = CryptoJS.enc.Hex.parse(iv_txt);
    
    return '[AES:1:' + 
      iv_txt + ':' +
      String(CryptoJS.AES.encrypt(checksum(text) + text, key.key, { iv: iv })) +
      ']';
  }
  
  function createKey(N){
    if(!N) N = 256;
    N = N / 8 | 0;
    var arr = new Uint8Array(N);
    crypto.getRandomValues(arr);
    var key = '';
    for(var i=0; i<N; ++i) {
      if(arr[i] < 0x10) key += '0';
      key += arr[i].toString(16);
    }
    return key;
  }
  
  var keys, DHkey, DHprime, Dhgen;
  var keysByUser;
  var options = {};
  
  function currentKey() {
    if(!keySelector) return null;
    return keys[keySelector.val()];
  }
  
  function reloadKeys() {
    keysByUser = Object.create(null);

    keys = loadKeys().split(':').map(function(keyStr, i){
      var key = new Key(keyStr, i);
      
      if(key.username)
        keysByUser[key.username] = key;
      
      return key;
    });
    
    updateKeySelector();
  }
  
  function saveKeys(keys_) {
    localStorage.setItem(ID + 'keys', keys_);
  }

  function loadKeys() {
    return localStorage.getItem(ID + 'keys') || '';
  }
  
  function reloadDHKey() {
    DHkey = str2bigInt(loadDHKey(), 16, 2048, 256);
  }
  
  function loadDHKey() {
    return localStorage.getItem(ID + 'DHkey');
  }
  
  function saveDHKey(key) {
    localStorage.setItem(ID + 'DHkey', key);
  }
  
  function addDHkey(keyString, keyComment, username) {
    var m = keyString.match(/\[DHKEY:(.+?):([A-Fa-f0-9\s]+)\]/);
    if(!m) {
      alert('Ключ не найден. Захватите выделением строку вида [DHKEY:1:PITUX]');
      return;
    }
    
    if(m[1] != '1') {
      alert('Неизвестная версия ' + m[1] + '.');
      return;
    }
    
    var publicKey = m[2].replace(/\s+/g, '');

    var secret = powMod(str2bigInt(publicKey, 16, 2048, 256), DHkey, DHprime);
    var salt = CryptoJS.lib.WordArray.create();
    var key = CryptoJS
      .PBKDF2(bigInt2str(secret, 16), salt, { keySize: 256/32 })
      .toString();
        
    key = prompt('Такой ключ будет добавлен в список ключей для шифрования.\n' +
      'Вы можете отредактировать ключ или его описание.\n' +
      'Или нажать Esc для отмены добавления.',
      '(' + keyComment + ')' + (username ? '[' + username + ']' : '') + key);
    if(key == null) return false;
    
    saveKeys(loadKeys() + ':' + key);
    reloadKeys();
  }

  function coolSplit(str, pattern) {
    var result = [];
    while(1){
      var m = str.match(pattern);
      if(!m) {
        if(str) result.push(str);
        return result;
      }
      if(m.index) result.push(str.substr(0, m.index));
      result.push(str.substr(m.index, m[0].length));
      str = str.substr(m.index + m[0].length);
    }
  }
  
  function decryptComments() {
    $(commentElement).each(function(){
      var $this = $(this);
      
      if($this.find(inputField).length) return;
      
      var text = $this.text();
      var username = $this
        .closest('div.entry-comment-wrapper')
        .find('.entry-author>a').text();
      if(!/AES:|DHKEY:/.test(text)) return;
      
      if($this.find('span.hidden-text'))
        text = text.replace(/^показать все, что скрыто/, '');
      
      $this.empty();
      var parts = coolSplit(text, /\[AES:.+?\]|\[DHKEY:.+?\]|\n|^AES:.+$/)
      parts.forEach(function(part, i) {
        if(part === '\n') {
          $this.append('<br/>');
          return;
        }
        if(/^\[DHKEY:.+?:.+?\]$/.test(part)) {
          $('<a href="#">DH: принять публичный ключ</a>')
            .attr('title', part)
            .click(function(){
              var comment = $this.closest('div.entry-comment-wrapper');
              var keyComment = 'DH|new-key';
              
              if(username)
                keyComment = 'DH|' + username;
              
              addDHkey(part, keyComment, username);
              return false;
            })
            .appendTo($this);
           return;
        }
        
        if(!/^\[?AES:.+?:/.test(part)) {
          $this.append(document.createTextNode(part));
          return;
        }
        
        var decr = decrypt(part, keys, keysByUser[username]);
        
        if(decr == null) {
          $('<span style="color: ' + options['decr-color'] + '">██████</span>')
            .attr('title', 'исходный текст: "' + part + '"')
            .appendTo($this);
          if(options['show-key-name'] != '0')
            $this.append($('<sup style="color: ' + options['key-color'] +
              '">нет ключа</sup>'));
        } else {
          var decrHTML = '<span class="decrypted" data-key="' + decr.key.id +
            '" style="color: ' + options['decr-color'] + '"></span>';
          var decrTitle = 'расшифровано с помощью "' + decr.key + '"';
          var keyInfoHTML = '<sup style="color: ' + options['key-color'] +
              '">' + decr.key +'</sup>';
        
          coolSplit(decr.text, /\r?\n/).forEach(function(part) {
            if(part === '\n') {
              $this.append('<br/>');
              return;
            }
            
            $(decrHTML).attr('title', decrTitle).text(part).appendTo($this);
            
            if(options['show-key-name'] != '0')
              $this.append($(keyInfoHTML));
          });
        }
      });
    });
  }
  
  var keySelector = null;
  
  function updateKeySelector() {
    if(!keySelector) return;
    var selected = Number(keySelector.val());
    if(selected >= keys.length)
      selected = 0;
    
    keySelector.empty();
    keys.forEach(function(k) {
      keySelector.append('<option value="' + k.id + '" ' +
        (k.id === selected ? 'selected' : '') + '>' + k + '</option>');
    });
  }
  
  function selectKey() {
    var parentComment = $(inputField).closest('li.hcomment');
    if(!parentComment.length) return;
    
    // Если список ключей менялся, эти ID протухают :(
    // и скрипт будет выбирать чушь, но мне править лень, F5 излечит
    var decr = parentComment
      .find(commentElement).first()
      .find('.decrypted:first');
    
    if(decr.length) {
      var id = Number(decr.attr('data-key'));
      if(id >= 0 || id < keys.length) {
        keySelector.val(id);
        return;
      }
    }
    
    var uname = parentComment.find('.entry-author>a:first').text();
    if(uname) {
      var key = keysByUser[uname];
      if(key) {
        keySelector.val(key.id);
        return;
      }
    }
  }
  
  function reloadOptions(){
    var defaults = {
      'key-color': '#ccc',
      'decr-color': '#8080ff',
      'show-key-name': '1',
    };
    
    for(var n in defaults)
      if(defaults.hasOwnProperty(n))
        options[n] = defaults[n];
    
    (localStorage.getItem(ID + 'options') || '')
      .split(/\s*,\s*/)
      .forEach(function(prop){
        var p = prop.split('=');
        if(p.length != 2) return;
        options[p[0]] = p[1];
      });
  }
  
  function getOptions(){
    var opts = [];
    for(var n in options)
      if(options.hasOwnProperty(n))
        opts.push(n + '=' + options[n]);
    return opts.join(',');
  }
  
  function saveOptions(opts) {
    localStorage.setItem(ID + 'options', opts);
  }
  
  function appendPanel() {
    $(inputField).each(function(){
      var comment = $(this);
      var info = inputFieldContainer(comment);

      if(!comment.length || !info.length) return;
      if(info.find('div.userscript-1024--cryptochat').length) {
        selectKey();
        return;
      }
      var container = $('<div class="userscript-1024--cryptochat"></div>');
      
      comment.removeAttr('disabled');
      $(sendButton).removeAttr('disabled');
      
      function transformField(func) {
        var start = comment.attr('selectionStart'),
          end = comment.attr('selectionEnd'),
          val = comment.val();
        comment.val(start === end ? func(val) :
          val.substring(0, start) + func(val.substring(start, end)) +
          val.substring(end));
      }
      
      var encSendButton = $('<a href="#">[шифр.+отпр.]</a>')
      .click(function(event){
          encButton.trigger('click');
          $(sendButton).trigger('click');
          event.preventDefault();
        });
      
      var encButton = $('<a href="#">[зашифровать]</a>')
        .click(function(event){
          transformField(function(x){
            var key = currentKey();
            if(!key) return x;
            return encrypt(x, key);
          });
          event.preventDefault();
        });
      
      var decButton = $('<a href="#">[расшифровать]</a>')
        .click(function(event){
          transformField(function(x){
            var decr = decrypt(x, keys);
            return decr != null ? decr.text : x;
          });
          event.preventDefault();
        });
      
      var DHButton = $('<a href="#">[DH:вставить]</a>')
        .click(function(event){
          var publicKey = powMod(DHgen, DHkey, DHprime);
          comment.val(comment.val() + '[DHKEY:1:' +
            bigInt2str(publicKey, 16) + ']');
          event.preventDefault();
        });
      
      keySelector = $('<select></select>');
      updateKeySelector();
      selectKey();
      
      container
        .append(encSendButton)
        .append('  ')
        .append(encButton)
        .append('  ')
        .append(decButton)
        .append('  ')
        .append(DHButton)
        .append('  ')
        .append(keySelector)
        .appendTo(info);
    });
  }
  
  function init() {
    
    if(!loadKeys()) saveKeys('(automatic)' + createKey());
    if(!loadDHKey()) saveDHKey(createKey(2048));
    reloadKeys();
    reloadDHKey();
    reloadOptions();
    appendPanel();
    decryptComments();
    
    showKeyName = localStorage.getItem(ID + 'show-name');
    keyColor = localStorage.getItem(ID + 'key-color');
    decryptedColor = localStorage.getItem(ID + 'decr-color');
    
    $('a.answer, h3>a').live('click', appendPanel);
    $('body').live('DOMNodeInserted', appendPanel);

    $(document).ajaxComplete(appendPanel).ajaxComplete(decryptComments);
    
    DHgen = int2bigInt(2, 8, 1);
    DHprime = str2bigInt(
      'd7efdf8bcb081bb53f0ab2b1621c91e0b181f78f83fc9aafc1f71fa7236311a3' +
      '065a2ebbc456944ce34c9d2f9fef770a7828c46dd855ff32a1c4feb00e748fe2' +
      '0ccb4d0b7f0eb0f6d4f27a7bdb904052786829810e8e8101bcf4ec2a76896c37' +
      '7f5f5751e3675c019ef7e477f682f63596eeb0453ac5cdd09c07528c296362d4' +
      '9ce3779a6afad9cb2f3d569a32f0a39273f0721ac90cd05933734826147314b6' +
      '0e8dc792ceef446b0247adf94270264f6f72cc52ce77f16657d07c8c231a0b4e' +
      '1aeb0756e5caf1930b01b3f019875f57007f39e1f62182c5b081b7f3b1435904' +
      '2b3b153297afcce5ecb4d8f5fb792b1f7b6f6e314d1375627374f8a8a838d76b',
      16, 2048, 256
    );

    // (c)пёрто из https://github.com/bormand/govnokod-board/
    var configDialog = $("<li><div><p>Настройки шифрования:</p></div></li>")
      .appendTo($(settingsElement));
    
    configDialog.append($('<a href="#">Новый ключ AES</a>')
      .click(function(event){
        var key = createKey();
        key = prompt('Новый ключ для зашифрованной переписки.\n' +
          'Введите свой, если требуется изменить.\n' +
          'Или нажмите Esc для отмены.\n' +
          'Можно оставить комментарий перед ключом в скобках.\n' +
          'А также добавить пользователя по умолчанию в квадратных скобках.\n' +
          'Новый ключ станет текущим ключом.\n', '(new)[guest]' + key);
        if(key == null) return false;
        var ks = loadKeys();
        ks = ks ? key + ':' + ks : key;
        saveKeys(ks);
        reloadKeys();
        return false;
      }));
      
    configDialog.append(' <br/>');

    configDialog.append($('<a href="#">Управление ключами AES</a>')
      .click(function(event){
        var ks = prompt('Мои ключи для зашифрованной переписки.\n' +
          'Отредактируйте список (разделены через ":").\n' +
          'Можно оставить комментарий перед ключами в скобках.\n' +
          'Первый ключ станет ключом по умолчанию.\n' +
          'Или нажмите Esc для отмены.', loadKeys());
        if(ks == null) return false;
        saveKeys(ks || saveKeys('(automatic)' + createKey()));
        reloadKeys();
        return false;
      }));
    
    configDialog.append(' <br/>');

    configDialog.append($('<a href="#">Приватный ключ D-H</a>')
      .click(function(event){
        var key = prompt('Мой приватный ключ для обмена ключами.\n' +
          'Отредактируйте приватный ключ или нажмите Esc для отмены.',
          loadDHKey());
        
        if(key == null) return false;
        saveDHKey(key);
        reloadDHKey();
        return false;
      }));
    
    configDialog.append(' <br/>');

    configDialog.append($('<a href="#">Ввести публичный ключ D-H</a>')
      .click(function(event){
        var keyString = prompt('Введите публичный ключ того, ' +
          'с кем хотите поговорить в формате [DHKEY:1:PITUX].\n' +
          'Будет сгенерирован ваш общий секретный ключ.');
        if(keyString == null) return false;
        
        addDHkey(keyString, 'DH|new-key', '');
        return false;
      }));
    
    configDialog.append(' <br/>');

    configDialog.append($('<a href="#">Опции</a>')
      .click(function(event){
        var opts = prompt('Введите опции или нажмите Esc для отмены.\n' +
        'Опции обновятся после перезагрузки страницы.', getOptions());
        if(opts == null) return false;
        saveOptions(opts);
        reloadOptions();
        return false;
      }));
    
  }
  
  var handler = SumHandler(init);
  var cryptoJS = 'http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups';
  loadScript(cryptoJS + '/aes.js', handler.copy());
  loadScript(cryptoJS + '/pbkdf2.js', handler.copy());
  loadScript('http://leemon.com/crypto/BigInt.js', handler.copy());
  handler.enable();

})();