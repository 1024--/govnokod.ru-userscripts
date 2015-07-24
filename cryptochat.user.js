// ==UserScript==
// @name Шифрованный чат
// @namespace govnokod
// @include http://govnokod.ru/*
// @include http://www.govnokod.ru/*
// @version 0.0.4
// @grant none
// ==/UserScript==

// см. настройки на панели настроек пользователя
// там можно выбрать и настроить ключ и т.п.

(function(){
  
  var ID = 'dbdf6b41-e08a-4046-809f-50f513fd0756';
  
  function SumHandler(n, cb) {
    return function(){
      console.log('SumHandler: ' + (n-1));
      if(!--n) cb();
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
  
  function Key(str) {
    var m = str.match(/^(?:\(([^)]*)\))?(.{32})$/);
    if(!m) {
      alert('Неправильная строка с ключом: "' + str + '"');
      m = ['','неверный ключ', ''];
    }
    this.key = CryptoJS.enc.Hex.parse(m[2]);
    this.name = m[1];
  }
  
  Key.prototype.toString = function(){
    return this.name ? this.name : 'Ключ ' +
      String(CryptoJS.MD5(this.key)).substr(0,16);
  };
  
  // AES:версия:IV:сумма:сообщение
  function decrypt(text, keys) {
    if(!/^AES:/.test(text)) return null;
    text = text.replace(/\s+/g, '');
    var m = text.match(/^AES:(.+?):(.+?):(.+)$/);
    if(!m) return null;
    
    var ver = m[1];
    
    if(Number(ver) !== 1) return null;
    var iv = CryptoJS.enc.Hex.parse(m[2]);
    var msg = m[3];

    // console.log('INFO [' + ver + ' ' + iv + ' ' + ' ' + msg + ']');
    
    for(var i=0; i<keys.length; ++i) {
      var decrypted;
      try {
        decrypted = CryptoJS.AES.decrypt(msg, keys[i].key, { iv: iv }).toString(CryptoJS.enc.Utf8);
      } catch(e) {
        continue;
      }
      var cs = decrypted.substring(0, checksum.LENGTH);
      decrypted = decrypted.substring(checksum.LENGTH);
      // console.log('DECR [' + decrypted + ']');
      if(checksum(decrypted) === cs) return {text: decrypted, key: keys[i]};
    }
    
    return null;
  }
  
  function encrypt(text, key) {
    var iv_txt = createKey();
    var iv = CryptoJS.enc.Hex.parse(iv_txt);
    
    return 'AES:1:' + 
      iv_txt + ':' +
      String(CryptoJS.AES.encrypt(checksum(text) + text, key.key, { iv: iv }));
  }
  
  function createKey(){
    var arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    var key = '';
    for(var i=0; i<16; ++i) {
      if(arr[i] < 0x10) key += '0';
      key += arr[i].toString(16);
    }
    return key;
  }
  
  var keys;
  var currentKey;
  
  function reloadKeys() {
    keys = localStorage.getItem(ID + 'keys').split(':').map(function(key){
      return new Key(key);
    });

    currentKey = keys[0];
    
    updateKeySelector();
  }
  
  function saveKeys(keys_) {
    localStorage.setItem(ID + 'keys', keys_);
  }

  function loadKeys() {
    return localStorage.getItem(ID + 'keys') || '';
  }
  
  function decryptComments() {
    $('span.comment-text').each(function(){
      var $this = $(this);
      var text = $this.text();
      if(!/^AES:/.test(text)) return;
      $this.empty();
      text.split('\n').forEach(function(part, i) {
        var decr = decrypt(part, keys);
        if(i) $this.append('<br/>');
        
        if(decr == null) $this.append(document.createTextNode(part));
        else $this
          .append($('<span style="color: #8080ff"></span>')
            .attr('title', 'расшифровано с помощью "' + decr.key + '"')
            .text(decr.text))
          .append($('<sup style="color: #ccc">' + decr.key +'</sup>'));
      });
    });
  }
  
  var keySelector = null;
  
  function updateKeySelector() {
    if(!keySelector) return;
    if(keys[0] !== currentKey) currentKey = keys[0];
    
    keySelector.empty();
    keys.forEach(function(k, i) {
      keySelector.append('<option value="' + i + '" ' + (i?'':'selected') +
        '>' + k + '</option>');
    });
  }
  
  function appendPanel() {
    var comment = $('textarea#formElm_text');
    var info = comment.parent();

    if(!comment.length || !info.length) return;
    if(info.find('div.userscript-1024--cryptochat').length) return;
    var container = $('<div class="userscript-1024--cryptochat"></div>');
    
    function transformField(func) {
      var start = comment.attr('selectionStart'), end = comment.attr('selectionEnd');
      var val = comment.val();
      comment.val(start === end ? func(val) :
        val.substring(0, start) + func(val.substring(start, end)) +
        val.substring(end));
    }
    
    var encButton = $('<a href="#">[зашифровать]</a>').click(function(event){
      transformField(function(x){ return encrypt(x, currentKey); });
      event.preventDefault();
    }).appendTo(container);
    
    var decButton = $('<a href="#">[расшифровать]</a>').click(function(event){
      transformField(function(x){
        var decr = decrypt(x, keys);
        return decr != null ? decr.text : x;
      });
      event.preventDefault();
    }).appendTo(container);

    keySelector = $('<select></select>').change(function(){
      var v = Number(keySelector.val());
      if(v < 0 || v >= keys.length) {
        alert('Неверный номер ключа. Меню выбора не синхронизовано.');
        return;
      }
      currentKey = keys[v];
    });
    
    updateKeySelector();
    
    container
      .append(encButton)
      .append('  ')
      .append(decButton)
      .append('  ')
      .append(keySelector)
      .appendTo(info);
  }
  
  function init() {
    
    if(!loadKeys()) saveKeys('(automatic)' + createKey());
    reloadKeys();
    appendPanel();
    decryptComments();
    
    $('a.answer, h3>a').live('click', appendPanel);
    $(document).ajaxComplete(appendPanel).ajaxComplete(decryptComments);
    
    // (c)пёрто из https://github.com/bormand/govnokod-board/
    var configDialog = $("<li><div><p>Настройки шифрования:</p></div></li>")
      .appendTo($('#userpane > .pane-content > ul'));
    
    configDialog.append($('<a href="#">Новый ключ</a>')
      .click(function(event){
        var key = createKey();
        var key = prompt('Новый ключ.\n' +
          'Введите свой, если требуется изменить.\n' +
          'Или нажмите Esc для отмены.\n' +
          'Можно оставить комментарий перед ключом в скобках.\n' +
          'Новый ключ станет текущим ключом.\n', '(new)' + key);
        if(key == null) return false;
        var ks = loadKeys();
        ks = ks ? key + ':' + ks : key;
        saveKeys(ks)
        reloadKeys();
        return false;
      }));
      
    configDialog.append('<br/>');

    configDialog.append($('<a href="#">Управление ключами</a>')
      .click(function(event){
        var ks = prompt('Мои ключи.\n' +
          'Отредактируйте список (разделены через ":").\n' +
          'Можно оставить комментарий перед ключами в скобках.\n' +
          'Первый ключ станет ключом по умолчанию.\n' +
          'Или нажмите Esc для отмены.', loadKeys());
        if(ks == null) return false;
        saveKeys(ks);
        reloadKeys();
        return false;
      }));
    
  }
  
  var handler = SumHandler(1, init);
  loadScript('http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/aes.js', handler);

})();