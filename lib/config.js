var nSTATUS =       'status';

var cNICK =         'NICK {0}';
var cUSER =         'USER {0} * *: {1}';
var cPONG =         'PONG :{0}';
var cCTCP =         'NOTICE {0} :\x01{1} {2}\x01';

var rCTCP_VERSION = 'jsIRC by forcer@vnet.sk, browser: ' + navigator.userAgent;
var rCTCP_CLIENTINFO = 'CLIENTINFO SOURCE TIME PING VERSION';
var rCTCP_TIME =    '{0}';
var rCTCP_PING =    '{0}';
var rCTCP_SOURCE =  'http://irc.post.sk/irc/';
var rCTCP_ERR =     'CTCP command not understood, please use CLIENTINFO to get the details of supported CTCP replies.';

var fINFO =         '\x032-\x03!\x032-\x03 '; // -!-

var fLINE =         '{0}:{1}&nbsp;{2}';
var fCONNECT =      fINFO + 'Connecting to \x02{0}:{1}\x02'; 
var fCONNECTED =    fINFO + 'Connected.';
var fAUTHSENT =     fINFO + 'Authentification sent.';
var fERROR =        fINFO + 'Error: {0}';
var fCLOSE =        fINFO + '\x02\x034Socket: close.\x03\x02';
var fMODE =         fINFO + 'mode/\x036 {0} \x03\x0314[\x03{1}\x0314]\x03 by \x02{2}\x02';
var fNICK =         fINFO + '\x036{0}\x03 is now known as \x02\x032{1}\x03\x02';
var fJOIN =         fINFO + '\x032{0}\x0314 [\x03{1}\x0314]\x03 has joined \x02{2}';
var fQUIT =         fINFO + '\x036{0}\x0314 [\x03{1}\x0314]\x03 has quit \x0314[\x03{2}\x0314]\x03';
var fPART =         fINFO + '\x036{0}\x0314 [\x03{1}\x0314]\x03 has left \x02{2}\x02 \x0314[\x03{3}\x0314]\x03';
var fKICK =         fINFO + '\x036{0}\x03 was kicked from \x02{1}\x02 by \x02{2}\x02 \x0314[\x03{3}\x0314]\x03';
var fMODE =         fINFO + 'mode/\x036{0}\x03\x0314 [\x03{1}\x0314]\x03 by \x02{2}';
var fTOPIC_SETBY =  fINFO + 'topic set by {0} on {1}.{2}.{3} {4}:{5}:{6}';
var fTOPIC =        fINFO + 'topic on {0} is: {1}';

var fHILIGHT =      '\x02\x034{0}\x03\x02';

var fACTION =       '* \x02{0}\x02 {1}';
var fCTCP =         '\x033\x02{0}\x02 requested CTCP \x02{1}\x02 from \x02{2}\x02: {3}';
var fPRIVMSG =      '\x0315<\x03{0}\x0315>\x03 {1}';
var fNOTICE =       '-\x02{0}\x02- {1}';

var fSELFMSG =      '<\x02{0}\x02> {1}';
var fSELFCTCP =     '\x0315[\x034CTCP\x0315(\x035{0}\x0315)]\x03 \x02{1}\x02 {2}';

var fDEBUGSENT =    fINFO + 'sent: {0}';
              // mIRC color codes -> html colors, be advised that they are internaly used to color all client messages.
              // 0'white', 1'black', 2'navy', 3'green', 4'lightsalmon', 5'brown', 6'purple', 7'orange',
              // 8'yellow', 9'lightgreen', 10'cyan', 11'lightcyan', 12'lightblue', 13'pink', 14'darkgrey', 15'grey'
var aCOLORS = ['white', 'black', 'navy', 'green', '#ff0000', 'brown', 'purple', 'orange', 'yellow', 'lightgreen', 'cyan', 'lightcyan', 'lightblue', 'pink', 'darkgrey', 'grey'];
