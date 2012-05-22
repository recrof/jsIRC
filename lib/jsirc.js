var input, nick, realname, ident, server, port;
var mySocket;
var windows = {};
var windowActive;
var windowFocused;
var container;
var buffer = "";
var serverConfig = {};
var previousInputKey;
var nickCompletitionArray = [];
var nickPreviousIndex = 0;
var messageHistory = [];
var messageHistoryIndex = 0;

window.onload = prepare;

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

RegExp.escape = function(text) {
    if(!text) return null;
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function init() {
  mySocket = null;
  container = document.getElementById('container');
  input = document.getElementById('input');
  dellAllWindows();
  log = addWindow(nSTATUS,1);
  windowActive = nSTATUS;
  windowFocused = nSTATUS;
  focusWindow(nSTATUS);
  windows[nSTATUS].innerHTML = "";
  windows[nSTATUS].style.display = "block";
  server = document.getElementById('server').value.replace(/(\s*|\t*)/,'');
  port = document.getElementById('port').value.replace(/(\s*|\t*)/,'');
  nick = document.getElementById('nick').value;
  realname = document.getElementById('realname').value;
  ident = document.getElementById('ident').value;
  mySocket = new jSocket(ready,connect,data,close);
  mySocket.setup("my_socket","swf/jsocket.swf");        
}

function prepare() {
  var nick = document.getElementById('nick');
  nick.value += Math.floor(Math.random()*1000);
}

function playSound(soundObj) {
  var sound = document.getElementById(soundObj);
  sound.Play();
}

function writeSocket(data) {
  if(mySocket) 
    mySocket.write(data + "\r\n");
}

function addWindow(name,type) {
  //name = type == 1 ? name : name+'_container';
  if(windows[name]) return null;
  
  var win = document.createElement('div');
  win.setAttribute('id', name);
  win.setAttribute('class', type == 1 ? 'log' : 'log_channel');
  
  var win_container = document.createElement('div');
  win_container.setAttribute('id', name);
  win_container.setAttribute('class', 'log_container');
  win_container.appendChild(win);

  if(type == 2) {
    var nick_list = document.createElement('select');
    nick_list.setAttribute('id', 'nicklist_'+name);
    nick_list.setAttribute('class', 'nick_list');
    nick_list.setAttribute('multiple', 'multiple');
    nick_list.setAttribute('onDblClick', 'javascript:onOptionDblClick(this)');
    win_container.appendChild(nick_list);
  }
  container.appendChild(win_container);

  windows[name] = win;

  var panel = document.getElementById('panel');

  var div = document.createElement('div');
  div.setAttribute('id', 'p_'+name);
  div.setAttribute('class', 'panel_element');
  div.setAttribute('onClick',"javascript:focusWindow('" + name + "')");
  div.innerHTML = name + '&nbsp;';
  
  //div.setAttribute('onClick', "javascript:focusWindow('"+name+"')");
  var closeButton = document.createElement('div');
  closeButton.setAttribute('onClick',"javascript:delWindow('" + name + "')");
  closeButton.setAttribute('class', 'close_button');
  closeButton.innerHTML = 'x';        
  div.appendChild(closeButton);
  panel.appendChild(div);
  return win;
}


function delWindow(name) {
  if(!windows[name]) return;
  if(name.match(/^\#/)) writeSocket('PART ' + name);
  if(name == nSTATUS) {
    writeSocket('QUIT', 'Leaving');
  } else {
    if(windowFocused == name) focusWindow(nSTATUS);
    container.removeChild(windows[name].parentNode);
    delete windows[name];
    var panel = document.getElementById('panel');
    panel.removeChild(document.getElementById('p_'+name));
  }
}

function dellAllWindows() {
    for(win in windows) {
        delWindow(win);
    }
}
function focusWindow(name) {
  if(!windows[name]) return;
  windows[windowFocused].parentNode.style.display = 'none';
  windowFocused = name;
  windows[name].parentNode.style.display = 'block';
  windowActive = name;
  scrollFocusedWindow();
  p = document.getElementById('p_'+name);
  p.style.color = 'black';
  input.focus();
}

function scrollFocusedWindow() {
  windows[windowFocused].scrollTop = windows[windowFocused].scrollHeight;
}

function selectWindow(name, type, hilight) {
  //console.info(name);  
  if(!name || type == 2 && name.charAt(0) != '#') return; 
  if(!windows[name]) {
    addWindow(name, type);
    if(type == 2) focusWindow(name);
  }
  if(hilight && name != windowFocused) {
    p = document.getElementById('p_'+name);
    if(hilight == 1) p.style.color = 'green'
    else if(hilight == 2) p.style.color = 'blue'
    else if(hilight == 3) p.style.color = 'red'
  }
  windowActive = name;
}

function codeToColor(code) {
  code = parseInt(code,10);
  return aCOLORS[code];
}

function translateColors(text) {
  //console.warn(text);
  //return text;
  var colorRe = new RegExp(/\x03(\d\d?)?,?(\d\d?)?([^\x03]*)(\x03(?!\d))*/);
  var m;
  while(m = text.match(colorRe)) {
    text = text.replace(colorRe,"<span style='" + (m[1] ? 'color:' + codeToColor(m[1]) + ';' : '') + (m[2] ? 'background-color:' + codeToColor(m[2]) + ';' : '') + "'>" + m[3] + "</span>");
  }
  text = text.replace(/\x02([^\x02]*)(\x02|$)/g, "<span style='font-weight: bold;'>$1</span>");
  text = text.replace(/\x1f([^\x1f]*)(\x1f|$)/g,"<span style='text-decoration: underline;'>$1</span>");
  return text;
  
}

function parseLinks(text) {
  var linkRe = new RegExp(/((((https?|ftp):\/\/)|www\.)(([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)|localhost|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|net|org|info|biz|gov|name|edu|[a-zA-Z][a-zA-Z]))(:[0-9]+)?((\/|\?)[^ "]*[^ ,;\.:">)])?)\s?/gi);
  var result = text.replace(linkRe,'<a target="_blank" class="url" href="$1">$1</a>');
  return result;
}

function addLog(window, message) {
  function checkTime(i) { if (i<10) { i="0" + i; } return i; }        
  message = message.split("&").join("&amp;").split( "<").join("&lt;").split(">").join("&gt;");
  message = parseLinks(translateColors(message));
  var today = new Date();
  var h = checkTime(today.getHours());
  var m = checkTime(today.getMinutes());
  
  message = fLINE.format(h, m, message);
  
  if(message.match(/\n/))
    windows[window].innerHTML += message.replace(/\r?\n|\r/g, "<br>");
  else
    windows[window].innerHTML += message + "<br/>";
  scrollFocusedWindow();
}

function ready()
{
  addLog(nSTATUS,fCONNECT.format(server,port));
  mySocket.connect(server, port);
}

function connect(success,data)
{
  addLog(nSTATUS,fCONNECTED);
  if(!success)
  {
    addLog(nSTATUS,fERROR.format(data));
    dellAllWindows();
    return;
  }
  document.getElementById('fixed_box').style.display = 'none';
  auth();
}
      
function auth() {
    writeSocket(cUSER.format(ident,realname));
    writeSocket(cNICK.format(nick));
    addLog(nSTATUS,fAUTHSENT);        
}

function processMessages(content) {
  var ircData = content.split(/\r?\n|\r/);
  for(var i in ircData) {
    var text = parseContent(ircData[i]);
    if(text) addLog(windowActive,text);
    windows[windowActive].scrollTop = windows[windowActive].scrollHeight;
  }        
}

function data(content)
{
  buffer += content;
  if(buffer.match(/(\r?\n|\r)$/)) {
    processMessages(buffer);
    buffer = "";
  }
}

function sortSelect(selElem) {
  var tmpAry = new Array();
  for (var i=0;i<selElem.options.length;i++) {
    tmpAry[i] = new Array();
    tmpAry[i][0] = selElem.options[i].text;
    tmpAry[i][1] = selElem.options[i].value;
  }
  tmpAry.sort();
  while (selElem.options.length > 0) {
    selElem.options[0] = null;
  }
  for (var i=0;i<tmpAry.length;i++) {
    var op = new Option(tmpAry[i][0], tmpAry[i][1]);
    selElem.options[i] = op;
  }
  return;
}

function onOptionDblClick(what) {
  if(what.selectedIndex != null) openQuery(what.options[what.selectedIndex].value);
}

function openQuery(nick) {
  selectWindow(nick,1);
  focusWindow(nick);
}

function parseNick(nickHost) {
  var result = {};
  var matches;
  if(matches = nickHost.match(/^([^\!]+)\!(.*)$/)) {
    result['nick'] = matches[1];
    result['host'] = matches[2];
  } else {
    result['nick'] = nickHost;
    result['host'] = null;
  }
  return result;
}

function handleCTCP(command, nickFrom, params) {
  var result;
  params = params?params:'';
  if(command == 'ACTION') 
    result = fACTION.format(nickFrom, params);
  else {
    switch(command) {
      case 'VERSION':     reply = rCTCP_VERSION; break
      case 'CLIENTINFO':  reply = rCTCP_CLIENTINFO; break
      case 'PING':        reply = rCTCP_PING.format(params); break
      case 'TIME':        reply = rCTCP_TIME.format(new Date()); break;
      case 'SOURCE':      reply = rCTCP_SOURCE; break;      
      default:            reply = rCTCP_ERR; break;
    }
    console.info('CTCP sent: '+ cCTCP.format(nickFrom, command, reply));
    writeSocket(cCTCP.format(nickFrom, command, reply));
    result = fCTCP.format(nickFrom, command, nick, params); 
  }
  return result;
}

function parseContent(content) {
  var result = content;
  if(matches = content.match(/PING :(.*)/)) {
    writeSocket(cPONG.format(matches[1]));
    result = '';
  } else if(matches = content.match(/^:([^ ]+) ([^ ]+) (.*)$/)) {
    var from = matches[1];
    var command = matches[2];
    var parameters = matches[3];
    
    if(!command.match(/^\d/)) {
      var nickHost = parseNick(from);
      var nickFrom = nickHost.nick;
      var hostFrom = nickHost.host;      
      if(command == "PRIVMSG" || command == "NOTICE") {        
        var toMessage = parameters.split(' :');

        var targetTo = toMessage.shift();
        var message = toMessage.join(' :');
        var hilight = 1;
        
        if(command == "PRIVMSG")
          if(matches = message.match(/^\x01([^ ]+) ?(.*)?\x01$/)) {
            result = handleCTCP(matches[1], nickFrom, matches[2]);
          }
          else {
            nickRe = new RegExp(RegExp.escape(nick));
            if(message.match(nickRe)) {
              nickFrom = fHILIGHT.format(nickFrom);
              hilight = 3;
            }
            result = fPRIVMSG.format(nickFrom, message);
            
          }
        else if (command == "NOTICE")
          result = fNOTICE.format(nickFrom, message);

        if(!hostFrom) selectWindow(nSTATUS,1,2);
        else if(targetTo.charAt(0) == '#') selectWindow(targetTo,2,hilight);
        else selectWindow(nickFrom,1,3);        
      }
      else if(command == "NICK") {
        //console.info('nick change');
        var nickHost = parseNick(from);
        var nickFrom = nickHost.nick;
        var hostFrom = nickHost.host;
        if(nickFrom == nick) {
          nick = parameters;
        }
        result = fNICK.format(nickFrom, parameters);
        while(channel = findChannelForUser(nickFrom)) {
          removeUser(nickFrom,channel);
          addUser(parameters,channel);
          addLog(channel, result);
        }
        result = '';
      }
      else if(command == "JOIN") {
        var channel = parameters.slice(1);
        selectWindow(channel,2,2);
        addUser(nickFrom,channel);
        result = fJOIN.format(nickFrom, hostFrom, channel);
      }
      else if(command == "QUIT") {
        var message = parameters.match(/:/) ? parameters.slice(1) : '';
        result = fQUIT.format(nickFrom, hostFrom, message);
        while(channel = findChannelForUser(nickFrom)) {
          removeUser(nickFrom,channel);
          addLog(channel, result);
        }
        return '';
      }
      else if(command == "PART") {
        var toMessage = parameters.split(' :');
        var channel = toMessage.shift();
        var message = toMessage.join(' :');
        //console.info(toMessage);
        result = fPART.format(nickFrom, hostFrom, channel, message);
        removeUser(nickFrom, channel);
      }
      else if(command == "MODE") {
        var modeParams = parameters.split(' ');
        var targetTo = modeParams.shift();
        if(targetTo.charAt(0) == '#') selectWindow(targetTo, 2, 2)
        else selectWindow(nSTATUS, 1, 2);
        modeParams[0] = modeParams[0].replace(/^:/,'');
        // -!- mode/#post.sk [+o forcer] by post-o-bot
        result = fMODE.format(targetTo, modeParams.join(' '), nickFrom);
      }
      else if(command == "KICK") {
        //:nick!ident@host KICK #channel nick :message
        var toMessage = parameters.split(' :');
        var channelBy = toMessage.shift().split(' ');
        var channel = channelBy[0];
        var targetTo = channelBy[1];
        var message = toMessage.join(' :');
        result = fKICK.format(targetTo, channel, nickFrom, message);
        removeUser(targetTo, channel);        
      }
    }
    else if(matches = content.match(/:[\w_\-\.]+\s(\d+)\s([^\s]+)\s(.*)/)) {
      var ircData = matches.shift();
      var code = matches.shift();
      var nickFrom = matches.shift();
      var detail = matches.shift();
      switch(code) {
        case '005':
            detail = detail.replace(/:.*$/,'');
            var config = detail.split(' ');
            parseConfig(config);
            break;
        case '331': //topic not set
          detail = '';
          break;
        case '332': //topic          
          var toMessage = detail.split(' :');
          var channel = toMessage.shift();
          var message = toMessage.join(' :');
          selectWindow(channel, 2, 2);
          result = fTOPIC.format(channel,message);
          break;
        case '333': //topic set by   
          var topicSetBy = detail.split(' ');
          var date = new Date(topicSetBy[2]*1000);
          var fullDate;
          selectWindow(topicSetBy[0], 2, 2);
          with(date) {
            result = fTOPIC_SETBY.format(parseNick(topicSetBy[1]).nick, getDate(), getMonth(), getFullYear(), getHours(), getMinutes(), getSeconds());
          }
          break;
        case '353': //names           
          //console.info('names');
          detail = detail.replace(/^\s*=\s*/,'');
          var channelNames = detail.split(' :');
          var channel = channelNames[0];
          var names = channelNames[1].split(' ');
          for(var i in names) {
            addUser(names[i],channel);
            //console.info(names[i]);
          }
          result = '';
          break;
        case '366': //end of names    
          var channelNames = detail.split(' :');
          sortSelect(document.getElementById('nicklist_'+channelNames[0]));
          result = '';
          break;
        case '255':
            var autoConnectChannels = document.getElementById('channels').value.split(/,\s*/);
            for(var i in autoConnectChannels) {
              if(autoConnectChannels[i] != '') writeSocket('JOIN '+autoConnectChannels[i]);
            }
        default:
          result = detail.replace(/^:/,'');
          selectWindow(nSTATUS,1,2);
          //console.info(content);
          break;
      }
    } else selectWindow(nSTATUS,1,2);
  } 
  return result;
}

function parseConfig(config) {
  for(var i in config) {
    var pair = config[i].split('=');
    if(pair[0].length > 0) serverConfig[pair[0].toLowerCase()] = pair[1] ? pair[1] : 1;
  }
}

function selIndexOf(options, name) {
  for (i=0; i < options.length; i++) {
    if(options[i].value == name) return i;
  }
  return null;
}

function findChannelForUser(nick) {
  var channel;
  var selects = document.getElementsByTagName('select');
  for(var i in selects) {
    //console.info('select: ',selects[i]);
    if(!isNaN(selects[i])) return;
    if(matchs = selects[i].id.match(/^nicklist_(\#.*)$/)) {
      channel = matchs[1];
      if(selIndexOf(selects[i].options, nick) != null) return channel;
    }
  }
  return null;
}

function getNickFromName(name) {
  if(serverConfig['prefix']) {
    var prefixChars = serverConfig['prefix'].replace(/\([^\)]+\)/,'');
    var chars = prefixChars.split('');
    for(var i in chars) {
      if(name.charAt(0) == chars[i]) return name.slice(1);
    }
  }
  return name;
}

function removeUser(targetNick, channel) {
  if(nicklist = document.getElementById('nicklist_'+channel)) {
    nicklist.options.remove(selIndexOf(nicklist.options, targetNick));
  }
  if(nick == targetNick) {
    delWindow(channel);
    selectWindow(nSTATUS, 2, 2);
  } else selectWindow(channel, 2, 2);
}

function addUser(nick, channel) {
  var opt = document.createElement("option");
  if(nick.length <= 0) return;
  opt.text = nick;
  opt.value = getNickFromName(nick);
  selectWindow(channel, nick, 2);
  if(nicklist = document.getElementById('nicklist_'+channel)) {
    if(selIndexOf(nicklist.options, nick) == null) nicklist.options.add(opt);
  }    
}

function close()
{
  addLog(nSTATUS,fCLOSE);
  document.getElementById('nick').value = nick;
  document.getElementById('fixed_box').style.display = 'block';
}    

function keyPressed(e) {
  var keyCode = ('which' in e) ? e.which : e.keyCode;
  var input = document.getElementById('input');
  var result = true;
  function getChar (keyCode) {
      alert ("The Unicode key code is: " + keyCode);
  }
  //getChar(keyCode);
  if(keyCode == 13) { // enter
    if(input.value == '') return false;
    //console.info(input);
    var toSend = input.value;
    input.value = '';
    messageHistory.push(toSend);
    messageHistoryIndex = messageHistory.length - 1;
    toSend = processAliases(toSend)
    writeSocket(toSend);
    return false;
  }
  else if(keyCode == 38) { // up
    if(messageHistoryIndex - 1 > 0)
      input.value = messageHistory[messageHistoryIndex--];
    else
      input.value = '';
    e.preventDefault();
    result = false;
  }
  else if(keyCode == 40) { // down
    if(messageHistoryIndex + 1 < messageHistory.length)
      input.value = messageHistory[++messageHistoryIndex];    
    else
      input.value = '';
    e.preventDefault();
    result = false;
  }
  else if(keyCode == 9) { // tab
    if(input.value) {
      var mesArray = input.value.split(' ');
      //console.info(mesArray);
      if(mesArray[mesArray.length -1].length == 0) mesArray.pop();
      if(windowFocused.match(/^#/) && mesArray[mesArray.length-1].length > 0) {
        //console.info(mesArray);
        if(previousInputKey == 9 && nickCompletitionArray) {
          if(nickCompletitionArray.length <= ++nickPreviousIndex) nickPreviousIndex = 0;
        } else {
          nickPreviousIndex = 0;
          nickCompletitionArray = matchNicks(mesArray[mesArray.length-1], windowFocused);
        }
        if(nickCompletitionArray[nickPreviousIndex]) {
          mesArray[mesArray.length-1] = nickCompletitionArray[nickPreviousIndex] + (mesArray.length == 1 ? ': ' : '');
          input.value = mesArray.join(' ');
          input.focus();
        }
      }
    }
    e.preventDefault();
    result = false;
  }
  previousInputKey = keyCode;
  return result;
}

function matchNicks(nickPart, channel) {
  selectBox = document.getElementById('nicklist_' + channel);
  var re = new RegExp('^' + RegExp.escape(nickPart),'i');
  var result = [];
  for (var i=0; i<selectBox.options.length; i++) {
    if(selectBox.options[i].value.match(re)) result.push(selectBox.options[i].value);
  }
  return result;
}

function processAliases(text) {
  var result = text;
  var arr;
  if(windowFocused != nSTATUS && !text.match(/^\//)) {
    result = "PRIVMSG " + windowFocused + " :" + text;
    addLog(windowFocused, fSELFMSG.format(nick, text));
  }
  else if(arr = text.match(/\/msg ([^\s]+) (.*)/i)) 
    result = "PRIVMSG " + arr[1] + " :" + arr[2];
  else if(arr = text.match(/\/(j|join) #?([^\s]+) (.*)/i)) 
    result = "JOIN #" + arr[1] + " :" + arr[2];
  else if(text.match(/^\//)) 
    result = text.replace(/^\//,'');
  //addLog(nSTATUS,"-!- sent: " + result);
  return result;
}

function showAdvancedConnectSettings() {
    var node = document.getElementById('c_advanced');
    node.style.display = node.style.display == 'block' ? 'none' : 'block';
}