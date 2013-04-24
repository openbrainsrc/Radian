
RegExp.escape=function(s){return s.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&');};(function($){'use strict'
$.csv={defaults:{separator:',',delimiter:'"',headers:true},hooks:{castToScalar:function(value,state){var hasDot=/\./;if(isNaN(value)){return value;}else{if(hasDot.test(value)){return parseFloat(value);}else{var integer=parseInt(value);if(isNaN(integer)){return null;}else{return integer;}}}}},parsers:{parse:function(csv,options){var separator=options.separator;var delimiter=options.delimiter;if(!options.state.rowNum){options.state.rowNum=1;}
if(!options.state.colNum){options.state.colNum=1;}
var data=[];var entry=[];var state=0;var value=''
var exit=false;function endOfEntry(){state=0;value='';if(options.start&&options.state.rowNum<options.start){entry=[];options.state.rowNum++;options.state.colNum=1;return;}
if(options.onParseEntry===undefined){data.push(entry);}else{var hookVal=options.onParseEntry(entry,options.state);if(hookVal!==false){data.push(hookVal);}}
entry=[];if(options.end&&options.state.rowNum>=options.end){exit=true;}
options.state.rowNum++;options.state.colNum=1;}
function endOfValue(){if(options.onParseValue===undefined){entry.push(value);}else{var hook=options.onParseValue(value,options.state);if(hook!==false){entry.push(hook);}}
value='';state=0;options.state.colNum++;}
var escSeparator=RegExp.escape(separator);var escDelimiter=RegExp.escape(delimiter);var match=/(D|S|\n|\r|[^DS\r\n]+)/;var matchSrc=match.source;matchSrc=matchSrc.replace(/S/g,escSeparator);matchSrc=matchSrc.replace(/D/g,escDelimiter);match=RegExp(matchSrc,'gm');csv.replace(match,function(m0){if(exit){return;}
switch(state){case 0:if(m0===separator){value+='';endOfValue();break;}
if(m0===delimiter){state=1;break;}
if(m0==='\n'){endOfValue();endOfEntry();break;}
if(/^\r$/.test(m0)){break;}
value+=m0;state=3;break;case 1:if(m0===delimiter){state=2;break;}
value+=m0;state=1;break;case 2:if(m0===delimiter){value+=m0;state=1;break;}
if(m0===separator){endOfValue();break;}
if(m0==='\n'){endOfValue();endOfEntry();break;}
if(/^\r$/.test(m0)){break;}
throw new Error('CSVDataError: Illegal State [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');case 3:if(m0===separator){endOfValue();break;}
if(m0==='\n'){endOfValue();endOfEntry();break;}
if(/^\r$/.test(m0)){break;}
if(m0===delimiter){throw new Error('CSVDataError: Illegal Quote [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');}
throw new Error('CSVDataError: Illegal Data [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');default:throw new Error('CSVDataError: Unknown State [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');}});if(entry.length!==0){endOfValue();endOfEntry();}
return data;},splitLines:function(csv,options){var separator=options.separator;var delimiter=options.delimiter;if(!options.state.rowNum){options.state.rowNum=1;}
var entries=[];var state=0;var entry='';var exit=false;function endOfLine(){state=0;if(options.start&&options.state.rowNum<options.start){entry='';options.state.rowNum++;return;}
if(options.onParseEntry===undefined){entries.push(entry);}else{var hookVal=options.onParseEntry(entry,options.state);if(hookVal!==false){entries.push(hookVal);}}
entry='';if(options.end&&options.state.rowNum>=options.end){exit=true;}
options.state.rowNum++;}
var escSeparator=RegExp.escape(separator);var escDelimiter=RegExp.escape(delimiter);var match=/(D|S|\n|\r|[^DS\r\n]+)/;var matchSrc=match.source;matchSrc=matchSrc.replace(/S/g,escSeparator);matchSrc=matchSrc.replace(/D/g,escDelimiter);match=RegExp(matchSrc,'gm');csv.replace(match,function(m0){if(exit){return;}
switch(state){case 0:if(m0===separator){entry+=m0;state=0;break;}
if(m0===delimiter){entry+=m0;state=1;break;}
if(m0==='\n'){endOfLine();break;}
if(/^\r$/.test(m0)){break;}
entry+=m0;state=3;break;case 1:if(m0===delimiter){entry+=m0;state=2;break;}
entry+=m0;state=1;break;case 2:var prevChar=entry.substr(entry.length-1);if(m0===delimiter&&prevChar===delimiter){entry+=m0;state=1;break;}
if(m0===separator){entry+=m0;state=0;break;}
if(m0==='\n'){endOfLine();break;}
if(m0==='\r'){break;}
throw new Error('CSVDataError: Illegal state [Row:'+options.state.rowNum+']');case 3:if(m0===separator){entry+=m0;state=0;break;}
if(m0==='\n'){endOfLine();break;}
if(m0==='\r'){break;}
if(m0===delimiter){throw new Error('CSVDataError: Illegal quote [Row:'+options.state.rowNum+']');}
throw new Error('CSVDataError: Illegal state [Row:'+options.state.rowNum+']');default:throw new Error('CSVDataError: Unknown state [Row:'+options.state.rowNum+']');}});if(entry!==''){endOfLine();}
return entries;},parseEntry:function(csv,options){var separator=options.separator;var delimiter=options.delimiter;if(!options.state.rowNum){options.state.rowNum=1;}
if(!options.state.colNum){options.state.colNum=1;}
var entry=[];var state=0;var value='';function endOfValue(){if(options.onParseValue===undefined){entry.push(value);}else{var hook=options.onParseValue(value,options.state);if(hook!==false){entry.push(hook);}}
value='';state=0;options.state.colNum++;}
if(!options.match){var escSeparator=RegExp.escape(separator);var escDelimiter=RegExp.escape(delimiter);var match=/(D|S|\n|\r|[^DS\r\n]+)/;var matchSrc=match.source;matchSrc=matchSrc.replace(/S/g,escSeparator);matchSrc=matchSrc.replace(/D/g,escDelimiter);options.match=RegExp(matchSrc,'gm');}
csv.replace(options.match,function(m0){switch(state){case 0:if(m0===separator){value+='';endOfValue();break;}
if(m0===delimiter){state=1;break;}
if(m0==='\n'||m0==='\r'){break;}
value+=m0;state=3;break;case 1:if(m0===delimiter){state=2;break;}
value+=m0;state=1;break;case 2:if(m0===delimiter){value+=m0;state=1;break;}
if(m0===separator){endOfValue();break;}
if(m0==='\n'||m0==='\r'){break;}
throw new Error('CSVDataError: Illegal State [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');case 3:if(m0===separator){endOfValue();break;}
if(m0==='\n'||m0==='\r'){break;}
if(m0===delimiter){throw new Error('CSVDataError: Illegal Quote [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');}
throw new Error('CSVDataError: Illegal Data [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');default:throw new Error('CSVDataError: Unknown State [Row:'+options.state.rowNum+'][Col:'+options.state.colNum+']');}});endOfValue();return entry;}},toArray:function(csv,options,callback){var options=(options!==undefined?options:{});var config={};config.callback=((callback!==undefined&&typeof(callback)==='function')?callback:false);config.separator='separator'in options?options.separator:$.csv.defaults.separator;config.delimiter='delimiter'in options?options.delimiter:$.csv.defaults.delimiter;var state=(options.state!==undefined?options.state:{});var options={delimiter:config.delimiter,separator:config.separator,onParseEntry:options.onParseEntry,onParseValue:options.onParseValue,state:state}
var entry=$.csv.parsers.parseEntry(csv,options);if(!config.callback){return entry;}else{config.callback('',entry);}},toArrays:function(csv,options,callback){var options=(options!==undefined?options:{});var config={};config.callback=((callback!==undefined&&typeof(callback)==='function')?callback:false);config.separator='separator'in options?options.separator:$.csv.defaults.separator;config.delimiter='delimiter'in options?options.delimiter:$.csv.defaults.delimiter;var data=[];var options={delimiter:config.delimiter,separator:config.separator,onParseEntry:options.onParseEntry,onParseValue:options.onParseValue,start:options.start,end:options.end,state:{rowNum:1,colNum:1}};data=$.csv.parsers.parse(csv,options);if(!config.callback){return data;}else{config.callback('',data);}},toObjects:function(csv,options,callback){var options=(options!==undefined?options:{});var config={};config.callback=((callback!==undefined&&typeof(callback)==='function')?callback:false);config.separator='separator'in options?options.separator:$.csv.defaults.separator;config.delimiter='delimiter'in options?options.delimiter:$.csv.defaults.delimiter;config.headers='headers'in options?options.headers:$.csv.defaults.headers;options.start='start'in options?options.start:1;if(config.headers){options.start++;}
if(options.end&&config.headers){options.end++;}
var lines=[];var data=[];var options={delimiter:config.delimiter,separator:config.separator,onParseEntry:options.onParseEntry,onParseValue:options.onParseValue,start:options.start,end:options.end,state:{rowNum:1,colNum:1},match:false};var headerOptions={delimiter:config.delimiter,separator:config.separator,start:1,end:1,state:{rowNum:1,colNum:1}}
var headerLine=$.csv.parsers.splitLines(csv,headerOptions);var headers=$.csv.toArray(headerLine[0],options);var lines=$.csv.parsers.splitLines(csv,options);options.state.colNum=1;if(headers){options.state.rowNum=2;}else{options.state.rowNum=1;}
for(var i=0,len=lines.length;i<len;i++){var entry=$.csv.toArray(lines[i],options);var object={};for(var j in headers){object[headers[j]]=entry[j];}
data.push(object);options.state.rowNum++;}
if(!config.callback){return data;}else{config.callback('',data);}},fromArrays:function(arrays,options,callback){var options=(options!==undefined?options:{});var config={};config.callback=((callback!==undefined&&typeof(callback)==='function')?callback:false);config.separator='separator'in options?options.separator:$.csv.defaults.separator;config.delimiter='delimiter'in options?options.delimiter:$.csv.defaults.delimiter;config.escaper='escaper'in options?options.escaper:$.csv.defaults.escaper;config.experimental='experimental'in options?options.experimental:false;if(!config.experimental){throw new Error('not implemented');}
var output=[];for(i in arrays){output.push(arrays[i]);}
if(!config.callback){return output;}else{config.callback('',output);}},fromObjects2CSV:function(objects,options,callback){var options=(options!==undefined?options:{});var config={};config.callback=((callback!==undefined&&typeof(callback)==='function')?callback:false);config.separator='separator'in options?options.separator:$.csv.defaults.separator;config.delimiter='delimiter'in options?options.delimiter:$.csv.defaults.delimiter;config.experimental='experimental'in options?options.experimental:false;if(!config.experimental){throw new Error('not implemented');}
var output=[];for(i in objects){output.push(arrays[i]);}
if(!config.callback){return output;}else{config.callback('',output);}}};$.csvEntry2Array=$.csv.toArray;$.csv2Array=$.csv.toArrays;$.csv2Dictionary=$.csv.toObjects;})(jQuery);
/*
Core highlighting function. Accepts a string with the code to highlight and 
optionaly a language name. Returns an object with the following properties:

- language (detected language)
- r (int)
- keyword_count (int)
- value (an HTML string with highlighting markup)
- second (object with the same structure for second-best heuristically
  detected language, may be absent)

*/

var hljs = function(value, language_name) {
  if(!language_name){
    var result = {
      keyword_count: 0,
      r: 0,
      value: hljs.escape(value)
    };
    var second = result;
    for (var key in hljs.LANGUAGES) {
      if (!hljs.LANGUAGES.hasOwnProperty(key))
        continue;
      var current = hljs(value, key);
      current.language = key;
      if (current.keyword_count + current.r > second.keyword_count + second.r) {
        second = current;
      }
      if (current.keyword_count + current.r > result.keyword_count + result.r) {
        second = result;
        result = current;
      }
    }
    if (second.language) {
      result.second = second;
    }
    return result;
  }

  function subMode(lexem, mode) {
    for (var i = 0; i < mode.c.length; i++) {
      var match = mode.c[i].bR.exec(lexem);
      if (match && match.index == 0) {
        return mode.c[i];
      }
    }
  }

  function endOfMode(mode_index, lexem) {
    if (m[mode_index].e && m[mode_index].eR.test(lexem))
      return 1;
    if (m[mode_index].eW) {
      var level = endOfMode(mode_index - 1, lexem);
      return level ? level + 1 : 0;
    }
    return 0;
  }

  function isIllegal(lexem, mode) {
    return mode.i && mode.iR.test(lexem);
  }

  function compileTerminators(mode, language) {
    var t = [];

    for (var i = 0; i < mode.c.length; i++) {
      t.push(mode.c[i].b);
    }

    var index = m.length - 1;
    do {
      if (m[index].e) {
        t.push(m[index].e);
      }
      index--;
    } while (m[index + 1].eW);

    if (mode.i) {
      t.push(mode.i);
    }

    return t.length ? langRe(language, t.join('|'), true) : null;
  }

  function eatModeChunk(value, index) {
    var mode = m[m.length - 1];
    if (mode.t === undefined) {
      mode.t = compileTerminators(mode, language);
    }
    var match;
    if (mode.t) {
      mode.t.lastIndex = index;
      match = mode.t.exec(value);
    }
    return match ? [value.substr(index, match.index - index), match[0], false] : [value.substr(index), '', true];
  }

  function keywordMatch(mode, match) {
    var match_str = language.cI ? match[0].toLowerCase() : match[0];
    var value = mode.k[match_str];
    if (value && value instanceof Array)
      return value;
    return false;
  }

  function processKeywords(buffer, mode) {
    buffer = hljs.escape(buffer);
    if (!mode.k)
      return buffer;
    var result = '';
    var last_index = 0;
    mode.lR.lastIndex = 0;
    var match = mode.lR.exec(buffer);
    while (match) {
      result += buffer.substr(last_index, match.index - last_index);
      var keyword_match = keywordMatch(mode, match);
      if (keyword_match) {
        keyword_count += keyword_match[1];
        result += '<span class="'+ keyword_match[0] +'">' + match[0] + '</span>';
      } else {
        result += match[0];
      }
      last_index = mode.lR.lastIndex;
      match = mode.lR.exec(buffer);
    }
    return result + buffer.substr(last_index, buffer.length - last_index);
  }

  function processSubLanguage(buffer, mode) {
    var result;
    if (mode.sL == '') {
      result = hljs(buffer);
    } else {
      result = hljs(buffer, mode.sL);
    }
    // Counting embedded language score towards the host language may be disabled
    // with zeroing the containing mode r. Usecase in point is Markdown that
    // allows XML everywhere and makes every XML snippet to have a much larger Markdown
    // score.
    if (mode.r > 0) {
      keyword_count += result.keyword_count;
      r += result.r;
    }
    return '<span class="' + result.language  + '">' + result.value + '</span>';
  }

  function processBuffer(buffer, mode) {
    if (mode.sL && hljs.LANGUAGES[mode.sL] || mode.sL == '') {
      return processSubLanguage(buffer, mode);
    } else {
      return processKeywords(buffer, mode);
    }
  }

  function startNewMode(mode, lexem) {
    var markup = mode.cN?'<span class="' + mode.cN + '">':'';
    if (mode.rB) {
      result += markup;
      mode.buffer = '';
    } else if (mode.eB) {
      result += hljs.escape(lexem) + markup;
      mode.buffer = '';
    } else {
      result += markup;
      mode.buffer = lexem;
    }
    m.push(mode);
    r += mode.r;
  }

  function processModeInfo(buffer, lexem, e) {
    var current_mode = m[m.length - 1];
    if (e) {
      result += processBuffer(current_mode.buffer + buffer, current_mode);
      return false;
    }

    var new_mode = subMode(lexem, current_mode);
    if (new_mode) {
      result += processBuffer(current_mode.buffer + buffer, current_mode);
      startNewMode(new_mode, lexem);
      return new_mode.rB;
    }

    var end_level = endOfMode(m.length - 1, lexem);
    if (end_level) {
      var markup = current_mode.cN?'</span>':'';
      if (current_mode.rE) {
        result += processBuffer(current_mode.buffer + buffer, current_mode) + markup;
      } else if (current_mode.eE) {
        result += processBuffer(current_mode.buffer + buffer, current_mode) + markup + hljs.escape(lexem);
      } else {
        result += processBuffer(current_mode.buffer + buffer + lexem, current_mode) + markup;
      }
      while (end_level > 1) {
        markup = m[m.length - 2].cN?'</span>':'';
        result += markup;
        end_level--;
        m.length--;
      }
      var last_ended_mode = m[m.length - 1];
      m.length--;
      m[m.length - 1].buffer = '';
      if (last_ended_mode.starts) {
        startNewMode(last_ended_mode.starts, '');
      }
      return current_mode.rE;
    }

    if (isIllegal(lexem, current_mode))
      throw 'Illegal';
  }
    
  function langRe(language, value, global) {
    return RegExp(
      value,
      'm' + (language.cI ? 'i' : '') + (global ? 'g' : '')
    );
  }

  function compileMode(mode, language, is_default) {
    if (mode.compiled)
      return;

    var k = []; // used later with bWK but filled as a side-effect of k compilation
    if (mode.k) {
      var compiled_keywords = {};

      function flatten(cN, str) {
        var group = str.split(' ');
        for (var i = 0; i < group.length; i++) {
          var pair = group[i].split('|');
          compiled_keywords[pair[0]] = [cN, pair[1] ? Number(pair[1]) : 1];
          k.push(pair[0]);
        }
      }

      mode.lR = langRe(language, mode.l || hljs.IR, true);
      if (typeof mode.k == 'string') { // string
        flatten('keyword', mode.k)
      } else {
        for (var cN in mode.k) {
          if (!mode.k.hasOwnProperty(cN))
            continue;
          flatten(cN, mode.k[cN]);
        }
      }
      mode.k = compiled_keywords;
    }
    if (!is_default) {
      if (mode.bWK) {
        mode.b = '\\b(' + k.join('|') + ')\\s';
      }
      mode.bR = langRe(language, mode.b ? mode.b : '\\B|\\b');
      if (!mode.e && !mode.eW)
        mode.e = '\\B|\\b';
      if (mode.e)
        mode.eR = langRe(language, mode.e);
    }
    if (mode.i)
      mode.iR = langRe(language, mode.i);
    if (mode.r === undefined)
      mode.r = 1;
    if (!mode.c) {
      mode.c = [];
    }
    // compiled flag is set before compiling submodes to avoid self-recursion
    // (see lisp where quoted_list c quoted_list)
    mode.compiled = true;
    for (var i = 0; i < mode.c.length; i++) {
      if (mode.c[i] == 'self') {
        mode.c[i] = mode;
      }
      compileMode(mode.c[i], language, false);
    }
    if (mode.starts) {
      compileMode(mode.starts, language, false);
    }
  }

  var language = hljs.LANGUAGES[language_name];
  var m = [language.dM];
  var r = 0;
  var keyword_count = 0;
  var result = '';
  compileMode(language.dM, language, true);    
  try {
    var mode_info, index = 0;
    language.dM.buffer = '';
    do {
      mode_info = eatModeChunk(value, index);
      var return_lexem = processModeInfo(mode_info[0], mode_info[1], mode_info[2]);
      index += mode_info[0].length;
      if (!return_lexem) {
        index += mode_info[1].length;
      }
    } while (!mode_info[2]);
    if(m.length > 2 || (m.length == 2 && !m[1].eW))
      throw 'Illegal';
    return {
      language: language_name,
      r: r,
      keyword_count: keyword_count,
      value: result
    };
  } catch (e) {
    if (e == 'Illegal') {
      return {
        language: language_name,
        r: 0,
        keyword_count: 0,
        value: hljs.escape(value)
      };
    } else {
      throw e;
    }
  }
}

hljs.LANGUAGES = {};


// Common regexps
hljs.IR = '[a-zA-Z][a-zA-Z0-9_]*';
hljs.UIR = '[a-zA-Z_][a-zA-Z0-9_]*';
hljs.NR = '\\b\\d+(\\.\\d+)?';
hljs.CNR = '\\b(0[xX][a-fA-F0-9]+|(\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
hljs.BNR = '\\b(0b[01]+)'; // 0b...
hljs.RSR = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';
hljs.EOF_RE = '(?![\\s\\S])';

// Common m
hljs.BE = {
  b: '\\\\.', r: 0
};
hljs.ASM = {
  cN: 'string',
  b: '\'', e: '\'',
  i: '\\n',
  c: [hljs.BE],
  r: 0
};
hljs.QSM = {
  cN: 'string',
  b: '"', e: '"',
  i: '\\n',
  c: [hljs.BE],
  r: 0
};
hljs.CLCM = {
  cN: 'comment',
  b: '//', e: '$'
};
hljs.CBLCLM = {
  cN: 'comment',
  b: '/\\*', e: '\\*/'
};
hljs.HCM = {
  cN: 'comment',
  b: '#', e: '$'
};
hljs.NM = {
  cN: 'number',
  b: hljs.NR,
  r: 0
};
hljs.CNM = {
  cN: 'number',
  b: hljs.CNR,
  r: 0
};
hljs.BNM = {
  cN: 'number',
  b: hljs.BNR,
  r: 0
};

// Utility functions
hljs.escape = function(value) {
  return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;');
}

hljs.inherit = function(parent, obj) {
  var result = {}
  for (var key in parent)
    result[key] = parent[key];
  if (obj)
    for (var key in obj)
       result[key] = obj[key];
  return result;
};
jQuery.fn.highlight = function(language){ // may be jQuery.fn.hljs ?
  this.each(function(){
    var q = jQuery(this).first();
    var r = hljs(q.text(), language);
    if(!q.hasClass(r.language)){ q.addClass(r.language); }
    q.html(r.value);
  });
  return(this);
}
/*
Language: Python
*/

hljs.LANGUAGES.python = function() {
  var STRINGS = [
    {
      cN: 'string',
      b: '(u|b)?r?\'\'\'', e: '\'\'\'',
      r: 10
    },
    {
      cN: 'string',
      b: '(u|b)?r?"""', e: '"""',
      r: 10
    },
    {
      cN: 'string',
      b: '(u|r|ur)\'', e: '\'',
      c: [hljs.BE],
      r: 10
    },
    {
      cN: 'string',
      b: '(u|r|ur)"', e: '"',
      c: [hljs.BE],
      r: 10
    },
    {
      cN: 'string',
      b: '(b|br)\'', e: '\'',
      c: [hljs.BE]
    },
    {
      cN: 'string',
      b: '(b|br)"', e: '"',
      c: [hljs.BE]
    }
  ].concat([
    hljs.ASM,
    hljs.QSM
  ]);
  var TITLE = {
    cN: 'title', b: hljs.UIR
  };
  var PARAMS = {
    cN: 'params',
    b: '\\(', e: '\\)',
    c: ['self', hljs.CNM].concat(STRINGS)
  };
  var FUNC_CLASS_PROTO = {
    bWK: true, e: ':',
    i: '[${]',
    c: [TITLE, PARAMS],
    r: 10
  };

  return {
    dM: {
      k: {
        keyword:
          'and elif is global as in if from raise for except finally print import pass return ' +
          'exec else break not with class assert yield try while continue del or def lambda ' +
          'nonlocal|10',
        built_in:
          'None True False Ellipsis NotImplemented'
      },
      i: '(</|->|\\?)',
      c: STRINGS.concat([
        hljs.HCM,
        hljs.inherit(FUNC_CLASS_PROTO, {cN: 'function', k: 'def'}),
        hljs.inherit(FUNC_CLASS_PROTO, {cN: 'class', k: 'class'}),
        hljs.CNM,
        {
          cN: 'decorator',
          b: '@', e: '$'
        }
      ])
    }
  };
}();
/*
Language: Python profile
Description: Python profiler results
Author: Brian Beck <exogen@gmail.com>
*/

hljs.LANGUAGES.profile = {
  dM: {
    c: [
      hljs.CNM,
      {
        cN: 'builtin',
        b: '{', e: '}$',
        eB: true, eE: true,
        c: [hljs.ASM, hljs.QSM],
        r: 0
      },
      {
        cN: 'filename',
        b: '[a-zA-Z_][\\da-zA-Z_]+\\.[\\da-zA-Z_]{1,3}', e: ':',
        eE: true
      },
      {
        cN: 'header',
        b: '(ncalls|tottime|cumtime)', e: '$',
        k: 'ncalls tottime|10 cumtime|10 filename',
        r: 10
      },
      {
        cN: 'summary',
        b: 'function calls', e: '$',
        c: [hljs.CNM],
        r: 10
      },
      hljs.ASM,
      hljs.QSM,
      {
        cN: 'function',
        b: '\\(', e: '\\)$',
        c: [{
          cN: 'title',
          b: hljs.UIR,
          r: 0
        }],
        r: 0
      }
    ]
  }
};
/*
Language: Ruby
Author: Anton Kovalyov <anton@kovalyov.net>
Contributors: Peter Leonov <gojpeg@yandex.ru>, Vasily Polovnyov <vast@whiteants.net>, Loren Segal <lsegal@soen.ca>
*/

hljs.LANGUAGES.ruby = function(){
  var RUBY_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*(\\!|\\?)?';
  var RUBY_METHOD_RE = '[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?';
  var RUBY_KEYWORDS =
    'and false then defined module in return redo if BEGIN retry e for true self when ' +
    'next until do b unless END rescue nil else break undef not super class case ' +
    'require yield alias while ensure elsif or def';
  var YARDOCTAG = {
    cN: 'yardoctag',
    b: '@[A-Za-z]+'
  };
  var COMMENTS = [
    {
      cN: 'comment',
      b: '#', e: '$',
      c: [YARDOCTAG]
    },
    {
      cN: 'comment',
      b: '^\\=begin', e: '^\\=end',
      c: [YARDOCTAG],
      r: 10
    },
    {
      cN: 'comment',
      b: '^__END__', e: '\\n$'
    }
  ];
  var SUBST = {
    cN: 'subst',
    b: '#\\{', e: '}',
    l: RUBY_IDENT_RE,
    k: RUBY_KEYWORDS
  };
  var STR_CONTAINS = [hljs.BE, SUBST];
  var STRINGS = [
    {
      cN: 'string',
      b: '\'', e: '\'',
      c: STR_CONTAINS,
      r: 0
    },
    {
      cN: 'string',
      b: '"', e: '"',
      c: STR_CONTAINS,
      r: 0
    },
    {
      cN: 'string',
      b: '%[qw]?\\(', e: '\\)',
      c: STR_CONTAINS,
      r: 10
    },
    {
      cN: 'string',
      b: '%[qw]?\\[', e: '\\]',
      c: STR_CONTAINS,
      r: 10
    },
    {
      cN: 'string',
      b: '%[qw]?{', e: '}',
      c: STR_CONTAINS,
      r: 10
    },
    {
      cN: 'string',
      b: '%[qw]?<', e: '>',
      c: STR_CONTAINS,
      r: 10
    },
    {
      cN: 'string',
      b: '%[qw]?/', e: '/',
      c: STR_CONTAINS,
      r: 10
    },
    {
      cN: 'string',
      b: '%[qw]?%', e: '%',
      c: STR_CONTAINS,
      r: 10
    },
    {
      cN: 'string',
      b: '%[qw]?-', e: '-',
      c: STR_CONTAINS,
      r: 10
    },
    {
      cN: 'string',
      b: '%[qw]?\\|', e: '\\|',
      c: STR_CONTAINS,
      r: 10
    }
  ];
  var FUNCTION = {
    cN: 'function',
    b: '\\bdef\\s+', e: ' |$|;',
    l: RUBY_IDENT_RE,
    k: RUBY_KEYWORDS,
    c: [
      {
        cN: 'title',
        b: RUBY_METHOD_RE,
        l: RUBY_IDENT_RE,
        k: RUBY_KEYWORDS
      },
      {
        cN: 'params',
        b: '\\(', e: '\\)',
        l: RUBY_IDENT_RE,
        k: RUBY_KEYWORDS
      }
    ].concat(COMMENTS)
  };
  var IDENTIFIER = {
    cN: 'identifier',
    b: RUBY_IDENT_RE,
    l: RUBY_IDENT_RE,
    k: RUBY_KEYWORDS,
    r: 0
  };

  var RUBY_DEFAULT_CONTAINS = COMMENTS.concat(STRINGS.concat([
    {
      cN: 'class',
      bWK: true, e: '$|;',
      k: 'class module',
      c: [
        {
          cN: 'title',
          b: '[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?',
          r: 0
        },
        {
          cN: 'inheritance',
          b: '<\\s*',
          c: [{
            cN: 'parent',
            b: '(' + hljs.IR + '::)?' + hljs.IR
          }]
        }
      ].concat(COMMENTS)
    },
    FUNCTION,
    {
      cN: 'constant',
      b: '(::)?([A-Z]\\w*(::)?)+',
      r: 0
    },
    {
      cN: 'symbol',
      b: ':',
      c: STRINGS.concat([IDENTIFIER]),
      r: 0
    },
    {
      cN: 'number',
      b: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      r: 0
    },
    {
      cN: 'number',
      b: '\\?\\w'
    },
    {
      cN: 'variable',
      b: '(\\$\\W)|((\\$|\\@\\@?)(\\w+))'
    },
    IDENTIFIER,
    { // regexp container
      b: '(' + hljs.RSR + ')\\s*',
      c: COMMENTS.concat([
        {
          cN: 'regexp',
          b: '/', e: '/[a-z]*',
          i: '\\n',
          c: [hljs.BE]
        }
      ]),
      r: 0
    }
  ]));
  SUBST.c = RUBY_DEFAULT_CONTAINS;
  FUNCTION.c[1].c = RUBY_DEFAULT_CONTAINS;

  return {
    dM: {
      l: RUBY_IDENT_RE,
      k: RUBY_KEYWORDS,
      c: RUBY_DEFAULT_CONTAINS
    }
  };
}();
/*
Language: Perl
Author: Peter Leonov <gojpeg@yandex.ru>
*/

hljs.LANGUAGES.perl = function(){
  var PERL_KEYWORDS = 'getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ' +
    'ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime ' +
    'readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qq' +
    'fileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent ' +
    'shutdown dump chomp connect getsockname die socketpair close flock exists index shmget' +
    'sub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr ' +
    'unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 ' +
    'getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline ' +
    'endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand ' +
    'mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink ' +
    'getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr ' +
    'untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link ' +
    'getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller ' +
    'lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and ' +
    'sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 ' +
    'chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach ' +
    'tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedir' +
    'ioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe ' +
    'atan2 getgrent exp time push setgrent gt lt or ne m|0';
  var SUBST = {
    cN: 'subst',
    b: '[$@]\\{', e: '\\}',
    k: PERL_KEYWORDS,
    r: 10
  };
  var VAR1 = {
    cN: 'variable',
    b: '\\$\\d'
  };
  var VAR2 = {
    cN: 'variable',
    b: '[\\$\\%\\@\\*](\\^\\w\\b|#\\w+(\\:\\:\\w+)*|[^\\s\\w{]|{\\w+}|\\w+(\\:\\:\\w*)*)'
  };
  var STRING_CONTAINS = [hljs.BE, SUBST, VAR1, VAR2];
  var METHOD = {
    b: '->',
    c: [
      {b: hljs.IR},
      {b: '{', e: '}'}
    ]
  };
  var COMMENT = {
    cN: 'comment',
    b: '^(__END__|__DATA__)', e: '\\n$',
    r: 5
  }
  var PERL_DEFAULT_CONTAINS = [
    VAR1, VAR2,
    hljs.HCM,
    COMMENT,
    {
      cN: 'comment',
      b: '^\\=\\w', e: '\\=cut', eW: true
    },
    METHOD,
    {
      cN: 'string',
      b: 'q[qwxr]?\\s*\\(', e: '\\)',
      c: STRING_CONTAINS,
      r: 5
    },
    {
      cN: 'string',
      b: 'q[qwxr]?\\s*\\[', e: '\\]',
      c: STRING_CONTAINS,
      r: 5
    },
    {
      cN: 'string',
      b: 'q[qwxr]?\\s*\\{', e: '\\}',
      c: STRING_CONTAINS,
      r: 5
    },
    {
      cN: 'string',
      b: 'q[qwxr]?\\s*\\|', e: '\\|',
      c: STRING_CONTAINS,
      r: 5
    },
    {
      cN: 'string',
      b: 'q[qwxr]?\\s*\\<', e: '\\>',
      c: STRING_CONTAINS,
      r: 5
    },
    {
      cN: 'string',
      b: 'qw\\s+q', e: 'q',
      c: STRING_CONTAINS,
      r: 5
    },
    {
      cN: 'string',
      b: '\'', e: '\'',
      c: [hljs.BE],
      r: 0
    },
    {
      cN: 'string',
      b: '"', e: '"',
      c: STRING_CONTAINS,
      r: 0
    },
    {
      cN: 'string',
      b: '`', e: '`',
      c: [hljs.BE]
    },
    {
      cN: 'string',
      b: '{\\w+}',
      r: 0
    },
    {
      cN: 'string',
      b: '\-?\\w+\\s*\\=\\>',
      r: 0
    },
    {
      cN: 'number',
      b: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      r: 0
    },
    { // regexp container
      b: '(' + hljs.RSR + '|\\b(split|return|print|reverse|grep)\\b)\\s*',
      k: 'split return print reverse grep',
      r: 0,
      c: [
        hljs.HCM,
        COMMENT,
        {
          cN: 'regexp',
          b: '(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*',
          r: 10
        },
        {
          cN: 'regexp',
          b: '(m|qr)?/', e: '/[a-z]*',
          c: [hljs.BE],
          r: 0 // allows empty "//" which is a common comment delimiter in other languages
        }
      ]
    },
    {
      cN: 'sub',
      bWK: true, e: '(\\s*\\(.*?\\))?[;{]',
      k: 'sub',
      r: 5
    },
    {
      cN: 'operator',
      b: '-\\w\\b',
      r: 0
    }
  ];
  SUBST.c = PERL_DEFAULT_CONTAINS;
  METHOD.c[1].c = PERL_DEFAULT_CONTAINS;

  return {
    dM: {
      k: PERL_KEYWORDS,
      c: PERL_DEFAULT_CONTAINS
    }
  };
}();
/*
Language: PHP
Author: Victor Karamzin <Victor.Karamzin@enterra-inc.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Ivan Sagalaev <maniac@softwaremaniacs.org>
*/

hljs.LANGUAGES.php = function() {
  var VARIABLE = {
    cN: 'variable', b: '\\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*'
  };
  var STRINGS = [
    hljs.inherit(hljs.ASM, {i: null}),
    hljs.inherit(hljs.QSM, {i: null}),
    {
      cN: 'string',
      b: 'b"', e: '"',
      c: [hljs.BE]
    },
    {
      cN: 'string',
      b: 'b\'', e: '\'',
      c: [hljs.BE]
    }
  ];
  var NUMBERS = [
    hljs.CNM, // 0x..., 0..., decimal, float
    hljs.BNM // 0b...
  ];
  var TITLE = {
    cN: 'title', b: hljs.UIR
  };
  return {
    cI: true,
    dM: {
      k:
        'and include_once list abstract global private echo interface as static endswitch ' +
        'array null if endwhile or const for endforeach self var while isset public ' +
        'protected exit foreach throw elseif include __FILE__ empty require_once do xor ' +
        'return implements parent clone use __CLASS__ __LINE__ else break print eval new ' +
        'catch __METHOD__ case exception php_user_filter default die require __FUNCTION__ ' +
        'enddeclare final try this switch continue endfor endif declare unset true false ' +
        'namespace trait goto instanceof insteadof __DIR__ __NAMESPACE__ __halt_compiler',
      c: [
        hljs.CLCM,
        hljs.HCM,
        {
          cN: 'comment',
          b: '/\\*', e: '\\*/',
          c: [{
              cN: 'phpdoc',
              b: '\\s@[A-Za-z]+'
          }]
        },
        {
            cN: 'comment',
            eB: true,
            b: '__halt_compiler.+?;', eW: true
        },
        {
          cN: 'string',
          b: '<<<[\'"]?\\w+[\'"]?$', e: '^\\w+;',
          c: [hljs.BE]
        },
        {
          cN: 'preprocessor',
          b: '<\\?php',
          r: 10
        },
        {
          cN: 'preprocessor',
          b: '\\?>'
        },
        VARIABLE,
        {
          cN: 'function',
          bWK: true, e: '{',
          k: 'function',
          i: '\\$',
          c: [
            TITLE,
            {
              cN: 'params',
              b: '\\(', e: '\\)',
              c: [
                'self',
                VARIABLE,
                hljs.CBLCLM
              ].concat(STRINGS).concat(NUMBERS)
            }
          ]
        },
        {
          cN: 'class',
          bWK: true, e: '{',
          k: 'class',
          i: '[:\\(\\$]',
          c: [
            {
              bWK: true, eW: true,
              k: 'extends',
              c: [TITLE]
            },
            TITLE
          ]
        },
        {
          b: '=>' // No markup, just a r booster
        }
      ].concat(STRINGS).concat(NUMBERS)
    }
  };
}();
/*
Language: Scala
Author: Jan Berkel <jan.berkel@gmail.com>
*/

hljs.LANGUAGES.scala = function() {
  var ANNOTATION = {
    cN: 'annotation', b: '@[A-Za-z]+'
  };
  var STRING = {
    cN: 'string',
    b: 'u?r?"""', e: '"""',
    r: 10
  };
  return {
    dM: {
      k:
        'type yield lazy override def with val var false true sealed abstract private trait ' +
        'object null if for while throw finally protected extends import final return else ' +
        'break new catch super class case package default try this match continue throws',
      c: [
        {
          cN: 'javadoc',
          b: '/\\*\\*', e: '\\*/',
          c: [{
            cN: 'javadoctag',
            b: '@[A-Za-z]+'
          }],
          r: 10
        },
        hljs.CLCM, hljs.CBLCLM,
        hljs.ASM, hljs.QSM, STRING,
        {
          cN: 'class',
          b: '((case )?class |object |trait )', e: '({|$)', // bWK won't work because a single "case" shouldn't start this mode
          i: ':',
          k: 'case class trait object',
          c: [
            {
              bWK: true,
              k: 'extends with',
              r: 10
            },
            {
              cN: 'title',
              b: hljs.UIR
            },
            {
              cN: 'params',
              b: '\\(', e: '\\)',
              c: [
                hljs.ASM, hljs.QSM, STRING,
                ANNOTATION
              ]
            }
          ]
        },
        hljs.CNM,
        ANNOTATION
      ]
    }
  };
}();
/*
Language: Go
Author: Stephan Kountso aka StepLg <steplg@gmail.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>
Description: Google go language (golang). For info about language see http://golang.org/
*/

hljs.LANGUAGES.go = function(){
  var GO_KEYWORDS = {
    keyword:
      'break default func interface select case map struct chan else goto package switch ' +
      'const fallthrough if range type continue for import return var go defer',
    constant:
       'true false iota nil',
    typename:
      'bool byte complex64 complex128 float32 float64 int8 int16 int32 int64 string uint8 ' +
      'uint16 uint32 uint64 int uint uintptr rune',
    built_in:
      'append cap close complex copy imag len make new panic print println real recover delete'
  };
  return {
    dM: {
      k: GO_KEYWORDS,
      i: '</',
      c: [
        hljs.CLCM,
        hljs.CBLCLM,
        hljs.QSM,
        {
          cN: 'string',
          b: '\'', e: '[^\\\\]\'',
          r: 0
        },
        {
          cN: 'string',
          b: '`', e: '`'
        },
        {
          cN: 'number',
          b: '[^a-zA-Z_0-9](\\-|\\+)?\\d+(\\.\\d+|\\/\\d+)?((d|e|f|l|s)(\\+|\\-)?\\d+)?',
          r: 0
        },
        hljs.CNM
      ]
    }
  };
}();

/*
Language: HTML, XML
*/

hljs.LANGUAGES.xml = function(){
  var XML_IDENT_RE = '[A-Za-z0-9\\._:-]+';
  var TAG_INTERNALS = {
    eW: true,
    c: [
      {
        cN: 'attribute',
        b: XML_IDENT_RE,
        r: 0
      },
      {
        b: '="', rB: true, e: '"',
        c: [{
            cN: 'value',
            b: '"', eW: true
        }]
      },
      {
        b: '=\'', rB: true, e: '\'',
        c: [{
          cN: 'value',
          b: '\'', eW: true
        }]
      },
      {
        b: '=',
        c: [{
          cN: 'value',
          b: '[^\\s/>]+'
        }]
      }
    ]
  };
  return {
    cI: true,
    dM: {
      c: [
        {
          cN: 'pi',
          b: '<\\?', e: '\\?>',
          r: 10
        },
        {
          cN: 'doctype',
          b: '<!DOCTYPE', e: '>',
          r: 10,
          c: [{b: '\\[', e: '\\]'}]
        },
        {
          cN: 'comment',
          b: '<!--', e: '-->',
          r: 10
        },
        {
          cN: 'cdata',
          b: '<\\!\\[CDATA\\[', e: '\\]\\]>',
          r: 10
        },
        {
          cN: 'tag',
          /*
          The lookahead pattern (?=...) ensures that 'begin' only matches
          '<style' as a single word, followed by a whitespace or an
          ending braket. The '$' is needed for the lexem to be recognized
          by hljs.subMode() that tests l outside the stream.
          */
          b: '<style(?=\\s|>|$)', e: '>',
          k: {title: 'style'},
          c: [TAG_INTERNALS],
          starts: {
            e: '</style>', rE: true,
            sL: 'css'
          }
        },
        {
          cN: 'tag',
          // See the comment in the <style tag about the lookahead pattern
          b: '<script(?=\\s|>|$)', e: '>',
          k: {title: 'script'},
          c: [TAG_INTERNALS],
          starts: {
            e: '</script>', rE: true,
            sL: 'javascript'
          }
        },
        {
          b: '<%', e: '%>',
          sL: 'vbscript'
        },
        {
          cN: 'tag',
          b: '</?', e: '/?>',
          c: [
            {
              cN: 'title', b: '[^ />]+'
            },
            TAG_INTERNALS
          ]
        }
      ]
    }
  };
}();
/*
Language: Markdown
Requires: xml.js
Author: John Crepezzi <john.crepezzi@gmail.com>
Website: http://seejohncode.com/
*/

hljs.LANGUAGES.markdown = {
  cI: true,
  dM: {
    c: [
      // highlight headers
      {
        cN: 'header',
        b: '^#{1,3}', e: '$'
      },
      {
        cN: 'header',
        b: '^.+?\\n[=-]{2,}$'
      },
      // inline html
      {
        b: '<', e: '>',
        sL: 'xml',
        r: 0
      },
      // lists (indicators only)
      {
        cN: 'bullet',
        b: '^([*+-]|(\\d+\\.))\\s+'
      },
      // strong segments
      {
        cN: 'strong',
        b: '[*_]{2}.+?[*_]{2}'
      },
      // emphasis segments
      {
        cN: 'emphasis',
        b: '\\*.+?\\*'
      },
      {
        cN: 'emphasis',
        b: '_.+?_',
        r: 0
      },
      // blockquotes
      {
        cN: 'blockquote',
        b: '^>\\s+', e: '$'
      },
      // code snippets
      {
        cN: 'code',
        b: '`.+?`'
      },
      {
        cN: 'code',
        b: '^    ', e: '$',
        r: 0
      },
      // horizontal rules
      {
        cN: 'horizontal_rule',
        b: '^-{3,}', e: '$'
      },
      // using links - title and link
      {
        b: '\\[.+?\\]\\(.+?\\)',
        rB: true,
        c: [
          {
            cN: 'link_label',
            b: '\\[.+\\]'
          },
          {
            cN: 'link_url',
            b: '\\(', e: '\\)',
            eB: true, eE: true
          }
        ]
      }
    ]
  }
};
/*
Language: Django
Requires: xml.js
Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
Contributors: Ilya Baryshev <baryshev@gmail.com>
*/

hljs.LANGUAGES.django = function() {

  function allowsDjangoSyntax(mode, parent) {
    return (
      parent == undefined || // dM
      (!mode.cN && parent.cN == 'tag') || // tag_internal
      mode.cN == 'value' // value
    );
  }

  function copy(mode, parent) {
    var result = {};
    for (var key in mode) {
      if (key != 'contains') {
        result[key] = mode[key];
      }
      var c = [];
      for (var i = 0; mode.c && i < mode.c.length; i++) {
        c.push(copy(mode.c[i], mode));
      }
      if (allowsDjangoSyntax(mode, parent)) {
        c = DJANGO_CONTAINS.concat(c);
      }
      if (c.length) {
        result.c = c;
      }
    }
    return result;
  }

  var FILTER = {
    cN: 'filter',
    b: '\\|[A-Za-z]+\\:?', eE: true,
    k:
      'truncatewords removetags linebreaksbr yesno get_digit timesince random striptags ' +
      'filesizeformat escape linebreaks length_is ljust rjust cut urlize fix_ampersands ' +
      'title floatformat capfirst pprint divisibleby add make_list unordered_list urlencode ' +
      'timeuntil urlizetrunc wordcount stringformat linenumbers slice date dictsort ' +
      'dictsortreversed default_if_none pluralize lower join center default ' +
      'truncatewords_html upper length phone2numeric wordwrap time addslashes slugify first ' +
      'escapejs force_escape iriencode last safe safeseq truncatechars localize unlocalize ' +
      'localtime utc timezone',
    c: [
      {cN: 'argument', b: '"', e: '"'}
    ]
  };

  var DJANGO_CONTAINS = [
    {
      cN: 'template_comment',
      b: '{%\\s*comment\\s*%}', e: '{%\\s*endcomment\\s*%}'
    },
    {
      cN: 'template_comment',
      b: '{#', e: '#}'
    },
    {
      cN: 'template_tag',
      b: '{%', e: '%}',
      k:
        'comment endcomment load templatetag ifchanged endifchanged if endif firstof for ' +
        'endfor in ifnotequal endifnotequal widthratio extends include spaceless ' +
        'endspaceless regroup by as ifequal endifequal ssi now with cycle url filter ' +
        'endfilter debug block endblock else autoescape endautoescape csrf_token empty elif ' +
        'endwith static trans blocktrans endblocktrans get_static_prefix get_media_prefix ' +
        'plural get_current_language language get_available_languages ' +
        'get_current_language_bidi get_language_info get_language_info_list localize ' +
        'endlocalize localtime endlocaltime timezone endtimezone get_current_timezone',
      c: [FILTER]
    },
    {
      cN: 'variable',
      b: '{{', e: '}}',
      c: [FILTER]
    }
  ];

  return {
    cI: true,
    dM: copy(hljs.LANGUAGES.xml.dM)
  };

}();
/*
Language: CSS
*/

hljs.LANGUAGES.css = function() {
  var FUNCTION = {
    cN: 'function',
    b: hljs.IR + '\\(', e: '\\)',
    c: [{
        eW: true, eE: true,
        c: [hljs.NM, hljs.ASM, hljs.QSM]
    }]
  };
  return {
    cI: true,
    dM: {
      i: '[=/|\']',
      c: [
        hljs.CBLCLM,
        {
          cN: 'id', b: '\\#[A-Za-z0-9_-]+'
        },
        {
          cN: 'class', b: '\\.[A-Za-z0-9_-]+',
          r: 0
        },
        {
          cN: 'attr_selector',
          b: '\\[', e: '\\]',
          i: '$'
        },
        {
          cN: 'pseudo',
          b: ':(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\"\\\']+'
        },
        {
          cN: 'at_rule',
          b: '@(font-face|page)',
          l: '[a-z-]+',
          k: 'font-face page'
        },
        {
          cN: 'at_rule',
          b: '@', e: '[{;]', // at_rule eating first "{" is a good thing
                                   // because it doesn’t let it to be parsed as
                                   // a rule set but instead drops parser into
                                   // the dM which is how it should be.
          eE: true,
          k: 'import page media charset',
          c: [
            FUNCTION,
            hljs.ASM, hljs.QSM,
            hljs.NM
          ]
        },
        {
          cN: 'tag', b: hljs.IR,
          r: 0
        },
        {
          cN: 'rules',
          b: '{', e: '}',
          i: '[^\\s]',
          r: 0,
          c: [
            hljs.CBLCLM,
            {
              cN: 'rule',
              b: '[^\\s]', rB: true, e: ';', eW: true,
              c: [
                {
                  cN: 'attribute',
                  b: '[A-Z\\_\\.\\-]+', e: ':',
                  eE: true,
                  i: '[^\\s]',
                  starts: {
                    cN: 'value',
                    eW: true, eE: true,
                    c: [
                      FUNCTION,
                      hljs.NM,
                      hljs.QSM,
                      hljs.ASM,
                      hljs.CBLCLM,
                      {
                        cN: 'hexcolor', b: '\\#[0-9A-F]+'
                      },
                      {
                        cN: 'important', b: '!important'
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  };
}();
/*
Language: JSON
Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
*/

hljs.LANGUAGES.json = function(){
  var LITERALS = {literal: 'true false null'};
  var TYPES = [
    hljs.QSM,
    hljs.CNM
  ];
  var VALUE_CONTAINER = {
    cN: 'value',
    e: ',', eW: true, eE: true,
    c: TYPES,
    k: LITERALS
  };
  var OBJECT = {
    b: '{', e: '}',
    c: [
      {
        cN: 'attribute',
        b: '\\s*"', e: '"\\s*:\\s*', eB: true, eE: true,
        c: [hljs.BE],
        i: '\\n',
        starts: VALUE_CONTAINER
      }
    ],
    i: '\\S'
  };
  var ARRAY = {
    b: '\\[', e: '\\]',
    c: [hljs.inherit(VALUE_CONTAINER, {cN: null})], // inherit is also a workaround for a bug that makes shared m with eW compile only the ending of one of the parents
    i: '\\S'
  };
  TYPES.splice(TYPES.length, 0, OBJECT, ARRAY);
  return {
    dM: {
      c: TYPES,
      k: LITERALS,
      i: '\\S'
    }
  };
}();
/*
Language: JavaScript
*/

hljs.LANGUAGES.javascript = {
  dM: {
    k: {
      keyword:
        'in if for while finally var new function do return void else break catch ' +
        'instanceof with throw case default try this switch continue typeof delete',
      literal:
        'true false null undefined NaN Infinity'
    },
    c: [
      hljs.ASM,
      hljs.QSM,
      hljs.CLCM,
      hljs.CBLCLM,
      hljs.CNM,
      { // regexp container
        b: '(' + hljs.RSR + '|\\b(case|return|throw)\\b)\\s*',
        k: 'return throw case',
        c: [
          hljs.CLCM,
          hljs.CBLCLM,
          {
            cN: 'regexp',
            b: '/', e: '/[gim]*',
            c: [{b: '\\\\/'}]
          }
        ],
        r: 0
      },
      {
        cN: 'function',
        bWK: true, e: '{',
        k: 'function',
        c: [
          {
            cN: 'title', b: '[A-Za-z$_][0-9A-Za-z$_]*'
          },
          {
            cN: 'params',
            b: '\\(', e: '\\)',
            c: [
              hljs.CLCM,
              hljs.CBLCLM
            ],
            i: '["\'\\(]'
          }
        ]
      }
    ]
  }
};
/*
Language: CoffeeScript
Author: Dmytrii Nagirniak <dnagir@gmail.com>
Contributors: Oleg Efimov <efimovov@gmail.com>
Description: CoffeeScript is a programming language that transcompiles to JavaScript. For info about language see http://coffeescript.org/
*/

hljs.LANGUAGES.coffeescript = function() {
  var k = {
    keyword:
      // JS k
      'in if for while finally new do return else break catch instanceof throw try this ' +
      'switch continue typeof delete debugger class extends super' +
      // Coffee k
      'then unless until loop of by when and or is isnt not',
    literal:
      // JS literals
      'true false null undefined ' +
      // Coffee literals
      'yes no on off ',
    reserved: 'case default function var void with const let enum export import native ' +
      '__hasProp __extends __slice __bind __indexOf'
  };

  var JS_IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';

  var COFFEE_QUOTE_STRING_SUBST_MODE = {
    cN: 'subst',
    b: '#\\{', e: '}',
    k: k,
    c: [hljs.CNM, hljs.BNM]
  };

  var COFFEE_QUOTE_STRING_MODE = {
    cN: 'string',
    b: '"', e: '"',
    r: 0,
    c: [hljs.BE, COFFEE_QUOTE_STRING_SUBST_MODE]
  };

  var COFFEE_HEREDOC_MODE = {
    cN: 'string',
    b: '"""', e: '"""',
    c: [hljs.BE, COFFEE_QUOTE_STRING_SUBST_MODE]
  };

  var COFFEE_HERECOMMENT_MODE = {
    cN: 'comment',
    b: '###', e: '###'
  };

  var COFFEE_HEREGEX_MODE = {
    cN: 'regexp',
    b: '///', e: '///',
    c: [hljs.HCM]
  };

  var COFFEE_FUNCTION_DECLARATION_MODE = {
    cN: 'function',
    b: JS_IDENT_RE + '\\s*=\\s*(\\(.+\\))?\\s*[-=]>',
    rB: true,
    c: [
      {
        cN: 'title',
        b: JS_IDENT_RE
      },
      {
        cN: 'params',
        b: '\\(', e: '\\)'
      }
    ]
  };

  var COFFEE_EMBEDDED_JAVASCRIPT = {
    b: '`', e: '`',
    eB: true, eE: true,
    sL: 'javascript'
  };

  return {
    dM: {
      k: k,
      c: [
        // Numbers
        hljs.CNM,
        hljs.BNM,
        // Strings
        hljs.ASM,
        COFFEE_HEREDOC_MODE, // Should be before COFFEE_QUOTE_STRING_MODE for greater priority
        COFFEE_QUOTE_STRING_MODE,
        // Comments
        COFFEE_HERECOMMENT_MODE, // Should be before hljs.HCM for greater priority
        hljs.HCM,
        // CoffeeScript specific m
        COFFEE_HEREGEX_MODE,
        COFFEE_EMBEDDED_JAVASCRIPT,
        COFFEE_FUNCTION_DECLARATION_MODE
      ]
    }
  };
}();
/*
Language: ActionScript
Author: Alexander Myadzel <myadzel@gmail.com>
*/

hljs.LANGUAGES.actionscript = function() {
  var IR = '[a-zA-Z_$][a-zA-Z0-9_$]*';
  var IDENT_FUNC_RETURN_TYPE_RE = '([*]|[a-zA-Z_$][a-zA-Z0-9_$]*)';

  var AS3_REST_ARG_MODE = {
    cN: 'rest_arg',
    b: '[.]{3}', e: IR,
    r: 10
  };
  var TITLE_MODE = {cN: 'title', b: IR};

  return {
    dM: {
      k: {
        keyword: 'as break case catch class const continue default delete do dynamic each ' +
          'else extends final finally for function get if implements import in include ' +
          'instanceof interface internal is namespace native new override package private ' +
          'protected public return set static super switch this throw try typeof use var void ' +
          'while with',
        literal: 'true false null undefined'
      },
      c: [
        hljs.ASM,
        hljs.QSM,
        hljs.CLCM,
        hljs.CBLCLM,
        hljs.CNM,
        {
          cN: 'package',
          bWK: true, e: '{',
          k: 'package',
          c: [TITLE_MODE]
        },
        {
          cN: 'class',
          bWK: true, e: '{',
          k: 'class interface',
          c: [
            {
              bWK: true,
              k: 'extends implements'
            },
            TITLE_MODE
          ]
        },
        {
          cN: 'preprocessor',
          bWK: true, e: ';',
          k: 'import include'
        },
        {
          cN: 'function',
          bWK: true, e: '[{;]',
          k: 'function',
          i: '\\S',
          c: [
            TITLE_MODE,
            {
              cN: 'params',
              b: '\\(', e: '\\)',
              c: [
                hljs.ASM,
                hljs.QSM,
                hljs.CLCM,
                hljs.CBLCLM,
                AS3_REST_ARG_MODE
              ]
            },
            {
              cN: 'type',
              b: ':',
              e: IDENT_FUNC_RETURN_TYPE_RE,
              r: 10
            }
          ]
        }
      ]
    }
  }
}();
/*
Language: VBScript
Author: Nikita Ledyaev <lenikita@yandex.ru>
Contributors: Michal Gabrukiewicz <mgabru@gmail.com>
*/

hljs.LANGUAGES.vbscript = {
  cI: true,
  dM: {
    k: {
      keyword:
        'call class const dim do loop erase execute executeglobal exit for each next function ' +
        'if then else on error option explicit new private property let get public randomize ' +
        'redim rem select case set stop sub while wend with e to elseif is or xor and not ' +
        'class_initialize class_terminate default preserve in me byval byref step resume goto',
      built_in:
        'lcase month vartype instrrev ubound setlocale getobject rgb getref string ' +
        'weekdayname rnd dateadd monthname now day minute isarray cbool round formatcurrency ' +
        'conversions csng timevalue second year space abs clng timeserial fixs len asc ' +
        'isempty maths dateserial atn timer isobject filter weekday datevalue ccur isdate ' +
        'instr datediff formatdatetime replace isnull right sgn array snumeric log cdbl hex ' +
        'chr lbound msgbox ucase getlocale cos cdate cbyte rtrim join hour oct typename trim ' +
        'strcomp int createobject loadpicture tan formatnumber mid scriptenginebuildversion ' +
        'scriptengine split scriptengineminorversion cint sin datepart ltrim sqr ' +
        'scriptenginemajorversion time derived eval date formatpercent exp inputbox left ascw ' +
        'chrw regexp server response request cstr err',
      literal:
        'true false null nothing empty'
    },
    i: '//',
    c: [
      { // can’t use standard QSM since it’s compiled with its own escape and doesn’t use the local one
        cN: 'string',
        b: '"', e: '"',
        i: '\\n',
        c: [{b: '""'}],
        r: 0
      },
      {
        cN: 'comment',
        b: '\'', e: '$'
      },
      hljs.CNM
    ]
  }
};
/*
  Language: HTTP
  Description: HTTP request and response headers with automatic body highlighting
  Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
*/

hljs.LANGUAGES.http = {
  dM: {
    i: '\\S',
    c: [
      {
        cN: 'status',
        b: '^HTTP/[0-9\\.]+', e: '$',
        c: [{cN: 'number', b: '\\b\\d{3}\\b'}]
      },
      {
        cN: 'request',
        b: '^[A-Z]+ (.*?) HTTP/[0-9\\.]+$', rB: true, e: '$',
        c: [
          {
            cN: 'string',
            b: ' ', e: ' ',
            eB: true, eE: true
          }
        ]
      },
      {
        cN: 'attribute',
        b: '^\\w', e: ': ', eE: true,
        i: '\\n',
        starts: {cN: 'string', e: '$'}
      },
      {
        b: '\\n\\n',
        starts: {sL: '', eW: true}
      }
    ]
  }
}
/*
Language: Lua
Author: Andrew Fedorov <dmmdrs@mail.ru>
*/

hljs.LANGUAGES.lua = function() {
  var OPENING_LONG_BRACKET = '\\[=*\\[';
  var CLOSING_LONG_BRACKET = '\\]=*\\]';
  var LONG_BRACKETS = {
    b: OPENING_LONG_BRACKET, e: CLOSING_LONG_BRACKET,
    c: ['self']
  };
  var COMMENTS = [
    {
      cN: 'comment',
      b: '--(?!' + OPENING_LONG_BRACKET + ')', e: '$'
    },
    {
      cN: 'comment',
      b: '--' + OPENING_LONG_BRACKET, e: CLOSING_LONG_BRACKET,
      c: [LONG_BRACKETS],
      r: 10
    }
  ]
  return {
    dM: {
      l: hljs.UIR,
      k: {
        keyword:
          'and break do else elseif e false for if in local nil not or repeat return then ' +
          'true until while',
        built_in:
          '_G _VERSION assert collectgarbage dofile error getfenv getmetatable ipairs load ' +
          'loadfile loadstring module next pairs pcall print rawequal rawget rawset require ' +
          'select setfenv setmetatable tonumber tostring type unpack xpcall coroutine debug ' +
          'io math os package string table'
      },
      c: COMMENTS.concat([
        {
          cN: 'function',
          bWK: true, e: '\\)',
          k: 'function',
          c: [
            {
              cN: 'title',
              b: '([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*'
            },
            {
              cN: 'params',
              b: '\\(', eW: true,
              c: COMMENTS
            }
          ].concat(COMMENTS)
        },
        hljs.CNM,
        hljs.ASM,
        hljs.QSM,
        {
          cN: 'string',
          b: OPENING_LONG_BRACKET, e: CLOSING_LONG_BRACKET,
          c: [LONG_BRACKETS],
          r: 10
        }
      ])
    }
  };
}();
/*
Language: Delphi
*/

hljs.LANGUAGES.delphi = function(){
  var DELPHI_KEYWORDS = 'and safecall cdecl then string exports library not pascal set ' +
    'virtual file in array label packed e. index while const raise for to implementation ' +
    'with except overload destructor downto finally program exit unit inherited override if ' +
    'type until function do b repeat goto nil far initialization object else var uses ' +
    'external resourcestring interface e finalization class asm mod case on shr shl of ' +
    'register xorwrite threadvar try record near stored constructor stdcall inline div out or ' +
    'procedure';
  var DELPHI_CLASS_KEYWORDS = 'safecall stdcall pascal stored const implementation ' +
    'finalization except to finally program inherited override then exports string read not ' +
    'mod shr try div shl set library message packed index for near overload label downto exit ' +
    'public goto interface asm on of constructor or private array unit raise destructor var ' +
    'type until function else external with case default record while protected property ' +
    'procedure published and cdecl do threadvar file in if e virtual write far out b ' +
    'repeat nil initialization object uses resourcestring class register xorwrite inline static';
  var CURLY_COMMENT =  {
    cN: 'comment',
    b: '{', e: '}',
    r: 0
  };
  var PAREN_COMMENT = {
    cN: 'comment',
    b: '\\(\\*', e: '\\*\\)',
    r: 10
  };
  var STRING = {
    cN: 'string',
    b: '\'', e: '\'',
    c: [{b: '\'\''}],
    r: 0
  };
  var CHAR_STRING = {
    cN: 'string', b: '(#\\d+)+'
  };
  var FUNCTION = {
    cN: 'function',
    bWK: true, e: '[:;]',
    k: 'function constructor|10 destructor|10 procedure|10',
    c: [
      {
        cN: 'title', b: hljs.IR
      },
      {
        cN: 'params',
        b: '\\(', e: '\\)',
        k: DELPHI_KEYWORDS,
        c: [STRING, CHAR_STRING]
      },
      CURLY_COMMENT, PAREN_COMMENT
    ]
  };
  return {
    cI: true,
    dM: {
      k: DELPHI_KEYWORDS,
      i: '("|\\$[G-Zg-z]|\\/\\*|</)',
      c: [
        CURLY_COMMENT, PAREN_COMMENT, hljs.CLCM,
        STRING, CHAR_STRING,
        hljs.NM,
        FUNCTION,
        {
          cN: 'class',
          b: '=\\bclass\\b', e: 'end;',
          k: DELPHI_CLASS_KEYWORDS,
          c: [
            STRING, CHAR_STRING,
            CURLY_COMMENT, PAREN_COMMENT, hljs.CLCM,
            FUNCTION
          ]
        }
      ]
    }
  };
}();
/*
Language: Java
Author: Vsevolod Solovyov <vsevolod.solovyov@gmail.com>
*/

hljs.LANGUAGES.java  = {
  dM: {
    k:
      'false synchronized int abstract float private char boolean static null if const ' +
      'for true while long throw strictfp finally protected import native final return void ' +
      'enum else break transient new catch instanceof byte super volatile case assert short ' +
      'package default double public try this switch continue throws',
    c: [
      {
        cN: 'javadoc',
        b: '/\\*\\*', e: '\\*/',
        c: [{
          cN: 'javadoctag', b: '@[A-Za-z]+'
        }],
        r: 10
      },
      hljs.CLCM,
      hljs.CBLCLM,
      hljs.ASM,
      hljs.QSM,
      {
        cN: 'class',
        bWK: true, e: '{',
        k: 'class interface',
        i: ':',
        c: [
          {
            bWK: true,
            k: 'extends implements',
            r: 10
          },
          {
            cN: 'title',
            b: hljs.UIR
          }
        ]
      },
      hljs.CNM,
      {
        cN: 'annotation', b: '@[A-Za-z]+'
      }
    ]
  }
};
/*
Language: C++
Contributors: Evgeny Stepanischev <imbolk@gmail.com>
*/

hljs.LANGUAGES.cpp = function(){
  var CPP_KEYWORDS = {
    keyword: 'false int float while private char catch export virtual operator sizeof ' +
      'dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace ' +
      'unsigned long throw volatile static protected bool template mutable if public friend ' +
      'do return goto auto void enum else break new extern using true class asm case typeid ' +
      'short reinterpret_cast|10 default double register explicit signed typename try this ' +
      'switch continue wchar_t inline delete alignof char16_t char32_t constexpr decltype ' +
      'noexcept nullptr static_assert thread_local restrict _Bool complex',
    built_in: 'std string cin cout cerr clog stringstream istringstream ostringstream ' +
      'auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set ' +
      'unordered_map unordered_multiset unordered_multimap array shared_ptr'
  };
  return {
    dM: {
      k: CPP_KEYWORDS,
      i: '</',
      c: [
        hljs.CLCM,
        hljs.CBLCLM,
        hljs.QSM,
        {
          cN: 'string',
          b: '\'\\\\?.', e: '\'',
          i: '.'
        },
        {
          cN: 'number',
          b: '\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)'
        },
        hljs.CNM,
        {
          cN: 'preprocessor',
          b: '#', e: '$'
        },
        {
          cN: 'stl_container',
          b: '\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<', e: '>',
          k: CPP_KEYWORDS,
          r: 10,
          c: ['self']
        }
      ]
    }
  };
}();
/*
Language: Objective C
Author: Valerii Hiora <valerii.hiora@gmail.com>
Contributors: Angel G. Olloqui <angelgarcia.mail@gmail.com>
*/

hljs.LANGUAGES.objectivec = function(){
  var OBJC_KEYWORDS = {
    keyword:
      'int float while private char catch export sizeof typedef const struct for union ' +
      'unsigned long volatile static protected bool mutable if public do return goto void ' +
      'enum else break extern class asm case short default double throw register explicit ' +
      'signed typename try this switch continue wchar_t inline readonly assign property ' +
      'protocol self synchronized e synthesize id optional required implementation ' +
      'nonatomic interface super unichar finally dynamic IBOutlet IBAction selector strong ' +
      'weak readonly',
    literal:
    	'false true FALSE TRUE nil YES NO NULL',
    built_in:
      'NSString NSDictionary CGRect CGPoint UIButton UILabel UITextView UIWebView MKMapView ' +
      'UISegmentedControl NSObject UITableViewDelegate UITableViewDataSource NSThread ' +
      'UIActivityIndicator UITabbar UIToolBar UIBarButtonItem UIImageView NSAutoreleasePool ' +
      'UITableView BOOL NSInteger CGFloat NSException NSLog NSMutableString NSMutableArray ' +
      'NSMutableDictionary NSURL NSIndexPath CGSize UITableViewCell UIView UIViewController ' +
      'UINavigationBar UINavigationController UITabBarController UIPopoverController ' +
      'UIPopoverControllerDelegate UIImage NSNumber UISearchBar NSFetchedResultsController ' +
      'NSFetchedResultsChangeType UIScrollView UIScrollViewDelegate UIEdgeInsets UIColor ' +
      'UIFont UIApplication NSNotFound NSNotificationCenter NSNotification ' +
      'UILocalNotification NSBundle NSFileManager NSTimeInterval NSDate NSCalendar ' +
      'NSUserDefaults UIWindow NSRange NSArray NSError NSURLRequest NSURLConnection class ' +
      'UIInterfaceOrientation MPMoviePlayerController dispatch_once_t ' +
      'dispatch_queue_t dispatch_sync dispatch_async dispatch_once'
  };
  return {
    dM: {
      k: OBJC_KEYWORDS,
      i: '</',
      c: [
        hljs.CLCM,
        hljs.CBLCLM,
        hljs.CNM,
        hljs.QSM,
        {
          cN: 'string',
          b: '\'',
          e: '[^\\\\]\'',
          i: '[^\\\\][^\']'
        },

        {
          cN: 'preprocessor',
          b: '#import',
          e: '$',
          c: [
          {
            cN: 'title',
            b: '\"',
            e: '\"'
          },
          {
            cN: 'title',
            b: '<',
            e: '>'
          }
          ]
        },
        {
          cN: 'preprocessor',
          b: '#',
          e: '$'
        },
        {
          cN: 'class',
          bWK: true,
          e: '({|$)',
          k: 'interface class protocol implementation',
          c: [{
            cN: 'id',
            b: hljs.UIR
          }
          ]
        },
        {
          cN: 'variable',
          b: '\\.'+hljs.UIR
        }
      ]
    }
  };
}();
/*
Language: Vala
Author: Antono Vasiljev <antono.vasiljev@gmail.com>
Description: Vala is a new programming language that aims to bring modern programming language features to GNOME developers without imposing any additional runtime requirements and without using a different ABI compared to applications and libraries written in C.
*/

hljs.LANGUAGES.vala = {
  dM: {
    k: {
      keyword:
        // Value types
        'char uchar unichar int uint long ulong short ushort int8 int16 int32 int64 uint8 ' +
        'uint16 uint32 uint64 float double bool struct enum string void ' +
        // Reference types
        'weak unowned owned ' +
        // Modifiers
        'async signal static abstract interface override ' +
        // Control Structures
        'while do for foreach else switch case break default return try catch ' +
        // Visibility
        'public private protected internal ' +
        // Other
        'using new this get set const stdout stdin stderr var',
      built_in:
        'DBus GLib CCode Gee Object',
      literal:
        'false true null'
    },
    c: [
      {
        cN: 'class',
        bWK: true, e: '{',
        k: 'class interface delegate namespace',
        c: [
          {
            bWK: true,
            k: 'extends implements'
          },
          {
            cN: 'title',
            b: hljs.UIR
          }
        ]
      },
      hljs.CLCM,
      hljs.CBLCLM,
      {
        cN: 'string',
        b: '"""', e: '"""',
        r: 5
      },
      hljs.ASM,
      hljs.QSM,
      hljs.CNM,
      {
        cN: 'preprocessor',
        b: '^#', e: '$',
        r: 2
      },
      {
        cN: 'constant',
        b: ' [A-Z_]+ ',
        r: 0
      }
    ]
  }
};
/*
Language: C#
Author: Jason Diamond <jason@diamond.name>
*/

hljs.LANGUAGES.cs  = {
  dM: {
    k:
      // Normal k.
      'abstract as base bool break byte case catch char checked class const continue decimal ' +
      'default delegate do double else enum event explicit extern false finally fixed float ' +
      'for foreach goto if implicit in int interface internal is lock long namespace new null ' +
      'object operator out override params private protected public readonly ref return sbyte ' +
      'sealed short sizeof stackalloc static string struct switch this throw true try typeof ' +
      'uint ulong unchecked unsafe ushort using virtual volatile void while ' +
      // Contextual k.
      'ascending descending from get group into join let orderby partial select set value var '+
      'where yield',
    c: [
      {
        cN: 'comment',
        b: '///', e: '$', rB: true,
        c: [
          {
            cN: 'xmlDocTag',
            b: '///|<!--|-->'
          },
          {
            cN: 'xmlDocTag',
            b: '</?', e: '>'
          }
        ]
      },
      hljs.CLCM,
      hljs.CBLCLM,
      {
        cN: 'preprocessor',
        b: '#', e: '$',
        k: 'if else elif endif define undef warning error line region endregion pragma checksum'
      },
      {
        cN: 'string',
        b: '@"', e: '"',
        c: [{b: '""'}]
      },
      hljs.ASM,
      hljs.QSM,
      hljs.CNM
    ]
  }
};
/*
Language: D
Author: Aleksandar Ruzicic <aleksandar@ruzicic.info>
Description: D is a language with C-like syntax and static typing. It pragmatically combines efficiency, control, and modeling power, with safety and programmer productivity.
Version: 1.0a
Date: 2012-04-08
*/

/**
 * Known issues:
 *
 * - invalid hex string literals will be recognized as a double quoted strings
 *   but 'x' at the beginning of string will not be matched
 *
 * - delimited string literals are not checked for matching e delimiter
 *   (not possible to do with js regexp)
 *
 * - content of token string is colored as a string (i.e. no keyword coloring inside a token string)
 *   also, content of token string is not validated to contain only valid D tokens
 *
 * - special token sequence rule is not strictly following D grammar (anything following #line
 *   up to the e of line is matched as special token sequence)
 */

hljs.LANGUAGES.d = function() {

	/**
	 * Language k
	 *
	 * @type {Object}
	 */
	var D_KEYWORDS = {
		keyword:
			'abstract alias align asm assert auto body break byte case cast catch class ' +
			'const continue debug default delete deprecated do else enum export extern final ' +
			'finally for foreach foreach_reverse|10 goto if immutable import in inout int ' +
			'interface invariant is lazy macro mixin module new nothrow out override package ' +
			'pragma private protected public pure ref return scope shared static struct ' +
			'super switch synchronized template this throw try typedef typeid typeof union ' +
			'unittest version void volatile while with __FILE__ __LINE__ __gshared|10 ' +
			'__thread __traits __DATE__ __EOF__ __TIME__ __TIMESTAMP__ __VENDOR__ __VERSION__',
		built_in:
			'bool cdouble cent cfloat char creal dchar delegate double dstring float function ' +
			'idouble ifloat ireal long real short string ubyte ucent uint ulong ushort wchar ' +
			'wstring',
		literal:
			'false null true'
	};

	/**
	 * Number literal regexps
	 *
	 * @type {String}
	 */
	var decimal_integer_re = '(0|[1-9][\\d_]*)',
		decimal_integer_nosus_re = '(0|[1-9][\\d_]*|\\d[\\d_]*|[\\d_]+?\\d)',
		binary_integer_re = '0[bB][01_]+',
		hexadecimal_digits_re = '([\\da-fA-F][\\da-fA-F_]*|_[\\da-fA-F][\\da-fA-F_]*)',
		hexadecimal_integer_re = '0[xX]' + hexadecimal_digits_re,

		decimal_exponent_re = '([eE][+-]?' + decimal_integer_nosus_re + ')',
		decimal_float_re = '(' + decimal_integer_nosus_re + '(\\.\\d*|' + decimal_exponent_re + ')|' +
								'\\d+\\.' + decimal_integer_nosus_re + decimal_integer_nosus_re + '|' +
								'\\.' + decimal_integer_re + decimal_exponent_re + '?' +
							')',
		hexadecimal_float_re = '(0[xX](' +
									hexadecimal_digits_re + '\\.' + hexadecimal_digits_re + '|'+
									'\\.?' + hexadecimal_digits_re +
							   ')[pP][+-]?' + decimal_integer_nosus_re + ')';

		integer_re = '(' +
			decimal_integer_re + '|' +
			binary_integer_re  + '|' +
		 	hexadecimal_integer_re   +
		')',

		float_re = '(' +
			hexadecimal_float_re + '|' +
			decimal_float_re  +
		')';

	/**
	 * Escape sequence supported in D string and character literals
	 *
	 * @type {String}
	 */
	var escape_sequence_re = '\\\\(' +
							'[\'"\\?\\\\abfnrtv]|' +	// common escapes
							'u[\\dA-Fa-f]{4}|' + 		// four hex digit unicode codepoint
							'[0-7]{1,3}|' + 			// one to three octal digit ascii char code
							'x[\\dA-Fa-f]{2}|' +		// two hex digit ascii char code
							'U[\\dA-Fa-f]{8}' +			// eight hex digit unicode codepoint
						  ')|' +
						  '&[a-zA-Z\\d]{2,};';			// named character entity


	/**
	 * D integer number literals
	 *
	 * @type {Object}
	 */
	var D_INTEGER_MODE = {
		cN: 'number',
    	b: '\\b' + integer_re + '(L|u|U|Lu|LU|uL|UL)?',
    	r: 0
	};

	/**
	 * [D_FLOAT_MODE description]
	 * @type {Object}
	 */
	var D_FLOAT_MODE = {
		cN: 'number',
		b: '\\b(' +
				float_re + '([fF]|L|i|[fF]i|Li)?|' +
				integer_re + '(i|[fF]i|Li)' +
			')',
		r: 0
	};

	/**
	 * D character literal
	 *
	 * @type {Object}
	 */
	var D_CHARACTER_MODE = {
		cN: 'string',
		b: '\'(' + escape_sequence_re + '|.)', e: '\'',
		i: '.'
	};

	/**
	 * D string escape sequence
	 *
	 * @type {Object}
	 */
	var D_ESCAPE_SEQUENCE = {
		b: escape_sequence_re,
		r: 0
	}

	/**
	 * D double quoted string literal
	 *
	 * @type {Object}
	 */
	var D_STRING_MODE = {
		cN: 'string',
		b: '"',
		c: [D_ESCAPE_SEQUENCE],
		e: '"[cwd]?',
		r: 0
	};

	/**
	 * D wysiwyg and delimited string literals
	 *
	 * @type {Object}
	 */
	var D_WYSIWYG_DELIMITED_STRING_MODE = {
		cN: 'string',
		b: '[rq]"',
		e: '"[cwd]?',
		r: 5
	};

	/**
	 * D alternate wysiwyg string literal
	 *
	 * @type {Object}
	 */
	var D_ALTERNATE_WYSIWYG_STRING_MODE = {
		cN: 'string',
		b: '`',
		e: '`[cwd]?'
	};

	/**
	 * D hexadecimal string literal
	 *
	 * @type {Object}
	 */
	var D_HEX_STRING_MODE = {
		cN: 'string',
		b: 'x"[\\da-fA-F\\s\\n\\r]*"[cwd]?',
		r: 10
	};

	/**
	 * D delimited string literal
	 *
	 * @type {Object}
	 */
	var D_TOKEN_STRING_MODE = {
		cN: 'string',
		b: 'q"\\{',
		e: '\\}"'
	};

	/**
	 * Hashbang support
	 *
	 * @type {Object}
	 */
	var D_HASHBANG_MODE = {
		cN: 'shebang',
		b: '^#!',
		e: '$',
		r: 5
	};

	/**
	 * D special token sequence
	 *
	 * @type {Object}
	 */
	var D_SPECIAL_TOKEN_SEQUENCE_MODE = {
		cN: 'preprocessor',
		b: '#(line)',
		e: '$',
		r: 5
	};

	/**
	 * D attributes
	 *
	 * @type {Object}
	 */
	var D_ATTRIBUTE_MODE = {
		cN: 'keyword',
		b: '@[a-zA-Z_][a-zA-Z_\\d]*'
	};

	/**
	 * D nesting comment
	 *
	 * @type {Object}
	 */
	var D_NESTING_COMMENT_MODE = {
		cN: 'comment',
		b: '\\/\\+',
		c: ['self'],
		e: '\\+\\/',
		r: 10
	}

	return {
		dM: {
			l: hljs.UIR,
			k: D_KEYWORDS,
			c: [
				hljs.CLCM,
      			hljs.CBLCLM,
      			D_NESTING_COMMENT_MODE,
      			D_HEX_STRING_MODE,
      			D_STRING_MODE,
      			D_WYSIWYG_DELIMITED_STRING_MODE,
      			D_ALTERNATE_WYSIWYG_STRING_MODE,
      			D_TOKEN_STRING_MODE,
      			D_FLOAT_MODE,
      			D_INTEGER_MODE,
      			D_CHARACTER_MODE,
      			D_HASHBANG_MODE,
      			D_SPECIAL_TOKEN_SEQUENCE_MODE,
      			D_ATTRIBUTE_MODE
			]
		}
	};
}();
/*
Language: RenderMan RSL
Description: RenderMan RSL Language
Author: Konstantin Evdokimenko <qewerty@gmail.com>
Contributors: Shuen-Huei Guan <drake.guan@gmail.com>
*/

hljs.LANGUAGES.rsl  = {
  dM: {
    k: {
      'keyword':
        'float color point normal vector matrix while for if do return else break extern continue',
      'built_in':
        'abs acos ambient area asin atan atmosphere attribute calculatenormal ceil cellnoise ' +
        'clamp comp concat cos degrees depth Deriv diffuse distance Du Dv environment exp ' +
        'faceforward filterstep floor format fresnel incident length lightsource log match ' +
        'max min mod noise normalize ntransform opposite option phong pnoise pow printf ' +
        'ptlined radians random reflect refract renderinfo round setcomp setxcomp setycomp ' +
        'setzcomp shadow sign sin smoothstep specular specularbrdf spline sqrt step tan ' +
        'texture textureinfo trace transform vtransform xcomp ycomp zcomp'
    },
    i: '</',
    c: [
      hljs.CLCM,
      hljs.CBLCLM,
      hljs.QSM,
      hljs.ASM,
      hljs.CNM,
      {
        cN: 'preprocessor',
        b: '#', e: '$'
      },
      {
        cN: 'shader',
        bWK: true, e: '\\(',
        k: 'surface displacement light volume imager'
      },
      {
        cN: 'shading',
        bWK: true, e: '\\(',
        k: 'illuminate illuminance gather'
      }
    ]
  }
};
/*
Language: RenderMan RIB
Description: RenderMan RIB Language
Author: Konstantin Evdokimenko <qewerty@gmail.com>
Contributors: Shuen-Huei Guan <drake.guan@gmail.com>
*/

hljs.LANGUAGES.rib  = {
  dM: {
    k:
      'ArchiveRecord AreaLightSource Atmosphere Attribute AttributeBegin AttributeEnd Basis ' +
      'Begin Blobby Bound Clipping ClippingPlane Color ColorSamples ConcatTransform Cone ' +
      'CoordinateSystem CoordSysTransform CropWindow Curves Cylinder DepthOfField Detail ' +
      'DetailRange Disk Displacement Display End ErrorHandler Exposure Exterior Format ' +
      'FrameAspectRatio FrameBegin FrameEnd GeneralPolygon GeometricApproximation Geometry ' +
      'Hider Hyperboloid Identity Illuminate Imager Interior LightSource ' +
      'MakeCubeFaceEnvironment MakeLatLongEnvironment MakeShadow MakeTexture Matte ' +
      'MotionBegin MotionEnd NuPatch ObjectBegin ObjectEnd ObjectInstance Opacity Option ' +
      'Orientation Paraboloid Patch PatchMesh Perspective PixelFilter PixelSamples ' +
      'PixelVariance Points PointsGeneralPolygons PointsPolygons Polygon Procedural Projection ' +
      'Quantize ReadArchive RelativeDetail ReverseOrientation Rotate Scale ScreenWindow ' +
      'ShadingInterpolation ShadingRate Shutter Sides Skew SolidBegin SolidEnd Sphere ' +
      'SubdivisionMesh Surface TextureCoordinates Torus Transform TransformBegin TransformEnd ' +
      'TransformPoints Translate TrimCurve WorldBegin WorldEnd',
    i: '</',
    c: [
      hljs.HCM,
      hljs.CNM,
      hljs.ASM,
      hljs.QSM
    ]
  }
};

/*
Language: MEL
Description: Maya Embedded Language
Author: Shuen-Huei Guan <drake.guan@gmail.com>
*/

hljs.LANGUAGES.mel = {
  dM: {
    k:
      'int float string vector matrix if else switch case default while do for in break ' +
      'continue global proc return about abs addAttr addAttributeEditorNodeHelp addDynamic ' +
      'addNewShelfTab addPP addPanelCategory addPrefixToName advanceToNextDrivenKey ' +
      'affectedNet affects aimConstraint air alias aliasAttr align alignCtx alignCurve ' +
      'alignSurface allViewFit ambientLight angle angleBetween animCone animCurveEditor ' +
      'animDisplay animView annotate appendStringArray applicationName applyAttrPreset ' +
      'applyTake arcLenDimContext arcLengthDimension arclen arrayMapper art3dPaintCtx ' +
      'artAttrCtx artAttrPaintVertexCtx artAttrSkinPaintCtx artAttrTool artBuildPaintMenu ' +
      'artFluidAttrCtx artPuttyCtx artSelectCtx artSetPaintCtx artUserPaintCtx assignCommand ' +
      'assignInputDevice assignViewportFactories attachCurve attachDeviceAttr attachSurface ' +
      'attrColorSliderGrp attrCompatibility attrControlGrp attrEnumOptionMenu ' +
      'attrEnumOptionMenuGrp attrFieldGrp attrFieldSliderGrp attrNavigationControlGrp ' +
      'attrPresetEditWin attributeExists attributeInfo attributeMenu attributeQuery ' +
      'autoKeyframe autoPlace bakeClip bakeFluidShading bakePartialHistory bakeResults ' +
      'bakeSimulation basename basenameEx batchRender bessel bevel bevelPlus binMembership ' +
      'bindSkin blend2 blendShape blendShapeEditor blendShapePanel blendTwoAttr blindDataType ' +
      'boneLattice boundary boxDollyCtx boxZoomCtx bufferCurve buildBookmarkMenu ' +
      'buildKeyframeMenu button buttonManip CBG cacheFile cacheFileCombine cacheFileMerge ' +
      'cacheFileTrack camera cameraView canCreateManip canvas capitalizeString catch ' +
      'catchQuiet ceil changeSubdivComponentDisplayLevel changeSubdivRegion channelBox ' +
      'character characterMap characterOutlineEditor characterize chdir checkBox checkBoxGrp ' +
      'checkDefaultRenderGlobals choice circle circularFillet clamp clear clearCache clip ' +
      'clipEditor clipEditorCurrentTimeCtx clipSchedule clipSchedulerOutliner clipTrimBefore ' +
      'closeCurve closeSurface cluster cmdFileOutput cmdScrollFieldExecuter ' +
      'cmdScrollFieldReporter cmdShell coarsenSubdivSelectionList collision color ' +
      'colorAtPoint colorEditor colorIndex colorIndexSliderGrp colorSliderButtonGrp ' +
      'colorSliderGrp columnLayout commandEcho commandLine commandPort compactHairSystem ' +
      'componentEditor compositingInterop computePolysetVolume condition cone confirmDialog ' +
      'connectAttr connectControl connectDynamic connectJoint connectionInfo constrain ' +
      'constrainValue constructionHistory container containsMultibyte contextInfo control ' +
      'convertFromOldLayers convertIffToPsd convertLightmap convertSolidTx convertTessellation ' +
      'convertUnit copyArray copyFlexor copyKey copySkinWeights cos cpButton cpCache ' +
      'cpClothSet cpCollision cpConstraint cpConvClothToMesh cpForces cpGetSolverAttr cpPanel ' +
      'cpProperty cpRigidCollisionFilter cpSeam cpSetEdit cpSetSolverAttr cpSolver ' +
      'cpSolverTypes cpTool cpUpdateClothUVs createDisplayLayer createDrawCtx createEditor ' +
      'createLayeredPsdFile createMotionField createNewShelf createNode createRenderLayer ' +
      'createSubdivRegion cross crossProduct ctxAbort ctxCompletion ctxEditMode ctxTraverse ' +
      'currentCtx currentTime currentTimeCtx currentUnit currentUnit curve curveAddPtCtx ' +
      'curveCVCtx curveEPCtx curveEditorCtx curveIntersect curveMoveEPCtx curveOnSurface ' +
      'curveSketchCtx cutKey cycleCheck cylinder dagPose date defaultLightListCheckBox ' +
      'defaultNavigation defineDataServer defineVirtualDevice deformer deg_to_rad delete ' +
      'deleteAttr deleteShadingGroupsAndMaterials deleteShelfTab deleteUI deleteUnusedBrushes ' +
      'delrandstr detachCurve detachDeviceAttr detachSurface deviceEditor devicePanel dgInfo ' +
      'dgdirty dgeval dgtimer dimWhen directKeyCtx directionalLight dirmap dirname disable ' +
      'disconnectAttr disconnectJoint diskCache displacementToPoly displayAffected ' +
      'displayColor displayCull displayLevelOfDetail displayPref displayRGBColor ' +
      'displaySmoothness displayStats displayString displaySurface distanceDimContext ' +
      'distanceDimension doBlur dolly dollyCtx dopeSheetEditor dot dotProduct ' +
      'doubleProfileBirailSurface drag dragAttrContext draggerContext dropoffLocator ' +
      'duplicate duplicateCurve duplicateSurface dynCache dynControl dynExport dynExpression ' +
      'dynGlobals dynPaintEditor dynParticleCtx dynPref dynRelEdPanel dynRelEditor ' +
      'dynamicLoad editAttrLimits editDisplayLayerGlobals editDisplayLayerMembers ' +
      'editRenderLayerAdjustment editRenderLayerGlobals editRenderLayerMembers editor ' +
      'editorTemplate effector emit emitter enableDevice encodeString endString endsWith env ' +
      'equivalent equivalentTol erf error eval eval evalDeferred evalEcho event ' +
      'exactWorldBoundingBox exclusiveLightCheckBox exec executeForEachObject exists exp ' +
      'expression expressionEditorListen extendCurve extendSurface extrude fcheck fclose feof ' +
      'fflush fgetline fgetword file fileBrowserDialog fileDialog fileExtension fileInfo ' +
      'filetest filletCurve filter filterCurve filterExpand filterStudioImport ' +
      'findAllIntersections findAnimCurves findKeyframe findMenuItem findRelatedSkinCluster ' +
      'finder firstParentOf fitBspline flexor floatEq floatField floatFieldGrp floatScrollBar ' +
      'floatSlider floatSlider2 floatSliderButtonGrp floatSliderGrp floor flow fluidCacheInfo ' +
      'fluidEmitter fluidVoxelInfo flushUndo fmod fontDialog fopen formLayout format fprint ' +
      'frameLayout fread freeFormFillet frewind fromNativePath fwrite gamma gauss ' +
      'geometryConstraint getApplicationVersionAsFloat getAttr getClassification ' +
      'getDefaultBrush getFileList getFluidAttr getInputDeviceRange getMayaPanelTypes ' +
      'getModifiers getPanel getParticleAttr getPluginResource getenv getpid glRender ' +
      'glRenderEditor globalStitch gmatch goal gotoBindPose grabColor gradientControl ' +
      'gradientControlNoAttr graphDollyCtx graphSelectContext graphTrackCtx gravity grid ' +
      'gridLayout group groupObjectsByName HfAddAttractorToAS HfAssignAS HfBuildEqualMap ' +
      'HfBuildFurFiles HfBuildFurImages HfCancelAFR HfConnectASToHF HfCreateAttractor ' +
      'HfDeleteAS HfEditAS HfPerformCreateAS HfRemoveAttractorFromAS HfSelectAttached ' +
      'HfSelectAttractors HfUnAssignAS hardenPointCurve hardware hardwareRenderPanel ' +
      'headsUpDisplay headsUpMessage help helpLine hermite hide hilite hitTest hotBox hotkey ' +
      'hotkeyCheck hsv_to_rgb hudButton hudSlider hudSliderButton hwReflectionMap hwRender ' +
      'hwRenderLoad hyperGraph hyperPanel hyperShade hypot iconTextButton iconTextCheckBox ' +
      'iconTextRadioButton iconTextRadioCollection iconTextScrollList iconTextStaticLabel ' +
      'ikHandle ikHandleCtx ikHandleDisplayScale ikSolver ikSplineHandleCtx ikSystem ' +
      'ikSystemInfo ikfkDisplayMethod illustratorCurves image imfPlugins inheritTransform ' +
      'insertJoint insertJointCtx insertKeyCtx insertKnotCurve insertKnotSurface instance ' +
      'instanceable instancer intField intFieldGrp intScrollBar intSlider intSliderGrp ' +
      'interToUI internalVar intersect iprEngine isAnimCurve isConnected isDirty isParentOf ' +
      'isSameObject isTrue isValidObjectName isValidString isValidUiName isolateSelect ' +
      'itemFilter itemFilterAttr itemFilterRender itemFilterType joint jointCluster jointCtx ' +
      'jointDisplayScale jointLattice keyTangent keyframe keyframeOutliner ' +
      'keyframeRegionCurrentTimeCtx keyframeRegionDirectKeyCtx keyframeRegionDollyCtx ' +
      'keyframeRegionInsertKeyCtx keyframeRegionMoveKeyCtx keyframeRegionScaleKeyCtx ' +
      'keyframeRegionSelectKeyCtx keyframeRegionSetKeyCtx keyframeRegionTrackCtx ' +
      'keyframeStats lassoContext lattice latticeDeformKeyCtx launch launchImageEditor ' +
      'layerButton layeredShaderPort layeredTexturePort layout layoutDialog lightList ' +
      'lightListEditor lightListPanel lightlink lineIntersection linearPrecision linstep ' +
      'listAnimatable listAttr listCameras listConnections listDeviceAttachments listHistory ' +
      'listInputDeviceAxes listInputDeviceButtons listInputDevices listMenuAnnotation ' +
      'listNodeTypes listPanelCategories listRelatives listSets listTransforms ' +
      'listUnselected listerEditor loadFluid loadNewShelf loadPlugin ' +
      'loadPluginLanguageResources loadPrefObjects localizedPanelLabel lockNode loft log ' +
      'longNameOf lookThru ls lsThroughFilter lsType lsUI Mayatomr mag makeIdentity makeLive ' +
      'makePaintable makeRoll makeSingleSurface makeTubeOn makebot manipMoveContext ' +
      'manipMoveLimitsCtx manipOptions manipRotateContext manipRotateLimitsCtx ' +
      'manipScaleContext manipScaleLimitsCtx marker match max memory menu menuBarLayout ' +
      'menuEditor menuItem menuItemToShelf menuSet menuSetPref messageLine min minimizeApp ' +
      'mirrorJoint modelCurrentTimeCtx modelEditor modelPanel mouse movIn movOut move ' +
      'moveIKtoFK moveKeyCtx moveVertexAlongDirection multiProfileBirailSurface mute ' +
      'nParticle nameCommand nameField namespace namespaceInfo newPanelItems newton nodeCast ' +
      'nodeIconButton nodeOutliner nodePreset nodeType noise nonLinear normalConstraint ' +
      'normalize nurbsBoolean nurbsCopyUVSet nurbsCube nurbsEditUV nurbsPlane nurbsSelect ' +
      'nurbsSquare nurbsToPoly nurbsToPolygonsPref nurbsToSubdiv nurbsToSubdivPref ' +
      'nurbsUVSet nurbsViewDirectionVector objExists objectCenter objectLayer objectType ' +
      'objectTypeUI obsoleteProc oceanNurbsPreviewPlane offsetCurve offsetCurveOnSurface ' +
      'offsetSurface openGLExtension openMayaPref optionMenu optionMenuGrp optionVar orbit ' +
      'orbitCtx orientConstraint outlinerEditor outlinerPanel overrideModifier ' +
      'paintEffectsDisplay pairBlend palettePort paneLayout panel panelConfiguration ' +
      'panelHistory paramDimContext paramDimension paramLocator parent parentConstraint ' +
      'particle particleExists particleInstancer particleRenderInfo partition pasteKey ' +
      'pathAnimation pause pclose percent performanceOptions pfxstrokes pickWalk picture ' +
      'pixelMove planarSrf plane play playbackOptions playblast plugAttr plugNode pluginInfo ' +
      'pluginResourceUtil pointConstraint pointCurveConstraint pointLight pointMatrixMult ' +
      'pointOnCurve pointOnSurface pointPosition poleVectorConstraint polyAppend ' +
      'polyAppendFacetCtx polyAppendVertex polyAutoProjection polyAverageNormal ' +
      'polyAverageVertex polyBevel polyBlendColor polyBlindData polyBoolOp polyBridgeEdge ' +
      'polyCacheMonitor polyCheck polyChipOff polyClipboard polyCloseBorder polyCollapseEdge ' +
      'polyCollapseFacet polyColorBlindData polyColorDel polyColorPerVertex polyColorSet ' +
      'polyCompare polyCone polyCopyUV polyCrease polyCreaseCtx polyCreateFacet ' +
      'polyCreateFacetCtx polyCube polyCut polyCutCtx polyCylinder polyCylindricalProjection ' +
      'polyDelEdge polyDelFacet polyDelVertex polyDuplicateAndConnect polyDuplicateEdge ' +
      'polyEditUV polyEditUVShell polyEvaluate polyExtrudeEdge polyExtrudeFacet ' +
      'polyExtrudeVertex polyFlipEdge polyFlipUV polyForceUV polyGeoSampler polyHelix ' +
      'polyInfo polyInstallAction polyLayoutUV polyListComponentConversion polyMapCut ' +
      'polyMapDel polyMapSew polyMapSewMove polyMergeEdge polyMergeEdgeCtx polyMergeFacet ' +
      'polyMergeFacetCtx polyMergeUV polyMergeVertex polyMirrorFace polyMoveEdge ' +
      'polyMoveFacet polyMoveFacetUV polyMoveUV polyMoveVertex polyNormal polyNormalPerVertex ' +
      'polyNormalizeUV polyOptUvs polyOptions polyOutput polyPipe polyPlanarProjection ' +
      'polyPlane polyPlatonicSolid polyPoke polyPrimitive polyPrism polyProjection ' +
      'polyPyramid polyQuad polyQueryBlindData polyReduce polySelect polySelectConstraint ' +
      'polySelectConstraintMonitor polySelectCtx polySelectEditCtx polySeparate ' +
      'polySetToFaceNormal polySewEdge polyShortestPathCtx polySmooth polySoftEdge ' +
      'polySphere polySphericalProjection polySplit polySplitCtx polySplitEdge polySplitRing ' +
      'polySplitVertex polyStraightenUVBorder polySubdivideEdge polySubdivideFacet ' +
      'polyToSubdiv polyTorus polyTransfer polyTriangulate polyUVSet polyUnite polyWedgeFace ' +
      'popen popupMenu pose pow preloadRefEd print progressBar progressWindow projFileViewer ' +
      'projectCurve projectTangent projectionContext projectionManip promptDialog propModCtx ' +
      'propMove psdChannelOutliner psdEditTextureFile psdExport psdTextureFile putenv pwd ' +
      'python querySubdiv quit rad_to_deg radial radioButton radioButtonGrp radioCollection ' +
      'radioMenuItemCollection rampColorPort rand randomizeFollicles randstate rangeControl ' +
      'readTake rebuildCurve rebuildSurface recordAttr recordDevice redo reference ' +
      'referenceEdit referenceQuery refineSubdivSelectionList refresh refreshAE ' +
      'registerPluginResource rehash reloadImage removeJoint removeMultiInstance ' +
      'removePanelCategory rename renameAttr renameSelectionList renameUI render ' +
      'renderGlobalsNode renderInfo renderLayerButton renderLayerParent ' +
      'renderLayerPostProcess renderLayerUnparent renderManip renderPartition ' +
      'renderQualityNode renderSettings renderThumbnailUpdate renderWindowEditor ' +
      'renderWindowSelectContext renderer reorder reorderDeformers requires reroot ' +
      'resampleFluid resetAE resetPfxToPolyCamera resetTool resolutionNode retarget ' +
      'reverseCurve reverseSurface revolve rgb_to_hsv rigidBody rigidSolver roll rollCtx ' +
      'rootOf rot rotate rotationInterpolation roundConstantRadius rowColumnLayout rowLayout ' +
      'runTimeCommand runup sampleImage saveAllShelves saveAttrPreset saveFluid saveImage ' +
      'saveInitialState saveMenu savePrefObjects savePrefs saveShelf saveToolSettings scale ' +
      'scaleBrushBrightness scaleComponents scaleConstraint scaleKey scaleKeyCtx sceneEditor ' +
      'sceneUIReplacement scmh scriptCtx scriptEditorInfo scriptJob scriptNode scriptTable ' +
      'scriptToShelf scriptedPanel scriptedPanelType scrollField scrollLayout sculpt ' +
      'searchPathArray seed selLoadSettings select selectContext selectCurveCV selectKey ' +
      'selectKeyCtx selectKeyframeRegionCtx selectMode selectPref selectPriority selectType ' +
      'selectedNodes selectionConnection separator setAttr setAttrEnumResource ' +
      'setAttrMapping setAttrNiceNameResource setConstraintRestPosition ' +
      'setDefaultShadingGroup setDrivenKeyframe setDynamic setEditCtx setEditor setFluidAttr ' +
      'setFocus setInfinity setInputDeviceMapping setKeyCtx setKeyPath setKeyframe ' +
      'setKeyframeBlendshapeTargetWts setMenuMode setNodeNiceNameResource setNodeTypeFlag ' +
      'setParent setParticleAttr setPfxToPolyCamera setPluginResource setProject ' +
      'setStampDensity setStartupMessage setState setToolTo setUITemplate setXformManip sets ' +
      'shadingConnection shadingGeometryRelCtx shadingLightRelCtx shadingNetworkCompare ' +
      'shadingNode shapeCompare shelfButton shelfLayout shelfTabLayout shellField ' +
      'shortNameOf showHelp showHidden showManipCtx showSelectionInTitle ' +
      'showShadingGroupAttrEditor showWindow sign simplify sin singleProfileBirailSurface ' +
      'size sizeBytes skinCluster skinPercent smoothCurve smoothTangentSurface smoothstep ' +
      'snap2to2 snapKey snapMode snapTogetherCtx snapshot soft softMod softModCtx sort sound ' +
      'soundControl source spaceLocator sphere sphrand spotLight spotLightPreviewPort ' +
      'spreadSheetEditor spring sqrt squareSurface srtContext stackTrace startString ' +
      'startsWith stitchAndExplodeShell stitchSurface stitchSurfacePoints strcmp ' +
      'stringArrayCatenate stringArrayContains stringArrayCount stringArrayInsertAtIndex ' +
      'stringArrayIntersector stringArrayRemove stringArrayRemoveAtIndex ' +
      'stringArrayRemoveDuplicates stringArrayRemoveExact stringArrayToString ' +
      'stringToStringArray strip stripPrefixFromName stroke subdAutoProjection ' +
      'subdCleanTopology subdCollapse subdDuplicateAndConnect subdEditUV ' +
      'subdListComponentConversion subdMapCut subdMapSewMove subdMatchTopology subdMirror ' +
      'subdToBlind subdToPoly subdTransferUVsToCache subdiv subdivCrease ' +
      'subdivDisplaySmoothness substitute substituteAllString substituteGeometry substring ' +
      'surface surfaceSampler surfaceShaderList swatchDisplayPort switchTable symbolButton ' +
      'symbolCheckBox sysFile system tabLayout tan tangentConstraint texLatticeDeformContext ' +
      'texManipContext texMoveContext texMoveUVShellContext texRotateContext texScaleContext ' +
      'texSelectContext texSelectShortestPathCtx texSmudgeUVContext texWinToolCtx text ' +
      'textCurves textField textFieldButtonGrp textFieldGrp textManip textScrollList ' +
      'textToShelf textureDisplacePlane textureHairColor texturePlacementContext ' +
      'textureWindow threadCount threePointArcCtx timeControl timePort timerX toNativePath ' +
      'toggle toggleAxis toggleWindowVisibility tokenize tokenizeList tolerance tolower ' +
      'toolButton toolCollection toolDropped toolHasOptions toolPropertyWindow torus toupper ' +
      'trace track trackCtx transferAttributes transformCompare transformLimits translator ' +
      'trim trunc truncateFluidCache truncateHairCache tumble tumbleCtx turbulence ' +
      'twoPointArcCtx uiRes uiTemplate unassignInputDevice undo undoInfo ungroup uniform unit ' +
      'unloadPlugin untangleUV untitledFileName untrim upAxis updateAE userCtx uvLink ' +
      'uvSnapshot validateShelfName vectorize view2dToolCtx viewCamera viewClipPlane ' +
      'viewFit viewHeadOn viewLookAt viewManip viewPlace viewSet visor volumeAxis vortex ' +
      'waitCursor warning webBrowser webBrowserPrefs whatIs window windowPref wire ' +
      'wireContext workspace wrinkle wrinkleContext writeTake xbmLangPathList xform',
    i: '</',
    c: [
      hljs.CNM,
      hljs.ASM,
      hljs.QSM,
      {
        cN: 'string',
        b: '`', e: '`',
        c: [hljs.BE]
      },
      {
        cN: 'variable',
        b: '\\$\\d',
        r: 5
      },
      {
        cN: 'variable',
        b: '[\\$\\%\\@\\*](\\^\\w\\b|#\\w+|[^\\s\\w{]|{\\w+}|\\w+)'
      },
      hljs.CLCM,
      hljs.CBLCLM
    ]
  }
};
/*
Language: SQL
*/

hljs.LANGUAGES.sql = {
  cI: true,
  dM: {
    i: '[^\\s]',
    c: [
      {
        cN: 'operator',
        b: '(begin|start|commit|rollback|savepoint|lock|alter|create|drop|rename|call|delete|do|handler|insert|load|replace|select|truncate|update|set|show|pragma|grant)\\b', e: ';', eW: true,
        k: {
          keyword: 'all partial global month current_timestamp using go revoke smallint ' +
            'indicator e-exec disconnect zone with character assertion to add current_user ' +
            'usage input local alter match collate real then rollback get read timestamp ' +
            'session_user not integer bit unique day minute desc insert execute like ilike|2 ' +
            'level decimal drop continue isolation found where constraints domain right ' +
            'national some module transaction relative second connect escape close system_user ' +
            'for deferred section cast current sqlstate allocate intersect deallocate numeric ' +
            'public preserve full goto initially asc no key output collation group by union ' +
            'session both last language constraint column of space foreign deferrable prior ' +
            'connection unknown action commit view or first into float year primary cascaded ' +
            'except restrict set references names table outer open select size are rows from ' +
            'prepare distinct leading create only next inner authorization schema ' +
            'corresponding option declare precision immediate else timezone_minute external ' +
            'varying translation true case exception join hour default double scroll value ' +
            'cursor descriptor values dec fetch procedure delete and false int is describe ' +
            'char as at in varchar null trailing any absolute current_time e grant ' +
            'privileges when cross check write current_date pad b temporary exec time ' +
            'update catalog user sql date on identity timezone_hour natural whenever interval ' +
            'work order cascade diagnostics nchar having left call do handler load replace ' +
            'truncate start lock show pragma',
          aggregate: 'count sum min max avg'
        },
        c: [
          {
            cN: 'string',
            b: '\'', e: '\'',
            c: [hljs.BE, {b: '\'\''}],
            r: 0
          },
          {
            cN: 'string',
            b: '"', e: '"',
            c: [hljs.BE, {b: '""'}],
            r: 0
          },
          {
            cN: 'string',
            b: '`', e: '`',
            c: [hljs.BE]
          },
          hljs.CNM
        ]
      },
      hljs.CBLCLM,
      {
        cN: 'comment',
        b: '--', e: '$'
      }
    ]
  }
};
/*
Language: Smalltalk
Author: Vladimir Gubarkov <xonixx@gmail.com>
*/

hljs.LANGUAGES.smalltalk = function() {
  var VAR_IDENT_RE = '[a-z][a-zA-Z0-9_]*';
  var CHAR = {
    cN: 'char',
    b: '\\$.{1}'
  };
  var SYMBOL = {
    cN: 'symbol',
    b: '#' + hljs.UIR
  };
  return {
    dM: {
      k: 'self super nil true false thisContext', // only 6
      c: [
        {
          cN: 'comment',
          b: '"', e: '"',
          r: 0
        },
        hljs.ASM,
        {
          cN: 'class',
          b: '\\b[A-Z][A-Za-z0-9_]*',
          r: 0
        },
        {
          cN: 'method',
          b: VAR_IDENT_RE + ':'
        },
        hljs.CNM,
        SYMBOL,
        CHAR,
        {
          cN: 'localvars',
          b: '\\|\\s*((' + VAR_IDENT_RE + ')\\s*)+\\|'
        },
        {
          cN: 'array',
          b: '\\#\\(', e: '\\)',
          c: [
            hljs.ASM,
            CHAR,
            hljs.CNM,
            SYMBOL
          ]
        }
      ]
    }
  };
}();
/*
Language: Lisp
Description: Generic lisp syntax
Author: Vasily Polovnyov <vast@whiteants.net>
*/

hljs.LANGUAGES.lisp = function(){
  var LISP_IDENT_RE = '[a-zA-Z_\\-\\+\\*\\/\\<\\=\\>\\&\\#][a-zA-Z0-9_\\-\\+\\*\\/\\<\\=\\>\\&\\#]*';
  var LISP_SIMPLE_NUMBER_RE = '(\\-|\\+)?\\d+(\\.\\d+|\\/\\d+)?((d|e|f|l|s)(\\+|\\-)?\\d+)?';
  var LITERAL = {
    cN: 'literal',
    b: '\\b(t{1}|nil)\\b'
  };
  var NUMBERS = [
    {
      cN: 'number', b: LISP_SIMPLE_NUMBER_RE
    },
    {
      cN: 'number', b: '#b[0-1]+(/[0-1]+)?'
    },
    {
      cN: 'number', b: '#o[0-7]+(/[0-7]+)?'
    },
    {
      cN: 'number', b: '#x[0-9a-f]+(/[0-9a-f]+)?'
    },
    {
      cN: 'number', b: '#c\\(' + LISP_SIMPLE_NUMBER_RE + ' +' + LISP_SIMPLE_NUMBER_RE, e: '\\)'
    }
  ]
  var STRING = {
    cN: 'string',
    b: '"', e: '"',
    c: [hljs.BE],
    r: 0
  };
  var COMMENT = {
    cN: 'comment',
    b: ';', e: '$'
  };
  var VARIABLE = {
    cN: 'variable',
    b: '\\*', e: '\\*'
  };
  var KEYWORD = {
    cN: 'keyword',
    b: '[:&]' + LISP_IDENT_RE
  };
  var QUOTED_LIST = {
    b: '\\(', e: '\\)',
    c: ['self', LITERAL, STRING].concat(NUMBERS)
  };
  var QUOTED1 = {
    cN: 'quoted',
    b: '[\'`]\\(', e: '\\)',
    c: NUMBERS.concat([STRING, VARIABLE, KEYWORD, QUOTED_LIST])
  };
  var QUOTED2 = {
    cN: 'quoted',
    b: '\\(quote ', e: '\\)',
    k: {title: 'quote'},
    c: NUMBERS.concat([STRING, VARIABLE, KEYWORD, QUOTED_LIST])
  };
  var LIST = {
    cN: 'list',
    b: '\\(', e: '\\)'
  };
  var BODY = {
    cN: 'body',
    eW: true, eE: true
  };
  LIST.c = [{cN: 'title', b: LISP_IDENT_RE}, BODY];
  BODY.c = [QUOTED1, QUOTED2, LIST, LITERAL].concat(NUMBERS).concat([STRING, COMMENT, VARIABLE, KEYWORD]);

  return {
    cI: true,
    dM: {
      i: '[^\\s]',
      c: NUMBERS.concat([
        LITERAL,
        STRING,
        COMMENT,
        QUOTED1, QUOTED2,
        LIST
      ])
    }
  };
}();
/*
Language: Ini
*/

hljs.LANGUAGES.ini = {
  cI: true,
  dM: {
    i: '[^\\s]',
    c: [
      {
        cN: 'comment',
        b: ';', e: '$'
      },
      {
        cN: 'title',
        b: '^\\[', e: '\\]'
      },
      {
        cN: 'setting',
        b: '^[a-z0-9_\\[\\]]+[ \\t]*=[ \\t]*', e: '$',
        c: [
          {
            cN: 'value',
            eW: true,
            k: 'on off true false yes no',
            c: [hljs.QSM, hljs.NM]
          }
        ]
      }
    ]
  }
};
/*
Language: Apache
Author: Ruslan Keba <rukeba@gmail.com>
Website: http://rukeba.com/
Description: language definition for Apache configuration files (httpd.conf & .htaccess)
Version: 1.1
Date: 2008-12-27
*/

hljs.LANGUAGES.apache = function(){
  var NUMBER = {cN: 'number', b: '[\\$%]\\d+'};
  return {
    cI: true,
    dM: {
      k: {
        keyword: 'acceptfilter acceptmutex acceptpathinfo accessfilename action addalt ' +
          'addaltbyencoding addaltbytype addcharset adddefaultcharset adddescription ' +
          'addencoding addhandler addicon addiconbyencoding addiconbytype addinputfilter ' +
          'addlanguage addmoduleinfo addoutputfilter addoutputfilterbytype addtype alias ' +
          'aliasmatch allow allowconnect allowencodedslashes allowoverride anonymous ' +
          'anonymous_logemail anonymous_mustgiveemail anonymous_nouserid anonymous_verifyemail ' +
          'authbasicauthoritative authbasicprovider authdbduserpwquery authdbduserrealmquery ' +
          'authdbmgroupfile authdbmtype authdbmuserfile authdefaultauthoritative ' +
          'authdigestalgorithm authdigestdomain authdigestnccheck authdigestnonceformat ' +
          'authdigestnoncelifetime authdigestprovider authdigestqop authdigestshmemsize ' +
          'authgroupfile authldapbinddn authldapbindpassword authldapcharsetconfig ' +
          'authldapcomparednonserver authldapdereferencealiases authldapgroupattribute ' +
          'authldapgroupattributeisdn authldapremoteuserattribute authldapremoteuserisdn ' +
          'authldapurl authname authnprovideralias authtype authuserfile authzdbmauthoritative ' +
          'authzdbmtype authzdefaultauthoritative authzgroupfileauthoritative ' +
          'authzldapauthoritative authzownerauthoritative authzuserauthoritative ' +
          'balancermember browsermatch browsermatchnocase bufferedlogs cachedefaultexpire ' +
          'cachedirlength cachedirlevels cachedisable cacheenable cachefile ' +
          'cacheignorecachecontrol cacheignoreheaders cacheignorenolastmod ' +
          'cacheignorequerystring cachelastmodifiedfactor cachemaxexpire cachemaxfilesize ' +
          'cacheminfilesize cachenegotiateddocs cacheroot cachestorenostore cachestoreprivate ' +
          'cgimapextension charsetdefault charsetoptions charsetsourceenc checkcaseonly ' +
          'checkspelling chrootdir contentdigest cookiedomain cookieexpires cookielog ' +
          'cookiename cookiestyle cookietracking coredumpdirectory customlog dav ' +
          'davdepthinfinity davgenericlockdb davlockdb davmintimeout dbdexptime dbdkeep ' +
          'dbdmax dbdmin dbdparams dbdpersist dbdpreparesql dbdriver defaulticon ' +
          'defaultlanguage defaulttype deflatebuffersize deflatecompressionlevel ' +
          'deflatefilternote deflatememlevel deflatewindowsize deny directoryindex ' +
          'directorymatch directoryslash documentroot dumpioinput dumpiologlevel dumpiooutput ' +
          'enableexceptionhook enablemmap enablesendfile errordocument errorlog example ' +
          'expiresactive expiresbytype expiresdefault extendedstatus extfilterdefine ' +
          'extfilteroptions fileetag filterchain filterdeclare filterprotocol filterprovider ' +
          'filtertrace forcelanguagepriority forcetype forensiclog gracefulshutdowntimeout ' +
          'group header headername hostnamelookups identitycheck identitychecktimeout ' +
          'imapbase imapdefault imapmenu include indexheadinsert indexignore indexoptions ' +
          'indexorderdefault indexstylesheet isapiappendlogtoerrors isapiappendlogtoquery ' +
          'isapicachefile isapifakeasync isapilognotsupported isapireadaheadbuffer keepalive ' +
          'keepalivetimeout languagepriority ldapcacheentries ldapcachettl ' +
          'ldapconnectiontimeout ldapopcacheentries ldapopcachettl ldapsharedcachefile ' +
          'ldapsharedcachesize ldaptrustedclientcert ldaptrustedglobalcert ldaptrustedmode ' +
          'ldapverifyservercert limitinternalrecursion limitrequestbody limitrequestfields ' +
          'limitrequestfieldsize limitrequestline limitxmlrequestbody listen listenbacklog ' +
          'loadfile loadmodule lockfile logformat loglevel maxclients maxkeepaliverequests ' +
          'maxmemfree maxrequestsperchild maxrequestsperthread maxspareservers maxsparethreads ' +
          'maxthreads mcachemaxobjectcount mcachemaxobjectsize mcachemaxstreamingbuffer ' +
          'mcacheminobjectsize mcacheremovalalgorithm mcachesize metadir metafiles metasuffix ' +
          'mimemagicfile minspareservers minsparethreads mmapfile mod_gzip_on ' +
          'mod_gzip_add_header_count mod_gzip_keep_workfiles mod_gzip_dechunk ' +
          'mod_gzip_min_http mod_gzip_minimum_file_size mod_gzip_maximum_file_size ' +
          'mod_gzip_maximum_inmem_size mod_gzip_temp_dir mod_gzip_item_include ' +
          'mod_gzip_item_exclude mod_gzip_command_version mod_gzip_can_negotiate ' +
          'mod_gzip_handle_methods mod_gzip_static_suffix mod_gzip_send_vary ' +
          'mod_gzip_update_static modmimeusepathinfo multiviewsmatch namevirtualhost noproxy ' +
          'nwssltrustedcerts nwsslupgradeable options order passenv pidfile protocolecho ' +
          'proxybadheader proxyblock proxydomain proxyerroroverride proxyftpdircharset ' +
          'proxyiobuffersize proxymaxforwards proxypass proxypassinterpolateenv ' +
          'proxypassmatch proxypassreverse proxypassreversecookiedomain ' +
          'proxypassreversecookiepath proxypreservehost proxyreceivebuffersize proxyremote ' +
          'proxyremotematch proxyrequests proxyset proxystatus proxytimeout proxyvia ' +
          'readmename receivebuffersize redirect redirectmatch redirectpermanent ' +
          'redirecttemp removecharset removeencoding removehandler removeinputfilter ' +
          'removelanguage removeoutputfilter removetype requestheader require rewritebase ' +
          'rewritecond rewriteengine rewritelock rewritelog rewriteloglevel rewritemap ' +
          'rewriteoptions rewriterule rlimitcpu rlimitmem rlimitnproc satisfy scoreboardfile ' +
          'script scriptalias scriptaliasmatch scriptinterpretersource scriptlog ' +
          'scriptlogbuffer scriptloglength scriptsock securelisten seerequesttail ' +
          'sendbuffersize serveradmin serveralias serverlimit servername serverpath ' +
          'serverroot serversignature servertokens setenv setenvif setenvifnocase sethandler ' +
          'setinputfilter setoutputfilter ssienableaccess ssiendtag ssierrormsg ssistarttag ' +
          'ssitimeformat ssiundefinedecho sslcacertificatefile sslcacertificatepath ' +
          'sslcadnrequestfile sslcadnrequestpath sslcarevocationfile sslcarevocationpath ' +
          'sslcertificatechainfile sslcertificatefile sslcertificatekeyfile sslciphersuite ' +
          'sslcryptodevice sslengine sslhonorciperorder sslmutex ssloptions ' +
          'sslpassphrasedialog sslprotocol sslproxycacertificatefile ' +
          'sslproxycacertificatepath sslproxycarevocationfile sslproxycarevocationpath ' +
          'sslproxyciphersuite sslproxyengine sslproxymachinecertificatefile ' +
          'sslproxymachinecertificatepath sslproxyprotocol sslproxyverify ' +
          'sslproxyverifydepth sslrandomseed sslrequire sslrequiressl sslsessioncache ' +
          'sslsessioncachetimeout sslusername sslverifyclient sslverifydepth startservers ' +
          'startthreads substitute suexecusergroup threadlimit threadsperchild ' +
          'threadstacksize timeout traceenable transferlog typesconfig unsetenv ' +
          'usecanonicalname usecanonicalphysicalport user userdir virtualdocumentroot ' +
          'virtualdocumentrootip virtualscriptalias virtualscriptaliasip ' +
          'win32disableacceptex xbithack',
        literal: 'on off'
      },
      c: [
        hljs.HCM,
        {
          cN: 'sqbracket',
          b: '\\s\\[', e: '\\]$'
        },
        {
          cN: 'cbracket',
          b: '[\\$%]\\{', e: '\\}',
          c: ['self', NUMBER]
        },
        NUMBER,
        {cN: 'tag', b: '</?', e: '>'},
        hljs.QSM
      ]
    }
  };
}();
/*
Language: Nginx
Author: Peter Leonov <gojpeg@yandex.ru>
*/

hljs.LANGUAGES.nginx = function() {
  var VAR1 = {
    cN: 'variable',
    b: '\\$\\d+'
  };
  var VAR2 = {
    cN: 'variable',
    b: '\\${', e: '}'
  };
  var VAR3 = {
    cN: 'variable',
    b: '[\\$\\@]' + hljs.UIR
  };

  return {
    dM: {
      c: [
        hljs.HCM,
        { // directive
          b: hljs.UIR, e: ';|{', rE: true,
          k:
            'accept_mutex accept_mutex_delay access_log add_after_body add_before_body ' +
            'add_header addition_types alias allow ancient_browser ancient_browser_value ' +
            'auth_basic auth_basic_user_file autoindex autoindex_exact_size ' +
            'autoindex_localtime break charset charset_map charset_types ' +
            'client_body_buffer_size client_body_in_file_only client_body_in_single_buffer ' +
            'client_body_temp_path client_body_timeout client_header_buffer_size ' +
            'client_header_timeout client_max_body_size connection_pool_size connections ' +
            'create_full_put_path daemon dav_access dav_methods debug_connection ' +
            'debug_points default_type deny directio directio_alignment echo echo_after_body ' +
            'echo_before_body echo_blocking_sleep echo_duplicate echo_end echo_exec ' +
            'echo_flush echo_foreach_split echo_location echo_location_async ' +
            'echo_read_request_body echo_request_body echo_reset_timer echo_sleep ' +
            'echo_subrequest echo_subrequest_async empty_gif env error_log error_page events ' +
            'expires fastcgi_bind fastcgi_buffer_size fastcgi_buffers ' +
            'fastcgi_busy_buffers_size fastcgi_cache fastcgi_cache_key fastcgi_cache_methods ' +
            'fastcgi_cache_min_uses fastcgi_cache_path fastcgi_cache_use_stale ' +
            'fastcgi_cache_valid fastcgi_catch_stderr fastcgi_connect_timeout ' +
            'fastcgi_hide_header fastcgi_ignore_client_abort fastcgi_ignore_headers ' +
            'fastcgi_index fastcgi_intercept_errors fastcgi_max_temp_file_size ' +
            'fastcgi_next_upstream fastcgi_param fastcgi_pass fastcgi_pass_header ' +
            'fastcgi_pass_request_body fastcgi_pass_request_headers fastcgi_read_timeout ' +
            'fastcgi_send_lowat fastcgi_send_timeout fastcgi_split_path_info fastcgi_store ' +
            'fastcgi_store_access fastcgi_temp_file_write_size fastcgi_temp_path ' +
            'fastcgi_upstream_fail_timeout fastcgi_upstream_max_fails flv geo geoip_city ' +
            'geoip_country gzip gzip_buffers gzip_comp_level gzip_disable gzip_hash ' +
            'gzip_http_version gzip_min_length gzip_no_buffer gzip_proxied gzip_static ' +
            'gzip_types gzip_vary gzip_window http if if_modified_since ' +
            'ignore_invalid_headers image_filter image_filter_buffer ' +
            'image_filter_jpeg_quality image_filter_transparency include index internal ' +
            'ip_hash js js_load js_require js_utf8 keepalive_requests keepalive_timeout ' +
            'kqueue_changes kqueue_events large_client_header_buffers limit_conn ' +
            'limit_conn_log_level limit_except limit_rate limit_rate_after limit_req ' +
            'limit_req_log_level limit_req_zone limit_zone lingering_time lingering_timeout ' +
            'listen location lock_file log_format log_not_found log_subrequest map ' +
            'map_hash_bucket_size map_hash_max_size master_process memcached_bind ' +
            'memcached_buffer_size memcached_connect_timeout memcached_next_upstream ' +
            'memcached_pass memcached_read_timeout memcached_send_timeout ' +
            'memcached_upstream_fail_timeout memcached_upstream_max_fails merge_slashes ' +
            'min_delete_depth modern_browser modern_browser_value more_clear_headers ' +
            'more_clear_input_headers more_set_headers more_set_input_headers msie_padding ' +
            'msie_refresh multi_accept open_file_cache open_file_cache_errors ' +
            'open_file_cache_events open_file_cache_min_uses open_file_cache_retest ' +
            'open_file_cache_valid open_log_file_cache optimize_server_names output_buffers ' +
            'override_charset perl perl_modules perl_require perl_set pid port_in_redirect ' +
            'post_action postpone_gzipping postpone_output proxy_bind proxy_buffer_size ' +
            'proxy_buffering proxy_buffers proxy_busy_buffers_size proxy_cache ' +
            'proxy_cache_key proxy_cache_methods proxy_cache_min_uses proxy_cache_path ' +
            'proxy_cache_use_stale proxy_cache_valid proxy_connect_timeout ' +
            'proxy_headers_hash_bucket_size proxy_headers_hash_max_size proxy_hide_header ' +
            'proxy_ignore_client_abort proxy_ignore_headers proxy_intercept_errors ' +
            'proxy_max_temp_file_size proxy_method proxy_next_upstream proxy_pass ' +
            'proxy_pass_header proxy_pass_request_body proxy_pass_request_headers ' +
            'proxy_read_timeout proxy_redirect proxy_send_lowat proxy_send_timeout ' +
            'proxy_set_body proxy_set_header proxy_store proxy_store_access ' +
            'proxy_temp_file_write_size proxy_temp_path proxy_upstream_fail_timeout ' +
            'proxy_upstream_max_fails push_authorized_channels_only push_channel_group ' +
            'push_max_channel_id_length push_max_channel_subscribers ' +
            'push_max_message_buffer_length push_max_reserved_memory ' +
            'push_message_buffer_length push_message_timeout push_min_message_buffer_length ' +
            'push_min_message_recipients push_publisher push_store_messages push_subscriber ' +
            'push_subscriber_concurrency random_index read_ahead real_ip_header ' +
            'recursive_error_pages request_pool_size reset_timedout_connection resolver ' +
            'resolver_timeout return rewrite rewrite_log root satisfy satisfy_any ' +
            'send_lowat send_timeout sendfile sendfile_max_chunk server server_name ' +
            'server_name_in_redirect server_names_hash_bucket_size server_names_hash_max_size ' +
            'server_tokens set set_real_ip_from source_charset ssi ' +
            'ssi_ignore_recycled_buffers ssi_min_file_chunk ssi_silent_errors ssi_types ' +
            'ssi_value_length ssl ssl_certificate ssl_certificate_key ssl_ciphers ' +
            'ssl_client_certificate ssl_crl ssl_dhparam ssl_prefer_server_ciphers ' +
            'ssl_protocols ssl_session_cache ssl_session_timeout ssl_verify_client ' +
            'ssl_verify_depth sub_filter sub_filter_once sub_filter_types tcp_nodelay ' +
            'tcp_nopush timer_resolution try_files types types_hash_bucket_size ' +
            'types_hash_max_size underscores_in_headers uninitialized_variable_warn upstream ' +
            'use user userid userid_domain userid_expires userid_mark userid_name userid_p3p ' +
            'userid_path userid_service valid_referers variables_hash_bucket_size ' +
            'variables_hash_max_size worker_connections worker_cpu_affinity worker_priority ' +
            'worker_processes worker_rlimit_core worker_rlimit_nofile ' +
            'worker_rlimit_sigpending working_directory xml_entities xslt_stylesheet xslt_types',
          r: 0,
          c: [
            hljs.HCM,
            {
              b: '\\s', e: '[;{]', rB: true, rE: true,
              l: '[a-z/]+',
              k: {
                built_in:
                  'on off yes no true false none blocked debug info notice warn error crit ' +
                  'select permanent redirect kqueue rtsig epoll poll /dev/poll'
              },
              r: 0,
              c: [
                hljs.HCM,
                {
                  cN: 'string',
                  b: '"', e: '"',
                  c: [hljs.BE, VAR1, VAR2, VAR3],
                  r: 0
                },
                {
                  cN: 'string',
                  b: "'", e: "'",
                  c: [hljs.BE, VAR1, VAR2, VAR3],
                  r: 0
                },
                {
                  cN: 'string',
                  b: '([a-z]+):/', e: '[;\\s]', rE: true
                },
                {
                  cN: 'regexp',
                  b: "\\s\\^", e: "\\s|{|;", rE: true,
                  c: [hljs.BE, VAR1, VAR2, VAR3]
                },
                // regexp locations (~, ~*)
                {
                  cN: 'regexp',
                  b: "~\\*?\\s+", e: "\\s|{|;", rE: true,
                  c: [hljs.BE, VAR1, VAR2, VAR3]
                },
                // *.example.com
                {
                  cN: 'regexp',
                  b: "\\*(\\.[a-z\\-]+)+",
                  c: [hljs.BE, VAR1, VAR2, VAR3]
                },
                // sub.example.*
                {
                  cN: 'regexp',
                  b: "([a-z\\-]+\\.)+\\*",
                  c: [hljs.BE, VAR1, VAR2, VAR3]
                },
                // IP
                {
                  cN: 'number',
                  b: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b'
                },
                // units
                {
                  cN: 'number',
                  b: '\\s\\d+[kKmMgGdshdwy]*\\b',
                  r: 0
                },
                VAR1, VAR2, VAR3
              ]
            }
          ]
        }
      ]
    }
  }
}();
/*
Language: Diff
Description: Unified and context diff
Author: Vasily Polovnyov <vast@whiteants.net>
*/

hljs.LANGUAGES.diff = {
  cI: true,
  dM: {
    c: [
      {
        cN: 'chunk',
        b: '^\\@\\@ +\\-\\d+,\\d+ +\\+\\d+,\\d+ +\\@\\@$',
        r: 10
      },
      {
        cN: 'chunk',
        b: '^\\*\\*\\* +\\d+,\\d+ +\\*\\*\\*\\*$',
        r: 10
      },
      {
        cN: 'chunk',
        b: '^\\-\\-\\- +\\d+,\\d+ +\\-\\-\\-\\-$',
        r: 10
      },
      {
        cN: 'header',
        b: 'Index: ', e: '$'
      },
      {
        cN: 'header',
        b: '=====', e: '=====$'
      },
      {
        cN: 'header',
        b: '^\\-\\-\\-', e: '$'
      },
      {
        cN: 'header',
        b: '^\\*{3} ', e: '$'
      },
      {
        cN: 'header',
        b: '^\\+\\+\\+', e: '$'
      },
      {
        cN: 'header',
        b: '\\*{5}', e: '\\*{5}$'
      },
      {
        cN: 'addition',
        b: '^\\+', e: '$'
      },
      {
        cN: 'deletion',
        b: '^\\-', e: '$'
      },
      {
        cN: 'change',
        b: '^\\!', e: '$'
      }
    ]
  }
};
/*
Language: DOS .bat
Author: Alexander Makarov (http://rmcreative.ru/)
*/

hljs.LANGUAGES.dos = {
  cI: true,
  dM: {
    k: {
      flow: 'if else goto for in do call exit not exist errorlevel defined equ neq lss leq gtr geq',
      keyword: 'shift cd dir echo setlocal endlocal set pause copy',
      stream: 'prn nul lpt3 lpt2 lpt1 con com4 com3 com2 com1 aux',
      winutils: 'ping net ipconfig taskkill xcopy ren del'
    },
    c: [
      {
        cN: 'envvar', b: '%%[^ ]'
      },
      {
        cN: 'envvar', b: '%[^ ]+?%'
      },
      {
        cN: 'envvar', b: '![^ ]+?!'
      },
      {
        cN: 'number', b: '\\b\\d+',
        r: 0
      },
      {
        cN: 'comment',
        b: '@?rem', e: '$'
      }
    ]
  }
};
/*
Language: Bash
Author: vah <vahtenberg@gmail.com>
*/

hljs.LANGUAGES.bash = function(){
  var BASH_LITERAL = 'true false';
  var VAR1 = {
    cN: 'variable',
    b: '\\$([a-zA-Z0-9_]+)\\b'
  };
  var VAR2 = {
    cN: 'variable',
    b: '\\$\\{(([^}])|(\\\\}))+\\}',
    c: [hljs.CNM]
  };
  var QUOTE_STRING = {
    cN: 'string',
    b: '"', e: '"',
    i: '\\n',
    c: [hljs.BE, VAR1, VAR2],
    r: 0
  };
  var APOS_STRING = {
    cN: 'string',
    b: '\'', e: '\'',
    c: [{b: '\'\''}],
    r: 0
  };
  var TEST_CONDITION = {
    cN: 'test_condition',
    b: '', e: '',
    c: [QUOTE_STRING, APOS_STRING, VAR1, VAR2, hljs.CNM],
    k: {
      literal: BASH_LITERAL
    },
    r: 0
  };

  return {
    dM: {
      k: {
        keyword: 'if then else fi for break continue while in do done echo exit return set declare',
        literal: BASH_LITERAL
      },
      c: [
        {
          cN: 'shebang',
          b: '(#!\\/bin\\/bash)|(#!\\/bin\\/sh)',
          r: 10
        },
        VAR1,
        VAR2,
        hljs.HCM,
        hljs.CNM,
        QUOTE_STRING,
        APOS_STRING,
        hljs.inherit(TEST_CONDITION, {b: '\\[ ', e: ' \\]', r: 0}),
        hljs.inherit(TEST_CONDITION, {b: '\\[\\[ ', e: ' \\]\\]'})
      ]
    }
  };
}();
/*
Language: CMake
Description: CMake is an open-source cross-platform system for build automation.
Author: Igor Kalnitsky <igor.kalnitsky@gmail.com>
Website: http://kalnitsky.org.ua/
*/

hljs.LANGUAGES.cmake = {
  cI: true,
  dM: {
    k: 'add_custom_command add_custom_target add_definitions add_dependencies ' +
      'add_executable add_library add_subdirectory add_test aux_source_directory ' +
      'break build_command cmake_minimum_required cmake_policy configure_file ' +
      'create_test_sourcelist define_property else elseif enable_language enable_testing ' +
      'endforeach endfunction endif endmacro endwhile execute_process export find_file ' +
      'find_library find_package find_path find_program fltk_wrap_ui foreach function ' +
      'get_cmake_property get_directory_property get_filename_component get_property ' +
      'get_source_file_property get_target_property get_test_property if include ' +
      'include_directories include_external_msproject include_regular_expression install ' +
      'link_directories load_cache load_command macro mark_as_advanced message option ' +
      'output_required_files project qt_wrap_cpp qt_wrap_ui remove_definitions return ' +
      'separate_arguments set set_directory_properties set_property ' +
      'set_source_files_properties set_target_properties set_tests_properties site_name ' +
      'source_group string target_link_libraries try_compile try_run unset variable_watch ' +
      'while build_name exec_program export_library_dependencies install_files ' +
      'install_programs install_targets link_libraries make_directory remove subdir_depends ' +
      'subdirs use_mangled_mesa utility_source variable_requires write_file',
    c: [
      {
        cN: 'envvar',
        b: '\\${', e: '}'
      },
      hljs.HCM,
      hljs.QSM,
      hljs.NM
    ]
  }
};
/*
Language: Axapta
Author: Dmitri Roudakov <dmitri@roudakov.ru>
*/

hljs.LANGUAGES.axapta  = {
  dM: {
    k: 'false int abstract private char interface boolean static null if for true ' +
      'while long throw finally protected extends final implements return void enum else ' +
      'break new catch byte super class case short default double public try this switch ' +
      'continue reverse firstfast firstonly forupdate nofetch sum avg minof maxof count ' +
      'order group by asc desc index hint like dispaly edit client server ttsbegin ' +
      'ttscommit str real date container anytype common div mod',
    c: [
      hljs.CLCM,
      hljs.CBLCLM,
      hljs.ASM,
      hljs.QSM,
      hljs.CNM,
      {
        cN: 'preprocessor',
        b: '#', e: '$'
      },
      {
        cN: 'class',
        bWK: true, e: '{',
        i: ':',
        k: 'class interface',
        c: [
          {
            cN: 'inheritance',
            bWK: true,
            k: 'extends implements',
            r: 10
          },
          {
            cN: 'title',
            b: hljs.UIR
          }
        ]
      }
    ]
  }
};
/*
Language: 1C
Author: Yuri Ivanov <ivanov@supersoft.ru>
Contributors: Sergey Baranov <segyrn@yandex.ru>
*/

hljs.LANGUAGES['1c'] = function(){
  var IDENT_RE_RU = '[a-zA-Zа-яА-Я][a-zA-Z0-9_а-яА-Я]*';
  var OneS_KEYWORDS = 'возврат дата для если и или иначе иначеесли исключение конецесли ' +
    'конецпопытки конецпроцедуры конецфункции конеццикла константа не перейти перем ' +
    'перечисление по пока попытка прервать продолжить процедура строка тогда фс функция цикл ' +
    'число экспорт';
  var OneS_BUILT_IN = 'ansitooem oemtoansi ввестивидсубконто ввестидату ввестизначение ' +
    'ввестиперечисление ввестипериод ввестиплансчетов ввестистроку ввестичисло вопрос ' +
    'восстановитьзначение врег выбранныйплансчетов вызватьисключение датагод датамесяц ' +
    'датачисло добавитьмесяц завершитьработусистемы заголовоксистемы записьжурналарегистрации ' +
    'запуститьприложение зафиксироватьтранзакцию значениевстроку значениевстрокувнутр ' +
    'значениевфайл значениеизстроки значениеизстрокивнутр значениеизфайла имякомпьютера ' +
    'имяпользователя каталогвременныхфайлов каталогиб каталогпользователя каталогпрограммы ' +
    'кодсимв командасистемы конгода конецпериодаби конецрассчитанногопериодаби ' +
    'конецстандартногоинтервала конквартала конмесяца коннедели лев лог лог10 макс ' +
    'максимальноеколичествосубконто мин монопольныйрежим названиеинтерфейса названиенабораправ ' +
    'назначитьвид назначитьсчет найти найтипомеченныенаудаление найтиссылки началопериодаби ' +
    'началостандартногоинтервала начатьтранзакцию начгода начквартала начмесяца начнедели ' +
    'номерднягода номерднянедели номернеделигода нрег обработкаожидания окр описаниеошибки ' +
    'основнойжурналрасчетов основнойплансчетов основнойязык открытьформу открытьформумодально ' +
    'отменитьтранзакцию очиститьокносообщений периодстр полноеимяпользователя получитьвремята ' +
    'получитьдатута получитьдокументта получитьзначенияотбора получитьпозициюта ' +
    'получитьпустоезначение получитьта прав праводоступа предупреждение префиксавтонумерации ' +
    'пустаястрока пустоезначение рабочаядаттьпустоезначение рабочаядата разделительстраниц ' +
    'разделительстрок разм разобратьпозициюдокумента рассчитатьрегистрына ' +
    'рассчитатьрегистрыпо сигнал симв символтабуляции создатьобъект сокрл сокрлп сокрп ' +
    'сообщить состояние сохранитьзначение сред статусвозврата стрдлина стрзаменить ' +
    'стрколичествострок стрполучитьстроку  стрчисловхождений сформироватьпозициюдокумента ' +
    'счетпокоду текущаядата текущеевремя типзначения типзначениястр удалитьобъекты ' +
    'установитьтана установитьтапо фиксшаблон формат цел шаблон';
  var DQUOTE =  {cN: 'dquote',  b: '""'};
  var STR_START = {
      cN: 'string',
      b: '"', e: '"|$',
      c: [DQUOTE],
      r: 0
    };
  var STR_CONT = {
    cN: 'string',
    b: '\\|', e: '"|$',
    c: [DQUOTE]
  };

  return {
    cI: true,
    dM: {
      l: IDENT_RE_RU,
      k: {keyword: OneS_KEYWORDS, built_in: OneS_BUILT_IN},
      c: [
        hljs.CLCM,
        hljs.NM,
        STR_START, STR_CONT,
        {
          cN: 'function',
          b: '(процедура|функция)', e: '$',
          l: IDENT_RE_RU,
          k: 'процедура функция',
          c: [
            {cN: 'title', b: IDENT_RE_RU},
            {
              cN: 'tail',
              eW: true,
              c: [
                {
                  cN: 'params',
                  b: '\\(', e: '\\)',
                  l: IDENT_RE_RU,
                  k: 'знач',
                  c: [STR_START, STR_CONT]
                },
                {
                  cN: 'export',
                  b: 'экспорт', eW: true,
                  l: IDENT_RE_RU,
                  k: 'экспорт',
                  c: [hljs.CLCM]
                }
              ]
            },
            hljs.CLCM
          ]
        },
        {cN: 'preprocessor', b: '#', e: '$'},
        {cN: 'date', b: '\'\\d{2}\\.\\d{2}\\.(\\d{2}|\\d{4})\''}
      ]
    }
  };
}();
/*
Language: AVR Assembler
Author: Vladimir Ermakov <vooon341@gmail.com>
*/

hljs.LANGUAGES.avrasm =
{
  cI: true,
  dM: {
    k: {
      keyword:
        /* mnemonic */
        'adc add adiw and andi asr bclr bld brbc brbs brcc brcs break breq brge brhc brhs ' +
        'brid brie brlo brlt brmi brne brpl brsh brtc brts brvc brvs bset bst call cbi cbr ' +
        'clc clh cli cln clr cls clt clv clz com cp cpc cpi cpse dec eicall eijmp elpm eor ' +
        'fmul fmuls fmulsu icall ijmp in inc jmp ld ldd ldi lds lpm lsl lsr mov movw mul ' +
        'muls mulsu neg nop or ori out pop push rcall ret reti rjmp rol ror sbc sbr sbrc sbrs ' +
        'sec seh sbi sbci sbic sbis sbiw sei sen ser ses set sev sez sleep spm st std sts sub ' +
        'subi swap tst wdr',
      built_in:
        /* general purpose registers */
        'r0 r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11 r12 r13 r14 r15 r16 r17 r18 r19 r20 r21 r22 ' +
        'r23 r24 r25 r26 r27 r28 r29 r30 r31 x|0 xh xl y|0 yh yl z|0 zh zl ' +
        /* IO Registers (ATMega128) */
        'ucsr1c udr1 ucsr1a ucsr1b ubrr1l ubrr1h ucsr0c ubrr0h tccr3c tccr3a tccr3b tcnt3h ' +
        'tcnt3l ocr3ah ocr3al ocr3bh ocr3bl ocr3ch ocr3cl icr3h icr3l etimsk etifr tccr1c ' +
        'ocr1ch ocr1cl twcr twdr twar twsr twbr osccal xmcra xmcrb eicra spmcsr spmcr portg ' +
        'ddrg ping portf ddrf sreg sph spl xdiv rampz eicrb eimsk gimsk gicr eifr gifr timsk ' +
        'tifr mcucr mcucsr tccr0 tcnt0 ocr0 assr tccr1a tccr1b tcnt1h tcnt1l ocr1ah ocr1al ' +
        'ocr1bh ocr1bl icr1h icr1l tccr2 tcnt2 ocr2 ocdr wdtcr sfior eearh eearl eedr eecr ' +
        'porta ddra pina portb ddrb pinb portc ddrc pinc portd ddrd pind spdr spsr spcr udr0 ' +
        'ucsr0a ucsr0b ubrr0l acsr admux adcsr adch adcl porte ddre pine pinf'
    },
    c: [
      hljs.CBLCLM,
      {cN: 'comment', b: ';',  e: '$'},
      hljs.CNM, // 0x..., decimal, float
      hljs.BNM, // 0b...
      {
        cN: 'number',
        b: '\\b(\\$[a-zA-Z0-9]+|0o[0-7]+)' // $..., 0o...
      },
      hljs.QSM,
      {
        cN: 'string',
        b: '\'', e: '[^\\\\]\'',
        i: '[^\\\\][^\']'
      },
      {cN: 'label',  b: '^[A-Za-z0-9_.$]+:'},
      {cN: 'preprocessor', b: '#', e: '$'},
      {  // директивы «.include» «.macro» и т.д.
        cN: 'preprocessor',
        b: '\\.[a-zA-Z]+'
      },
      {  // подстановка в «.macro»
        cN: 'localvars',
        b: '@[0-9]+'
      }
    ]
  }
};

/*
Language: VHDL
Author: Igor Kalnitsky <igor@kalnitsky.org>
Contributors: Daniel C.K. Kho <daniel.kho@gmail.com>
Description: VHDL is a hardware description language used in electronic design automation to describe digital and mixed-signal systems.
*/

hljs.LANGUAGES.vhdl = function() {
  return {
    cI: true,
    dM: {
      k: {
        keyword:
          'abs access after alias all and architecture array assert attribute b block ' +
          'body buffer bus case component configuration constant context cover disconnect ' +
          'downto default else elsif e entity exit fairness file for force function generate ' +
          'generic group guarded if impure in inertial inout is label library linkage literal ' +
          'loop map mod nand new next nor not null of on open or others out package port ' +
          'postponed procedure process property protected pure range record register reject ' +
          'release rem report restrict restrict_guarantee return rol ror select sequence ' +
          'severity shared signal sla sll sra srl strong subtype then to transport type ' +
          'unaffected units until use variable vmode vprop vunit wait when while with xnor xor',
        typename:
          'boolean bit character severity_level integer time delay_length natural positive ' +
          'string bit_vector file_open_kind file_open_status std_ulogic std_ulogic_vector ' +
          'std_logic std_logic_vector unsigned signed boolean_vector integer_vector ' +
          'real_vector time_vector'
      },
      i: '{',
      c: [
        hljs.CBLCLM,        // VHDL-2008 block commenting.
        {
          cN: 'comment',
          b: '--', e: '$'
        },
        hljs.QSM,
        hljs.CNM,
        {
          cN: 'literal',
          b: '\'(U|X|0|1|Z|W|L|H|-)\'',
          c: [hljs.BE]
        },
        {
          cN: 'attribute',
          b: '\'[A-Za-z](_?[A-Za-z0-9])*',
          c: [hljs.BE]
        }
      ]
    } // dM
  } // return;
}();
/*
Language: Parser3
Requires: xml.js
Author: Oleg Volchkov <oleg@volchkov.net>
*/

hljs.LANGUAGES.parser3 = {
  dM: {
    sL: 'xml',
    c: [
      {
        cN: 'comment',
        b: '^#', e: '$'
      },
      {
        cN: 'comment',
        b: '\\^rem{', e: '}',
        r: 10,
        c: [
          {
            b: '{', e: '}',
            c: ['self']
          }
        ]
      },
      {
        cN: 'preprocessor',
        b: '^@(?:BASE|USE|CLASS|OPTIONS)$',
        r: 10
      },
      {
        cN: 'title',
        b: '@[\\w\\-]+\\[[\\w^;\\-]*\\](?:\\[[\\w^;\\-]*\\])?(?:.*)$'
      },
      {
        cN: 'variable',
        b: '\\$\\{?[\\w\\-\\.\\:]+\\}?'
      },
      {
        cN: 'keyword',
        b: '\\^[\\w\\-\\.\\:]+'
      },
      {
        cN: 'number',
        b: '\\^#[0-9a-fA-F]+'
      },
      hljs.CNM
    ]
  }
};
/*
Language: TeX
Author: Vladimir Moskva <vladmos@gmail.com>
Website: http://fulc.ru/
*/

hljs.LANGUAGES.tex = function() {
  var COMMAND1 = {
    cN: 'command',
    b: '\\\\[a-zA-Zа-яА-я]+[\\*]?',
    r: 10
  };
  var COMMAND2 = {
    cN: 'command',
    b: '\\\\[^a-zA-Zа-яА-я0-9]',
    r: 0
  };
  var SPECIAL = {
    cN: 'special',
    b: '[{}\\[\\]\\&#~]',
    r: 0
  };

  return {
    dM: {
      c: [
        { // parameter
          b: '\\\\[a-zA-Zа-яА-я]+[\\*]? *= *-?\\d*\\.?\\d+(pt|pc|mm|cm|in|dd|cc|ex|em)?',
          rB: true,
          c: [
            COMMAND1, COMMAND2,
            {
              cN: 'number',
              b: ' *=', e: '-?\\d*\\.?\\d+(pt|pc|mm|cm|in|dd|cc|ex|em)?',
              eB: true
            }
          ],
          r: 10
        },
        COMMAND1, COMMAND2,
        SPECIAL,
        {
          cN: 'formula',
          b: '\\$\\$', e: '\\$\\$',
          c: [COMMAND1, COMMAND2, SPECIAL],
          r: 0
        },
        {
          cN: 'formula',
          b: '\\$', e: '\\$',
          c: [COMMAND1, COMMAND2, SPECIAL],
          r: 0
        },
        {
          cN: 'comment',
          b: '%', e: '$',
          r: 0
        }
      ]
    }
  };
}();
/*
Language: Haskell
Author: Jeremy Hull <sourdrums@gmail.com>
*/

hljs.LANGUAGES.haskell = function(){
  var LABEL = {
    cN: 'label',
    b: '\\b[A-Z][\\w\']*',
    r: 0
  };
  var CONTAINER = {
    cN: 'container',
    b: '\\(', e: '\\)',
    c: [
      {cN: 'label', b: '\\b[A-Z][\\w\\(\\)\\.\']*'},
      {cN: 'title', b: '[_a-z][\\w\']*'}
    ]
  };

  return {
    dM: {
      k:
        'let in if then else case of where do module import hiding qualified type data ' +
        'newtype deriving class instance null not as',
      c: [
        {
          cN: 'comment',
          b: '--', e: '$'
        },
        {
          cN: 'comment',
          b: '{-', e: '-}'
        },
        {
          cN: 'string',
          b: '\\s+\'', e: '\'',
          c: [hljs.BE],
          r: 0
        },
        hljs.QSM,
        {
          cN: 'import',
          b: '\\bimport', e: '$',
          k: 'import qualified as hiding',
          c: [CONTAINER]
        },
        {
          cN: 'module',
          b: '\\bmodule', e: 'where',
          k: 'module where',
          c: [CONTAINER]
        },
        {
          cN: 'class',
          b: '\\b(class|instance|data|(new)?type)', e: '(where|$)',
          k: 'class where instance data type newtype deriving',
          c: [LABEL]
        },
        hljs.CNM,
        {
          cN: 'shebang',
          b: '#!\\/usr\\/bin\\/env\ runhaskell', e: '$'
        },
        LABEL,
        {
          cN: 'title', b: '^[_a-z][\\w\']*'
        }
      ]
    }
  };
}();
/*
Language: Erlang
Description: Erlang is a general-purpose functional language, with strict evaluation, single assignment, and dynamic typing.
Author: Nikolay Zakharov <nikolay.desh@gmail.com>, Dmitry Kovega <arhibot@gmail.com>
*/

hljs.LANGUAGES.erlang = function(){
  var BASIC_ATOM_RE = '[a-z\'][a-zA-Z0-9_\']*';
  var FUNCTION_NAME_RE = '(' + BASIC_ATOM_RE + ':' + BASIC_ATOM_RE + '|' + BASIC_ATOM_RE + ')';
  var ERLANG_RESERVED = {
    keyword:
      'after and andalso|10 band b bnot bor bsl bzr bxor case catch cond div e fun let ' +
      'not of orelse|10 query receive rem try when xor',
    literal:
      'false true'
  };

  var COMMENT = {
    cN: 'comment',
    b: '%', e: '$',
    r: 0
  };
  var NUMBER = {
    cN: 'number',
    b: '\\b(\\d+#[a-fA-F0-9]+|\\d+(\\.\\d+)?([eE][-+]?\\d+)?)',
    r: 0
  };
  var NAMED_FUN = {
    b: 'fun\\s+' + BASIC_ATOM_RE + '/\\d+'
  };
  var FUNCTION_CALL = {
    b: FUNCTION_NAME_RE + '\\(', e: '\\)',
    rB: true,
    r: 0,
    c: [
      {
        cN: 'function_name', b: FUNCTION_NAME_RE,
        r: 0
      },
      {
        b: '\\(', e: '\\)', eW: true,
        rE: true,
        r: 0
        // "contains" defined later
      }
    ]
  };
  var TUPLE = {
    cN: 'tuple',
    b: '{', e: '}',
    r: 0
    // "contains" defined later
  };
  var VAR1 = {
    cN: 'variable',
    b: '\\b_([A-Z][A-Za-z0-9_]*)?',
    r: 0
  };
  var VAR2 = {
    cN: 'variable',
    b: '[A-Z][a-zA-Z0-9_]*',
    r: 0
  };
  var RECORD_ACCESS = {
    b: '#', e: '}',
    i: '.',
    r: 0,
    rB: true,
    c: [
      {
        cN: 'record_name',
        b: '#' + hljs.UIR,
        r: 0
      },
      {
        b: '{', eW: true,
        r: 0
        // "contains" defined later
      }
    ]
  };

  var BLOCK_STATEMENTS = {
    k: ERLANG_RESERVED,
    b: '(fun|receive|if|try|case)', e: 'end'
  };
  BLOCK_STATEMENTS.c = [
    COMMENT,
    NAMED_FUN,
    hljs.inherit(hljs.ASM, {cN: ''}),
    BLOCK_STATEMENTS,
    FUNCTION_CALL,
    hljs.QSM,
    NUMBER,
    TUPLE,
    VAR1, VAR2,
    RECORD_ACCESS
  ];

  var BASIC_MODES = [
    COMMENT,
    NAMED_FUN,
    BLOCK_STATEMENTS,
    FUNCTION_CALL,
    hljs.QSM,
    NUMBER,
    TUPLE,
    VAR1, VAR2,
    RECORD_ACCESS
  ];
  FUNCTION_CALL.c[1].c = BASIC_MODES;
  TUPLE.c = BASIC_MODES;
  RECORD_ACCESS.c[1].c = BASIC_MODES;

  var PARAMS = {
    cN: 'params',
    b: '\\(', e: '\\)',
    eW: true,
    c: BASIC_MODES
  };
  return {
    dM: {
      k: ERLANG_RESERVED,
      i: '(</|\\*=|\\+=|-=|/=|/\\*|\\*/|\\(\\*|\\*\\))',
      c: [
        {
          cN: 'function',
          b: '^' + BASIC_ATOM_RE + '\\(', e: ';|\\.',
          rB: true,
          c: [
            PARAMS,
            {
              cN: 'title', b: BASIC_ATOM_RE
            },
            {
              k: ERLANG_RESERVED,
              b: '->', eW: true,
              c: BASIC_MODES
            }
          ]
        },
        COMMENT,
        {
          cN: 'pp',
          b: '^-', e: '\\.',
          r: 0,
          eE: true,
          rB: true,
          l: '-' + hljs.IR,
          k:
            '-module -record -undef -export -ifdef -ifndef -author -copyright -doc -vsn ' +
            '-import -include -include_lib -compile -define -else -endif -file -behaviour ' +
            '-behavior',
          c: [PARAMS]
        },
        NUMBER,
        hljs.QSM,
        RECORD_ACCESS,
        VAR1, VAR2,
        TUPLE
      ]
    }
  };
}();
/*
 Language: Erlang REPL
 Author: Sergey Ignatov <sergey@ignatov.spb.su>
 */

hljs.LANGUAGES.erlang_repl = {
  dM: {
    k: {
      special_functions:
        'spawn spawn_link self',
      reserved:
        'after and andalso|10 band b bnot bor bsl bsr bxor case catch cond div e fun if ' +
        'let not of or orelse|10 query receive rem try when xor'
    },
    c: [
      {
        cN: 'input_number', b: '^[0-9]+> ',
        r: 10
      },
      {
        cN: 'comment',
        b: '%', e: '$'
      },
      {
        cN: 'number',
        b: '\\b(\\d+#[a-fA-F0-9]+|\\d+(\\.\\d+)?([eE][-+]?\\d+)?)',
        r: 0
      },
      hljs.ASM,
      hljs.QSM,
      {
        cN: 'constant', b: '\\?(::)?([A-Z]\\w*(::)?)+'
      },
      {
        cN: 'arrow', b: '->'
      },
      {
        cN: 'ok', b: 'ok'
      },
      {
        cN: 'exclamation_mark', b: '!'
      },
      {
        cN: 'function_or_atom',
        b: '(\\b[a-z\'][a-zA-Z0-9_\']*:[a-z\'][a-zA-Z0-9_\']*)|(\\b[a-z\'][a-zA-Z0-9_\']*)',
        r: 0
      },
      {
        cN: 'variable',
        b: '[A-Z][a-zA-Z0-9_\']*',
        r: 0
      }
    ]
  }
};
/*
Language: Rust
Author: Andrey Vlasovskikh <andrey.vlasovskikh@gmail.com>
*/

hljs.LANGUAGES.rust = function() {
  var TITLE = {
    cN: 'title',
    b: hljs.UIR
  };
  var QUOTE_STRING = {
    cN: 'string',
    b: '"', e: '"',
    c: [hljs.BE],
    r: 0
  };
  var NUMBER = {
    cN: 'number',
    b: '\\b(0[xb][A-Za-z0-9_]+|[0-9_]+(\\.[0-9_]+)?([uif](8|16|32|64)?)?)',
    r: 0
  };
  var KEYWORDS =
    'alt any as assert be bind block bool break char check claim const cont dir do else enum ' +
    'export f32 f64 fail false float fn for i16 i32 i64 i8 if iface impl import in int let ' +
    'log mod mutable native note of prove pure resource ret self str syntax true type u16 u32 ' +
    'u64 u8 uint unchecked unsafe use vec while';
  return {
    dM: {
      k: KEYWORDS,
      i: '</',
      c: [
        hljs.CLCM,
        hljs.CBLCLM,
        QUOTE_STRING,
        hljs.ASM,
        NUMBER,
        {
          cN: 'function',
          bWK: true, e: '(\\(|<)',
          k: 'fn',
          c: [TITLE]
        },
        {
          cN: 'preprocessor',
          b: '#\\[', e: '\\]'
        },
        {
          bWK: true, e: '(=|<)',
          k: 'type',
          c: [TITLE],
          i: '\\S'
        },
        {
          bWK: true, e: '({|<)',
          k: 'iface enum',
          c: [TITLE],
          i: '\\S'
        }
      ]
    }
  };
}();
/*
Language: Matlab
Author: Denis Bardadym <bardadymchik@gmail.com>
*/

hljs.LANGUAGES.matlab = {
  dM: {
    k: {
      keyword:
        'break case catch classdef continue else elseif e enumerated events for function ' +
        'global if methods otherwise parfor persistent properties return spmd switch try while',
      built_in:
        'sin sind sinh asin asind asinh cos cosd cosh acos acosd acosh tan tand tanh atan ' +
        'atand atan2 atanh sec secd sech asec asecd asech csc cscd csch acsc acscd acsch cot ' +
        'cotd coth acot acotd acoth hypot exp expm1 log log1p log10 log2 pow2 realpow reallog ' +
        'realsqrt sqrt nthroot nextpow2 abs angle complex conj imag real unwrap isreal ' +
        'cplxpair fix floor ceil round mod rem sign airy besselj bessely besselh besseli ' +
        'besselk beta betainc betaln ellipj ellipke erf erfc erfcx erfinv expint gamma ' +
        'gammainc gammaln psi legendre cross dot factor isprime primes gcd lcm rat rats perms ' +
        'nchoosek factorial cart2sph cart2pol pol2cart sph2cart hsv2rgb rgb2hsv zeros ones ' +
        'eye repmat rand randn linspace logspace freqspace meshgrid accumarray size length ' +
        'ndims numel disp isempty isequal isequalwithequalnans cat reshape diag blkdiag tril ' +
        'triu fliplr flipud flipdim rot90 find sub2ind ind2sub bsxfun ndgrid permute ipermute ' +
        'shiftdim circshift squeeze isscalar isvector ans eps realmax realmin pi i inf nan ' +
        'isnan isinf isfinite j why compan gallery hadamard hankel hilb invhilb magic pascal ' +
        'rosser toeplitz vander wilkinson'
    },
    i: '(//|"|#|/\\*|\\s+/\\w+)',
    c: [
      {
        cN: 'function',
        bWK: true, e: '$',
        k: 'function',
        c: [
          {
              cN: 'title',
              b: hljs.UIR
          },
          {
              cN: 'params',
              b: '\\(', e: '\\)'
          },
          {
              cN: 'params',
              b: '\\[', e: '\\]'
          }
        ]
      },
      {
        cN: 'string',
        b: '\'', e: '\'',
        c: [hljs.BE, {b: '\'\''}],
        r: 0
      },
      {
        cN: 'comment',
        b: '\\%', e: '$'
      },
      hljs.CNM
    ]
  }
};
/*
Language: R
Author: Joe Cheng <joe@rstudio.org>
*/

hljs.LANGUAGES.r = (function() {
  var IR = '([a-zA-Z]|\\.[a-zA-Z.])[a-zA-Z0-9._]*';

  return {
    dM: {
      c: [
        hljs.HCM,
        {
          b: IR,
          l: IR,
          k: {
            keyword:
              'function if in break next repeat else for return switch while try tryCatch|10 ' +
              'stop warning require library attach detach source setMethod setGeneric ' +
              'setGroupGeneric setClass ...|10',
            literal:
              'NULL NA TRUE FALSE T F Inf NaN NA_integer_|10 NA_real_|10 NA_character_|10 ' +
              'NA_complex_|10'
          },
          r: 0
        },
        {
          // hex value
          cN: 'number',
          b: "0[xX][0-9a-fA-F]+[Li]?\\b",
          r: 0
        },
        {
          // explicit integer
          cN: 'number',
          b: "\\d+(?:[eE][+\\-]?\\d*)?L\\b",
          r: 0
        },
        {
          // number with trailing decimal
          cN: 'number',
          b: "\\d+\\.(?!\\d)(?:i\\b)?",
          r: 0
        },
        {
          // number
          cN: 'number',
          b: "\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d*)?i?\\b",
          r: 0
        },
        {
          // number with leading decimal
          cN: 'number',
          b: "\\.\\d+(?:[eE][+\\-]?\\d*)?i?\\b",
          r: 0
        },

        {
          // escaped identifier
          b: '`',
          e: '`',
          r: 0
        },

        {
          cN: 'string',
          b: '"',
          e: '"',
          c: [hljs.BE],
          r: 0
        },
        {
          cN: 'string',
          b: "'",
          e: "'",
          c: [hljs.BE],
          r: 0
        },
      ]
    }
  };
})();

// Generated by browserify
(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"escodegen.js"}
});

require.define("/escodegen.js",function(require,module,exports,__dirname,__filename,process,global){/*
  Copyright (C) 2012 Michael Ficarra <escodegen.copyright@michael.ficarra.me>
  Copyright (C) 2012 Robert Gust-Bardon <donate@robert.gust-bardon.org>
  Copyright (C) 2012 John Freeman <jfreeman08@gmail.com>
  Copyright (C) 2011-2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint bitwise:true */
/*global escodegen:true, exports:true, generateStatement:true, generateExpression:true, generateFunctionBody:true, process:true, require:true, define:true*/
(function () {
    'use strict';

    var Syntax,
        Precedence,
        BinaryPrecedence,
        Regex,
        VisitorKeys,
        VisitorOption,
        SourceNode,
        isArray,
        base,
        indent,
        json,
        renumber,
        hexadecimal,
        quotes,
        escapeless,
        newline,
        space,
        parentheses,
        semicolons,
        safeConcatenation,
        directive,
        extra,
        parse,
        sourceMap,
        traverse;

    traverse = require('estraverse').traverse;

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        PluckExpression: 'PluckExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression',

    };

    Precedence = {
        Sequence: 0,
        Assignment: 1,
        Conditional: 2,
        LogicalOR: 3,
        LogicalAND: 4,
        BitwiseOR: 5,
        BitwiseXOR: 6,
        BitwiseAND: 7,
        Equality: 8,
        Relational: 9,
        BitwiseSHIFT: 10,
        Additive: 11,
        Multiplicative: 12,
        Unary: 13,
        Postfix: 14,
        Call: 15,
        New: 16,
        Member: 17,
        Primary: 18
    };

    BinaryPrecedence = {
        '||': Precedence.LogicalOR,
        '&&': Precedence.LogicalAND,
        '|': Precedence.BitwiseOR,
        '^': Precedence.BitwiseXOR,
        '&': Precedence.BitwiseAND,
        '==': Precedence.Equality,
        '!=': Precedence.Equality,
        '===': Precedence.Equality,
        '!==': Precedence.Equality,
        'is': Precedence.Equality,
        'isnt': Precedence.Equality,
        '<': Precedence.Relational,
        '>': Precedence.Relational,
        '<=': Precedence.Relational,
        '>=': Precedence.Relational,
        'in': Precedence.Relational,
        'instanceof': Precedence.Relational,
        '<<': Precedence.BitwiseSHIFT,
        '>>': Precedence.BitwiseSHIFT,
        '>>>': Precedence.BitwiseSHIFT,
        '+': Precedence.Additive,
        '-': Precedence.Additive,
        '*': Precedence.Multiplicative,
        '%': Precedence.Multiplicative,
        '/': Precedence.Multiplicative
    };

    Regex = {
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };

    function getDefaultOptions() {
        // default options
        return {
            indent: null,
            base: null,
            parse: null,
            comment: false,
            format: {
                indent: {
                    style: '    ',
                    base: 0,
                    adjustMultilineComment: false
                },
                json: false,
                renumber: false,
                hexadecimal: false,
                quotes: 'single',
                escapeless: false,
                compact: false,
                parentheses: true,
                semicolons: true,
                safeConcatenation: false
            },
            moz: {
                starlessGenerator: false,
                parenthesizedComprehensionBlock: false
            },
            sourceMap: null,
            sourceMapRoot: null,
            sourceMapWithCode: false,
            directive: false,
            verbatim: null
        };
    }

    function stringToArray(str) {
        var length = str.length,
            result = [],
            i;
        for (i = 0; i < length; i += 1) {
            result[i] = str.charAt(i);
        }
        return result;
    }

    function stringRepeat(str, num) {
        var result = '';

        for (num |= 0; num > 0; num >>>= 1, str += str) {
            if (num & 1) {
                result += str;
            }
        }

        return result;
    }

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }

    // Fallback for the non SourceMap environment
    function SourceNodeMock(line, column, filename, chunk) {
        var result = [];

        function flatten(input) {
            var i, iz;
            if (isArray(input)) {
                for (i = 0, iz = input.length; i < iz; ++i) {
                    flatten(input[i]);
                }
            } else if (input instanceof SourceNodeMock) {
                result.push(input);
            } else if (typeof input === 'string' && input) {
                result.push(input);
            }
        }

        flatten(chunk);
        this.children = result;
    }

    SourceNodeMock.prototype.toString = function toString() {
        var res = '', i, iz, node;
        for (i = 0, iz = this.children.length; i < iz; ++i) {
            node = this.children[i];
            if (node instanceof SourceNodeMock) {
                res += node.toString();
            } else {
                res += node;
            }
        }
        return res;
    };

    SourceNodeMock.prototype.replaceRight = function replaceRight(pattern, replacement) {
        var last = this.children[this.children.length - 1];
        if (last instanceof SourceNodeMock) {
            last.replaceRight(pattern, replacement);
        } else if (typeof last === 'string') {
            this.children[this.children.length - 1] = last.replace(pattern, replacement);
        } else {
            this.children.push(''.replace(pattern, replacement));
        }
        return this;
    };

    SourceNodeMock.prototype.join = function join(sep) {
        var i, iz, result;
        result = [];
        iz = this.children.length;
        if (iz > 0) {
            for (i = 0, iz -= 1; i < iz; ++i) {
                result.push(this.children[i], sep);
            }
            result.push(this.children[iz]);
            this.children = result;
        }
        return this;
    };

    function hasLineTerminator(str) {
        return /[\r\n]/g.test(str);
    }

    function endsWithLineTerminator(str) {
        var ch = str.charAt(str.length - 1);
        return ch === '\r' || ch === '\n';
    }

    function shallowCopy(obj) {
        var ret = {}, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                ret[key] = obj[key];
            }
        }
        return ret;
    }

    function deepCopy(obj) {
        var ret = {}, key, val;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                val = obj[key];
                if (typeof val === 'object' && val !== null) {
                    ret[key] = deepCopy(val);
                } else {
                    ret[key] = val;
                }
            }
        }
        return ret;
    }

    function updateDeeply(target, override) {
        var key, val;

        function isHashObject(target) {
            return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
        }

        for (key in override) {
            if (override.hasOwnProperty(key)) {
                val = override[key];
                if (isHashObject(val)) {
                    if (isHashObject(target[key])) {
                        updateDeeply(target[key], val);
                    } else {
                        target[key] = updateDeeply({}, val);
                    }
                } else {
                    target[key] = val;
                }
            }
        }
        return target;
    }

    function generateNumber(value) {
        var result, point, temp, exponent, pos;

        if (value !== value) {
            throw new Error('Numeric literal whose value is NaN');
        }
        if (value < 0 || (value === 0 && 1 / value < 0)) {
            throw new Error('Numeric literal whose value is negative');
        }

        if (value === 1 / 0) {
            return json ? 'null' : renumber ? '1e400' : '1e+400';
        }

        result = '' + value;
        if (!renumber || result.length < 3) {
            return result;
        }

        point = result.indexOf('.');
        if (!json && result.charAt(0) === '0' && point === 1) {
            point = 0;
            result = result.slice(1);
        }
        temp = result;
        result = result.replace('e+', 'e');
        exponent = 0;
        if ((pos = temp.indexOf('e')) > 0) {
            exponent = +temp.slice(pos + 1);
            temp = temp.slice(0, pos);
        }
        if (point >= 0) {
            exponent -= temp.length - point - 1;
            temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
        }
        pos = 0;
        while (temp.charAt(temp.length + pos - 1) === '0') {
            pos -= 1;
        }
        if (pos !== 0) {
            exponent -= pos;
            temp = temp.slice(0, pos);
        }
        if (exponent !== 0) {
            temp += 'e' + exponent;
        }
        if ((temp.length < result.length ||
                    (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length)) &&
                +temp === value) {
            result = temp;
        }

        return result;
    }

    function escapeAllowedCharacter(ch, next) {
        var code = ch.charCodeAt(0), hex = code.toString(16), result = '\\';

        switch (ch) {
        case '\b':
            result += 'b';
            break;
        case '\f':
            result += 'f';
            break;
        case '\t':
            result += 't';
            break;
        default:
            if (json || code > 0xff) {
                result += 'u' + '0000'.slice(hex.length) + hex;
            } else if (ch === '\u0000' && '0123456789'.indexOf(next) < 0) {
                result += '0';
            } else if (ch === '\v') {
                result += 'v';
            } else {
                result += 'x' + '00'.slice(hex.length) + hex;
            }
            break;
        }

        return result;
    }

    function escapeDisallowedCharacter(ch) {
        var result = '\\';
        switch (ch) {
        case '\\':
            result += '\\';
            break;
        case '\n':
            result += 'n';
            break;
        case '\r':
            result += 'r';
            break;
        case '\u2028':
            result += 'u2028';
            break;
        case '\u2029':
            result += 'u2029';
            break;
        default:
            throw new Error('Incorrectly classified character');
        }

        return result;
    }

    function escapeDirective(str) {
        var i, iz, ch, single, buf, quote;

        buf = str;
        if (typeof buf[0] === 'undefined') {
            buf = stringToArray(buf);
        }

        quote = quotes === 'double' ? '"' : '\'';
        for (i = 0, iz = buf.length; i < iz; i += 1) {
            ch = buf[i];
            if (ch === '\'') {
                quote = '"';
                break;
            } else if (ch === '"') {
                quote = '\'';
                break;
            } else if (ch === '\\') {
                i += 1;
            }
        }

        return quote + str + quote;
    }

    function escapeString(str) {
        var result = '', i, len, ch, next, singleQuotes = 0, doubleQuotes = 0, single;

        if (typeof str[0] === 'undefined') {
            str = stringToArray(str);
        }

        for (i = 0, len = str.length; i < len; i += 1) {
            ch = str[i];
            if (ch === '\'') {
                singleQuotes += 1;
            } else if (ch === '"') {
                doubleQuotes += 1;
            } else if (ch === '/' && json) {
                result += '\\';
            } else if ('\\\n\r\u2028\u2029'.indexOf(ch) >= 0) {
                result += escapeDisallowedCharacter(ch);
                continue;
            } else if ((json && ch < ' ') || !(json || escapeless || (ch >= ' ' && ch <= '~'))) {
                result += escapeAllowedCharacter(ch, str[i + 1]);
                continue;
            }
            result += ch;
        }

        single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
        str = result;
        result = single ? '\'' : '"';

        if (typeof str[0] === 'undefined') {
            str = stringToArray(str);
        }

        for (i = 0, len = str.length; i < len; i += 1) {
            ch = str[i];
            if ((ch === '\'' && single) || (ch === '"' && !single)) {
                result += '\\';
            }
            result += ch;
        }

        return result + (single ? '\'' : '"');
    }

    function isWhiteSpace(ch) {
        return '\t\v\f \xa0'.indexOf(ch) >= 0 || (ch.charCodeAt(0) >= 0x1680 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch) >= 0);
    }

    function isLineTerminator(ch) {
        return '\n\r\u2028\u2029'.indexOf(ch) >= 0;
    }

    function isIdentifierPart(ch) {
        return (ch === '$') || (ch === '_') || (ch === '\\') ||
            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
            ((ch >= '0') && (ch <= '9')) ||
            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierPart.test(ch));
    }

    function toSourceNode(generated, node) {
        if (node == null) {
            if (generated instanceof SourceNode) {
                return generated;
            } else {
                node = {};
            }
        }
        if (node.loc == null) {
            return new SourceNode(null, null, sourceMap, generated);
        }
        return new SourceNode(node.loc.start.line, node.loc.start.column, (sourceMap === true ? node.loc.source || null : sourceMap), generated);
    }

    function join(left, right) {
        var leftSource = toSourceNode(left).toString(),
            rightSource = toSourceNode(right).toString(),
            leftChar = leftSource.charAt(leftSource.length - 1),
            rightChar = rightSource.charAt(0);

        if (((leftChar === '+' || leftChar === '-') && leftChar === rightChar) || (isIdentifierPart(leftChar) && isIdentifierPart(rightChar))) {
            return [left, ' ', right];
        } else if (isWhiteSpace(leftChar) || isLineTerminator(leftChar) || isWhiteSpace(rightChar) || isLineTerminator(rightChar)) {
            return [left, right];
        }
        return [left, space, right];
    }

    function addIndent(stmt) {
        return [base, stmt];
    }

    function withIndent(fn) {
        var previousBase, result;
        previousBase = base;
        base += indent;
        result = fn.call(this, base);
        base = previousBase;
        return result;
    }

    function calculateSpaces(str) {
        var i;
        for (i = str.length - 1; i >= 0; i -= 1) {
            if (isLineTerminator(str.charAt(i))) {
                break;
            }
        }
        return (str.length - 1) - i;
    }

    function adjustMultilineComment(value, specialBase) {
        var array, i, len, line, j, ch, spaces, previousBase;

        array = value.split(/\r\n|[\r\n]/);
        spaces = Number.MAX_VALUE;

        // first line doesn't have indentation
        for (i = 1, len = array.length; i < len; i += 1) {
            line = array[i];
            j = 0;
            while (j < line.length && isWhiteSpace(line[j])) {
                j += 1;
            }
            if (spaces > j) {
                spaces = j;
            }
        }

        if (typeof specialBase !== 'undefined') {
            // pattern like
            // {
            //   var t = 20;  /*
            //                 * this is comment
            //                 */
            // }
            previousBase = base;
            if (array[1][spaces] === '*') {
                specialBase += ' ';
            }
            base = specialBase;
        } else {
            if (spaces & 1) {
                // /*
                //  *
                //  */
                // If spaces are odd number, above pattern is considered.
                // We waste 1 space.
                spaces -= 1;
            }
            previousBase = base;
        }

        for (i = 1, len = array.length; i < len; i += 1) {
            array[i] = toSourceNode(addIndent(array[i].slice(spaces))).join('');
        }

        base = previousBase;

        return array.join('\n');
    }

    function generateComment(comment, specialBase) {
        if (comment.type === 'Line') {
            if (endsWithLineTerminator(comment.value)) {
                return '//' + comment.value;
            } else {
                // Always use LineTerminator
                return '//' + comment.value + '\n';
            }
        }
        if (extra.format.indent.adjustMultilineComment && /[\n\r]/.test(comment.value)) {
            return adjustMultilineComment('/*' + comment.value + '*/', specialBase);
        }
        return '/*' + comment.value + '*/';
    }

    function addCommentsToStatement(stmt, result) {
        var i, len, comment, save, node, tailingToStatement, specialBase, fragment;

        if (stmt.leadingComments && stmt.leadingComments.length > 0) {
            save = result;

            comment = stmt.leadingComments[0];
            result = [];
            if (safeConcatenation && stmt.type === Syntax.Program && stmt.body.length === 0) {
                result.push('\n');
            }
            result.push(generateComment(comment));
            if (!endsWithLineTerminator(toSourceNode(result).toString())) {
                result.push('\n');
            }

            for (i = 1, len = stmt.leadingComments.length; i < len; i += 1) {
                comment = stmt.leadingComments[i];
                fragment = [generateComment(comment)];
                if (!endsWithLineTerminator(toSourceNode(fragment).toString())) {
                    fragment.push('\n');
                }
                result.push(addIndent(fragment));
            }

            result.push(addIndent(save));
        }

        if (stmt.trailingComments) {
            tailingToStatement = !endsWithLineTerminator(toSourceNode(result).toString());
            specialBase = stringRepeat(' ', calculateSpaces(toSourceNode([base, result, indent]).toString()));
            for (i = 0, len = stmt.trailingComments.length; i < len; i += 1) {
                comment = stmt.trailingComments[i];
                if (tailingToStatement) {
                    // We assume target like following script
                    //
                    // var t = 20;  /**
                    //               * This is comment of t
                    //               */
                    if (i === 0) {
                        // first case
                        result = [result, indent];
                    } else {
                        result = [result, specialBase];
                    }
                    result.push(generateComment(comment, specialBase));
                } else {
                    result = [result, addIndent(generateComment(comment))];
                }
                if (i !== len - 1 && !endsWithLineTerminator(toSourceNode(result).toString())) {
                    result = [result, '\n'];
                }
            }
        }

        return result;
    }

    function parenthesize(text, current, should) {
        if (current < should) {
            return ['(', text, ')'];
        }
        return text;
    }

    function maybeBlock(stmt, semicolonOptional, functionBody) {
        var result, noLeadingComment;

        noLeadingComment = !extra.comment || !stmt.leadingComments;

        if (stmt.type === Syntax.BlockStatement && noLeadingComment) {
            return [space, generateStatement(stmt, { functionBody: functionBody })];
        }

        if (stmt.type === Syntax.EmptyStatement && noLeadingComment) {
            return ';';
        }

        withIndent(function () {
            result = [newline, addIndent(generateStatement(stmt, { semicolonOptional: semicolonOptional, functionBody: functionBody }))];
        });

        return result;
    }

    function maybeBlockSuffix(stmt, result) {
        var ends = endsWithLineTerminator(toSourceNode(result).toString());
        if (stmt.type === Syntax.BlockStatement && (!extra.comment || !stmt.leadingComments) && !ends) {
            return [result, space];
        }
        if (ends) {
            return [result, base];
        }
        return [result, newline, base];
    }

    function generateVerbatim(expr, option) {
        var i, result;
        result = expr[extra.verbatim].split(/\r\n|\n/);
        for (i = 1; i < result.length; i++) {
            result[i] = newline + base + result[i];
        }

        result = parenthesize(result, Precedence.Sequence, option.precedence);
        return toSourceNode(result, expr);
    }

    function generateFunctionBody(node) {
        var result, i, len, expr;
        result = ['('];
        for (i = 0, len = node.params.length; i < len; i += 1) {
            result.push(node.params[i].name);
            if (i + 1 < len) {
                result.push(',' + space);
            }
        }
        result.push(')');

        if (node.expression) {
            result.push(space);
            expr = generateExpression(node.body, {
                precedence: Precedence.Assignment,
                allowIn: true,
                allowCall: true
            });
            if (expr.toString().charAt(0) === '{') {
                expr = ['(', expr, ')'];
            }
            result.push(expr);
        } else {
            result.push(maybeBlock(node.body, false, true));
        }
        return result;
    }

    function generateExpression(expr, option) {
        var result, precedence, type, currentPrecedence, i, len, raw, fragment, multiline, leftChar, leftSource, rightChar, rightSource, allowIn, allowCall, allowUnparenthesizedNew, property, key, value;

        precedence = option.precedence;
        allowIn = option.allowIn;
        allowCall = option.allowCall;
        type = expr.type || option.type;

        if (extra.verbatim && expr.hasOwnProperty(extra.verbatim)) {
            return generateVerbatim(expr, option);
        }

        switch (type) {
        case Syntax.SequenceExpression:
            result = [];
            allowIn |= (Precedence.Sequence < precedence);
            for (i = 0, len = expr.expressions.length; i < len; i += 1) {
                result.push(generateExpression(expr.expressions[i], {
                    precedence: Precedence.Assignment,
                    allowIn: allowIn,
                    allowCall: true
                }));
                if (i + 1 < len) {
                    result.push(',' + space);
                }
            }
            result = parenthesize(result, Precedence.Sequence, precedence);
            break;

        case Syntax.AssignmentExpression:
            allowIn |= (Precedence.Assignment < precedence);
            result = parenthesize(
                [
                    generateExpression(expr.left, {
                        precedence: Precedence.Call,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                    space + expr.operator + space,
                    generateExpression(expr.right, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    })
                ],
                Precedence.Assignment,
                precedence
            );
            break;

        case Syntax.ConditionalExpression:
            allowIn |= (Precedence.Conditional < precedence);
            result = parenthesize(
                [
                    generateExpression(expr.test, {
                        precedence: Precedence.LogicalOR,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                    space + '?' + space,
                    generateExpression(expr.consequent, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    }),
                    space + ':' + space,
                    generateExpression(expr.alternate, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    })
                ],
                Precedence.Conditional,
                precedence
            );
            break;

        case Syntax.LogicalExpression:
        case Syntax.BinaryExpression:
            currentPrecedence = BinaryPrecedence[expr.operator];

            allowIn |= (currentPrecedence < precedence);

            result = join(
                generateExpression(expr.left, {
                    precedence: currentPrecedence,
                    allowIn: allowIn,
                    allowCall: true
                }),
                expr.operator
            );

            fragment = generateExpression(expr.right, {
                precedence: currentPrecedence + 1,
                allowIn: allowIn,
                allowCall: true
            });

            if (expr.operator === '/' && fragment.toString().charAt(0) === '/') {
                // If '/' concats with '/', it is interpreted as comment start
                result.push(' ', fragment);
            } else {
                result = join(result, fragment);
            }

            if (expr.operator === 'in' && !allowIn) {
                result = ['(', result, ')'];
            } else {
                result = parenthesize(result, currentPrecedence, precedence);
            }

            break;

        case Syntax.CallExpression:
            result = [generateExpression(expr.callee, {
                precedence: Precedence.Call,
                allowIn: true,
                allowCall: true,
                allowUnparenthesizedNew: false
            })];

            result.push('(');
            for (i = 0, len = expr['arguments'].length; i < len; i += 1) {
                result.push(generateExpression(expr['arguments'][i], {
                    precedence: Precedence.Assignment,
                    allowIn: true,
                    allowCall: true
                }));
                if (i + 1 < len) {
                    result.push(',' + space);
                }
            }
            result.push(')');

            if (!allowCall) {
                result = ['(', result, ')'];
            } else {
                result = parenthesize(result, Precedence.Call, precedence);
            }
            break;

        case Syntax.NewExpression:
            len = expr['arguments'].length;
            allowUnparenthesizedNew = option.allowUnparenthesizedNew === undefined || option.allowUnparenthesizedNew;

            result = join(
                'new',
                generateExpression(expr.callee, {
                    precedence: Precedence.New,
                    allowIn: true,
                    allowCall: false,
                    allowUnparenthesizedNew: allowUnparenthesizedNew && !parentheses && len === 0
                })
            );

            if (!allowUnparenthesizedNew || parentheses || len > 0) {
                result.push('(');
                for (i = 0; i < len; i += 1) {
                    result.push(generateExpression(expr['arguments'][i], {
                        precedence: Precedence.Assignment,
                        allowIn: true,
                        allowCall: true
                    }));
                    if (i + 1 < len) {
                        result.push(',' + space);
                    }
                }
                result.push(')');
            }

            result = parenthesize(result, Precedence.New, precedence);
            break;

        case Syntax.MemberExpression:
            result = [generateExpression(expr.object, {
                precedence: Precedence.Call,
                allowIn: true,
                allowCall: allowCall,
                allowUnparenthesizedNew: false
            })];

            if (expr.computed) {
                result.push('[', generateExpression(expr.property, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: allowCall
                }), ']');
            } else {
                if (expr.object.type === Syntax.Literal && typeof expr.object.value === 'number') {
                    if (result.indexOf('.') < 0) {
                        if (!/[eExX]/.test(result) && !(result.length >= 2 && result[0] === '0')) {
                            result.push('.');
                        }
                    }
                }
                result.push('.' + expr.property.name);
            }

            result = parenthesize(result, Precedence.Member, precedence);
            break;

        case Syntax.PluckExpression:
            result = [generateExpression(expr.object, {
                precedence: Precedence.Call,
                allowIn: true,
                allowCall: allowCall,
                allowUnparenthesizedNew: false
            })];

            if (expr.computed) {
                result.push('[', generateExpression(expr.property, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: allowCall
                }), ']');
            } else {
                if (expr.object.type === Syntax.Literal && typeof expr.object.value === 'number') {
                    if (result.indexOf('.') < 0) {
                        if (!/[eExX]/.test(result) && !(result.length >= 2 && result[0] === '0')) {
                            result.push('.');
                        }
                    }
                }
                result.push('#' + expr.property.name);
            }

            result = parenthesize(result, Precedence.Member, precedence);
            break;

        case Syntax.UnaryExpression:
            fragment = generateExpression(expr.argument, {
                precedence: Precedence.Unary,
                allowIn: true,
                allowCall: true
            });

            if (space === '') {
                result = join(expr.operator, fragment);
            } else {
                result = [expr.operator];
                if (expr.operator.length > 2) {
                    // delete, void, typeof
                    // get `typeof []`, not `typeof[]`
                    result = join(result, fragment);
                } else {
                    // Prevent inserting spaces between operator and argument if it is unnecessary
                    // like, `!cond`
                    leftSource = toSourceNode(result).toString();
                    leftChar = leftSource.charAt(leftSource.length - 1);
                    rightChar = fragment.toString().charAt(0);

                    if (((leftChar === '+' || leftChar === '-') && leftChar === rightChar) || (isIdentifierPart(leftChar) && isIdentifierPart(rightChar))) {
                        result.push(' ', fragment);
                    } else {
                        result.push(fragment);
                    }
                }
            }
            result = parenthesize(result, Precedence.Unary, precedence);
            break;

        case Syntax.YieldExpression:
            if (expr.delegate) {
                result = 'yield*';
            } else {
                result = 'yield';
            }
            if (expr.argument) {
                result = join(
                    result,
                    generateExpression(expr.argument, {
                        precedence: Precedence.Assignment,
                        allowIn: true,
                        allowCall: true
                    })
                );
            }
            break;

        case Syntax.UpdateExpression:
            if (expr.prefix) {
                result = parenthesize(
                    [
                        expr.operator,
                        generateExpression(expr.argument, {
                            precedence: Precedence.Unary,
                            allowIn: true,
                            allowCall: true
                        })
                    ],
                    Precedence.Unary,
                    precedence
                );
            } else {
                result = parenthesize(
                    [
                        generateExpression(expr.argument, {
                            precedence: Precedence.Postfix,
                            allowIn: true,
                            allowCall: true
                        }),
                        expr.operator
                    ],
                    Precedence.Postfix,
                    precedence
                );
            }
            break;

        case Syntax.FunctionExpression:
            result = 'function';
            if (expr.id) {
                result += ' ' + expr.id.name;
            } else {
                result += space;
            }

            result = [result, generateFunctionBody(expr)];
            break;

        case Syntax.ArrayPattern:
        case Syntax.ArrayExpression:
            if (!expr.elements.length) {
                result = '[]';
                break;
            }
            multiline = expr.elements.length > 1;
            result = ['[', multiline ? newline : ''];
            withIndent(function (indent) {
                for (i = 0, len = expr.elements.length; i < len; i += 1) {
                    if (!expr.elements[i]) {
                        if (multiline) {
                            result.push(indent);
                        }
                        if (i + 1 === len) {
                            result.push(',');
                        }
                    } else {
                        result.push(multiline ? indent : '', generateExpression(expr.elements[i], {
                            precedence: Precedence.Assignment,
                            allowIn: true,
                            allowCall: true
                        }));
                    }
                    if (i + 1 < len) {
                        result.push(',' + (multiline ? newline : space));
                    }
                }
            });
            if (multiline && !endsWithLineTerminator(toSourceNode(result).toString())) {
                result.push(newline);
            }
            result.push(multiline ? base : '', ']');
            break;

        case Syntax.Property:
            if (expr.kind === 'get' || expr.kind === 'set') {
                result = [
                    expr.kind + ' ',
                    generateExpression(expr.key, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    generateFunctionBody(expr.value)
                ];
            } else {
                if (expr.shorthand) {
                    result = generateExpression(expr.key, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    });
                } else if (expr.method) {
                    result = [];
                    if (expr.value.generator) {
                        result.push('*');
                    }
                    result.push(generateExpression(expr.key, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }), generateFunctionBody(expr.value));
                } else {
                    result = [
                        generateExpression(expr.key, {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true
                        }),
                        ':' + space,
                        generateExpression(expr.value, {
                            precedence: Precedence.Assignment,
                            allowIn: true,
                            allowCall: true
                        })
                    ];
                }
            }
            break;

        case Syntax.ObjectExpression:
            if (!expr.properties.length) {
                result = '{}';
                break;
            }
            multiline = expr.properties.length > 1;

            withIndent(function (indent) {
                fragment = generateExpression(expr.properties[0], {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true,
                    type: Syntax.Property
                });
            });

            if (!multiline) {
                // issues 4
                // Do not transform from
                //   dejavu.Class.declare({
                //       method2: function () {}
                //   });
                // to
                //   dejavu.Class.declare({method2: function () {
                //       }});
                if (!hasLineTerminator(toSourceNode(fragment).toString())) {
                    result = [ '{', space, fragment, space, '}' ];
                    break;
                }
            }

            withIndent(function (indent) {
                result = [ '{', newline, indent, fragment ];

                if (multiline) {
                    result.push(',' + newline);
                    for (i = 1, len = expr.properties.length; i < len; i += 1) {
                        result.push(indent, generateExpression(expr.properties[i], {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true,
                            type: Syntax.Property
                        }));
                        if (i + 1 < len) {
                            result.push(',' + newline);
                        }
                    }
                }
            });

            if (!endsWithLineTerminator(toSourceNode(result).toString())) {
                result.push(newline);
            }
            result.push(base, '}');
            break;

        case Syntax.ObjectPattern:
            if (!expr.properties.length) {
                result = '{}';
                break;
            }

            multiline = false;
            if (expr.properties.length === 1) {
                property = expr.properties[0];
                if (property.value.type !== Syntax.Identifier) {
                    multiline = true;
                }
            } else {
                for (i = 0, len = expr.properties.length; i < len; i += 1) {
                    property = expr.properties[i];
                    if (!property.shorthand) {
                        multiline = true;
                        break;
                    }
                }
            }
            result = ['{', multiline ? newline : '' ];

            withIndent(function (indent) {
                for (i = 0, len = expr.properties.length; i < len; i += 1) {
                    result.push(multiline ? indent : '', generateExpression(expr.properties[i], {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }));
                    if (i + 1 < len) {
                        result.push(',' + (multiline ? newline : space));
                    }
                }
            });

            if (multiline && !endsWithLineTerminator(toSourceNode(result).toString())) {
                result.push(newline);
            }
            result.push(multiline ? base : '', '}');
            break;

        case Syntax.ThisExpression:
            result = 'this';
            break;

        case Syntax.Identifier:
            result = expr.name;
            break;

        case Syntax.Literal:
            if (expr.hasOwnProperty('raw') && parse) {
                try {
                    raw = parse(expr.raw).body[0].expression;
                    if (raw.type === Syntax.Literal) {
                        if (raw.value === expr.value) {
                            result = expr.raw;
                            break;
                        }
                    }
                } catch (e) {
                    // not use raw property
                }
            }

            if (expr.value === null) {
                result = 'null';
                break;
            }

            if (typeof expr.value === 'string') {
                result = escapeString(expr.value);
                break;
            }

            if (typeof expr.value === 'number') {
                result = generateNumber(expr.value);
                break;
            }

            result = expr.value.toString();
            break;

        case Syntax.ComprehensionExpression:
            result = [
                '[',
                generateExpression(expr.body, {
                    precedence: Precedence.Assignment,
                    allowIn: true,
                    allowCall: true
                })
            ];

            if (expr.blocks) {
                for (i = 0, len = expr.blocks.length; i < len; i += 1) {
                    fragment = generateExpression(expr.blocks[i], {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    });
                    result = join(result, fragment);
                }
            }

            if (expr.filter) {
                result = join(result, 'if' + space);
                fragment = generateExpression(expr.filter, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                });
                if (extra.moz.parenthesizedComprehensionBlock) {
                    result = join(result, [ '(', fragment, ')' ]);
                } else {
                    result = join(result, fragment);
                }
            }
            result.push(']');
            break;

        case Syntax.ComprehensionBlock:
            if (expr.left.type === Syntax.VariableDeclaration) {
                fragment = [
                    expr.left.kind + ' ',
                    generateStatement(expr.left.declarations[0], {
                        allowIn: false
                    })
                ];
            } else {
                fragment = generateExpression(expr.left, {
                    precedence: Precedence.Call,
                    allowIn: true,
                    allowCall: true
                });
            }

            fragment = join(fragment, expr.of ? 'of' : 'in');
            fragment = join(fragment, generateExpression(expr.right, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            }));

            if (extra.moz.parenthesizedComprehensionBlock) {
                result = [ 'for' + space + '(', fragment, ')' ];
            } else {
                result = join('for' + space, fragment);
            }
            break;

        default:
            throw new Error('Unknown expression type: ' + expr.type);
        }

        return toSourceNode(result, expr);
    }

    function generateStatement(stmt, option) {
        var i, len, result, node, allowIn, functionBody, directiveContext, fragment, semicolon;

        allowIn = true;
        semicolon = ';';
        functionBody = false;
        directiveContext = false;
        if (option) {
            allowIn = option.allowIn === undefined || option.allowIn;
            if (!semicolons && option.semicolonOptional === true) {
                semicolon = '';
            }
            functionBody = option.functionBody;
            directiveContext = option.directiveContext;
        }

        switch (stmt.type) {
        case Syntax.BlockStatement:
            result = ['{', newline];

            withIndent(function () {
                for (i = 0, len = stmt.body.length; i < len; i += 1) {
                    fragment = addIndent(generateStatement(stmt.body[i], {
                        semicolonOptional: i === len - 1,
                        directiveContext: functionBody
                    }));
                    result.push(fragment);
                    if (!endsWithLineTerminator(toSourceNode(fragment).toString())) {
                        result.push(newline);
                    }
                }
            });

            result.push(addIndent('}'));
            break;

        case Syntax.BreakStatement:
            if (stmt.label) {
                result = 'break ' + stmt.label.name + semicolon;
            } else {
                result = 'break' + semicolon;
            }
            break;

        case Syntax.ContinueStatement:
            if (stmt.label) {
                result = 'continue ' + stmt.label.name + semicolon;
            } else {
                result = 'continue' + semicolon;
            }
            break;

        case Syntax.DirectiveStatement:
            if (stmt.raw) {
                result = stmt.raw + semicolon;
            } else {
                result = escapeDirective(stmt.directive) + semicolon;
            }
            break;

        case Syntax.DoWhileStatement:
            // Because `do 42 while (cond)` is Syntax Error. We need semicolon.
            result = join('do', maybeBlock(stmt.body));
            result = maybeBlockSuffix(stmt.body, result);
            result = join(result, [
                'while' + space + '(',
                generateExpression(stmt.test, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                }),
                ')' + semicolon
            ]);
            break;

        case Syntax.CatchClause:
            withIndent(function () {
                result = [
                    'catch' + space + '(',
                    generateExpression(stmt.param, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')'
                ];
            });
            result.push(maybeBlock(stmt.body));
            break;

        case Syntax.DebuggerStatement:
            result = 'debugger' + semicolon;
            break;

        case Syntax.EmptyStatement:
            result = ';';
            break;

        case Syntax.ExpressionStatement:
            result = [generateExpression(stmt.expression, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            })];
            // 12.4 '{', 'function' is not allowed in this position.
            // wrap expression with parentheses
            if (result.toString().charAt(0) === '{' || (result.toString().slice(0, 8) === 'function' && " (".indexOf(result.toString().charAt(8)) >= 0) || (directive && directiveContext && stmt.expression.type === Syntax.Literal && typeof stmt.expression.value === 'string')) {
                result = ['(', result, ')' + semicolon];
            } else {
                result.push(semicolon);
            }
            break;

        case Syntax.VariableDeclarator:
            if (stmt.init) {
                result = [
                    generateExpression(stmt.id, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    }) + space + '=' + space,
                    generateExpression(stmt.init, {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true
                    })
                ];
            } else {
                result = stmt.id.name;
            }
            break;

        case Syntax.VariableDeclaration:
            result = [stmt.kind];
            // special path for
            // var x = function () {
            // };
            if (stmt.declarations.length === 1 && stmt.declarations[0].init &&
                    stmt.declarations[0].init.type === Syntax.FunctionExpression) {
                result.push(' ', generateStatement(stmt.declarations[0], {
                    allowIn: allowIn
                }));
            } else {
                // VariableDeclarator is typed as Statement,
                // but joined with comma (not LineTerminator).
                // So if comment is attached to target node, we should specialize.
                withIndent(function () {
                    node = stmt.declarations[0];
                    if (extra.comment && node.leadingComments) {
                        result.push('\n', addIndent(generateStatement(node, {
                            allowIn: allowIn
                        })));
                    } else {
                        result.push(' ', generateStatement(node, {
                            allowIn: allowIn
                        }));
                    }

                    for (i = 1, len = stmt.declarations.length; i < len; i += 1) {
                        node = stmt.declarations[i];
                        if (extra.comment && node.leadingComments) {
                            result.push(',' + newline, addIndent(generateStatement(node, {
                                allowIn: allowIn
                            })));
                        } else {
                            result.push(',' + space, generateStatement(node, {
                                allowIn: allowIn
                            }));
                        }
                    }
                });
            }
            result.push(semicolon);
            break;

        case Syntax.ThrowStatement:
            result = [join(
                'throw',
                generateExpression(stmt.argument, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                })
            ), semicolon];
            break;

        case Syntax.TryStatement:
            result = ['try', maybeBlock(stmt.block)];
            result = maybeBlockSuffix(stmt.block, result);
            for (i = 0, len = stmt.handlers.length; i < len; i += 1) {
                result = join(result, generateStatement(stmt.handlers[i]));
                if (stmt.finalizer || i + 1 !== len) {
                    result = maybeBlockSuffix(stmt.handlers[i].body, result);
                }
            }
            if (stmt.finalizer) {
                result = join(result, ['finally', maybeBlock(stmt.finalizer)]);
            }
            break;

        case Syntax.SwitchStatement:
            withIndent(function () {
                result = [
                    'switch' + space + '(',
                    generateExpression(stmt.discriminant, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')' + space + '{' + newline
                ];
            });
            if (stmt.cases) {
                for (i = 0, len = stmt.cases.length; i < len; i += 1) {
                    fragment = addIndent(generateStatement(stmt.cases[i], {semicolonOptional: i === len - 1}));
                    result.push(fragment);
                    if (!endsWithLineTerminator(toSourceNode(fragment).toString())) {
                        result.push(newline);
                    }
                }
            }
            result.push(addIndent('}'));
            break;

        case Syntax.SwitchCase:
            withIndent(function () {
                if (stmt.test) {
                    result = [
                        join('case', generateExpression(stmt.test, {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true
                        })),
                        ':'
                    ];
                } else {
                    result = ['default:'];
                }

                i = 0;
                len = stmt.consequent.length;
                if (len && stmt.consequent[0].type === Syntax.BlockStatement) {
                    fragment = maybeBlock(stmt.consequent[0]);
                    result.push(fragment);
                    i = 1;
                }

                if (i !== len && !endsWithLineTerminator(toSourceNode(result).toString())) {
                    result.push(newline);
                }

                for (; i < len; i += 1) {
                    fragment = addIndent(generateStatement(stmt.consequent[i], {semicolonOptional: i === len - 1 && semicolon === ''}));
                    result.push(fragment);
                    if (i + 1 !== len && !endsWithLineTerminator(toSourceNode(fragment).toString())) {
                        result.push(newline);
                    }
                }
            });
            break;

        case Syntax.IfStatement:
            withIndent(function () {
                result = [
                    'if' + space + '(',
                    generateExpression(stmt.test, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')'
                ];
            });
            if (stmt.alternate) {
                result.push(maybeBlock(stmt.consequent));
                result = maybeBlockSuffix(stmt.consequent, result);
                if (stmt.alternate.type === Syntax.IfStatement) {
                    result = join(result, ['else ', generateStatement(stmt.alternate, {semicolonOptional: semicolon === ''})]);
                } else {
                    result = join(result, join('else', maybeBlock(stmt.alternate, semicolon === '')));
                }
            } else {
                result.push(maybeBlock(stmt.consequent, semicolon === ''));
            }
            break;

        case Syntax.ForStatement:
            withIndent(function () {
                result = ['for' + space + '('];
                if (stmt.init) {
                    if (stmt.init.type === Syntax.VariableDeclaration) {
                        result.push(generateStatement(stmt.init, {allowIn: false}));
                    } else {
                        result.push(generateExpression(stmt.init, {
                            precedence: Precedence.Sequence,
                            allowIn: false,
                            allowCall: true
                        }), ';');
                    }
                } else {
                    result.push(';');
                }

                if (stmt.test) {
                    result.push(space, generateExpression(stmt.test, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }), ';');
                } else {
                    result.push(';');
                }

                if (stmt.update) {
                    result.push(space, generateExpression(stmt.update, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }), ')');
                } else {
                    result.push(')');
                }
            });

            result.push(maybeBlock(stmt.body, semicolon === ''));
            break;

        case Syntax.ForInStatement:
            result = ['for' + space + '('];
            withIndent(function () {
                if (stmt.left.type === Syntax.VariableDeclaration) {
                    withIndent(function () {
                        result.push(stmt.left.kind + ' ', generateStatement(stmt.left.declarations[0], {
                            allowIn: false
                        }));
                    });
                } else {
                    result.push(generateExpression(stmt.left, {
                        precedence: Precedence.Call,
                        allowIn: true,
                        allowCall: true
                    }));
                }

                result = join(result, 'in');
                result = [join(
                    result,
                    generateExpression(stmt.right, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    })
                ), ')'];
            });
            result.push(maybeBlock(stmt.body, semicolon === ''));
            break;

        case Syntax.LabeledStatement:
            result = [stmt.label.name + ':', maybeBlock(stmt.body, semicolon === '')];
            break;

        case Syntax.Program:
            len = stmt.body.length;
            result = [safeConcatenation && len > 0 ? '\n' : ''];
            for (i = 0; i < len; i += 1) {
                fragment = addIndent(
                    generateStatement(stmt.body[i], {
                        semicolonOptional: !safeConcatenation && i === len - 1,
                        directiveContext: true
                    })
                );
                result.push(fragment);
                if (i + 1 < len && !endsWithLineTerminator(toSourceNode(fragment).toString())) {
                    result.push(newline);
                }
            }
            break;

        case Syntax.FunctionDeclaration:
            result = [(stmt.generator && !extra.moz.starlessGenerator ? 'function* ' : 'function ') + stmt.id.name, generateFunctionBody(stmt)];
            break;

        case Syntax.ReturnStatement:
            if (stmt.argument) {
                result = [join(
                    'return',
                    generateExpression(stmt.argument, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    })
                ), semicolon];
            } else {
                result = ['return' + semicolon];
            }
            break;

        case Syntax.WhileStatement:
            withIndent(function () {
                result = [
                    'while' + space + '(',
                    generateExpression(stmt.test, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')'
                ];
            });
            result.push(maybeBlock(stmt.body, semicolon === ''));
            break;

        case Syntax.WithStatement:
            withIndent(function () {
                result = [
                    'with' + space + '(',
                    generateExpression(stmt.object, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true
                    }),
                    ')'
                ];
            });
            result.push(maybeBlock(stmt.body, semicolon === ''));
            break;

        default:
            throw new Error('Unknown statement type: ' + stmt.type);
        }

        // Attach comments

        if (extra.comment) {
            result = addCommentsToStatement(stmt, result);
        }

        fragment = toSourceNode(result).toString();
        if (stmt.type === Syntax.Program && !safeConcatenation && newline === '' &&  fragment.charAt(fragment.length - 1) === '\n') {
            result = toSourceNode(result).replaceRight(/\s+$/, '');
        }

        return toSourceNode(result, stmt);
    }

    function generate(node, options) {
        var defaultOptions = getDefaultOptions(), result, pair;

        if (options != null) {
            // Obsolete options
            //
            //   `options.indent`
            //   `options.base`
            //
            // Instead of them, we can use `option.format.indent`.
            if (typeof options.indent === 'string') {
                defaultOptions.format.indent.style = options.indent;
            }
            if (typeof options.base === 'number') {
                defaultOptions.format.indent.base = options.base;
            }
            options = updateDeeply(defaultOptions, options);
            indent = options.format.indent.style;
            if (typeof options.base === 'string') {
                base = options.base;
            } else {
                base = stringRepeat(indent, options.format.indent.base);
            }
        } else {
            options = defaultOptions;
            indent = options.format.indent.style;
            base = stringRepeat(indent, options.format.indent.base);
        }
        json = options.format.json;
        renumber = options.format.renumber;
        hexadecimal = json ? false : options.format.hexadecimal;
        quotes = json ? 'double' : options.format.quotes;
        escapeless = options.format.escapeless;
        if (options.format.compact) {
            newline = space = indent = base = '';
        } else {
            newline = '\n';
            space = ' ';
        }
        parentheses = options.format.parentheses;
        semicolons = options.format.semicolons;
        safeConcatenation = options.format.safeConcatenation;
        directive = options.directive;
        parse = json ? null : options.parse;
        sourceMap = options.sourceMap;
        extra = options;

        if (sourceMap) {
            if (!exports.browser) {
                // We assume environment is node.js
                // And prevent from including source-map by browserify
                SourceNode = require('source-map').SourceNode;
            } else {
                SourceNode = global.sourceMap.SourceNode;
            }
        } else {
            SourceNode = SourceNodeMock;
        }

        switch (node.type) {
        case Syntax.BlockStatement:
        case Syntax.BreakStatement:
        case Syntax.CatchClause:
        case Syntax.ContinueStatement:
        case Syntax.DirectiveStatement:
        case Syntax.DoWhileStatement:
        case Syntax.DebuggerStatement:
        case Syntax.EmptyStatement:
        case Syntax.ExpressionStatement:
        case Syntax.ForStatement:
        case Syntax.ForInStatement:
        case Syntax.FunctionDeclaration:
        case Syntax.IfStatement:
        case Syntax.LabeledStatement:
        case Syntax.Program:
        case Syntax.ReturnStatement:
        case Syntax.SwitchStatement:
        case Syntax.SwitchCase:
        case Syntax.ThrowStatement:
        case Syntax.TryStatement:
        case Syntax.VariableDeclaration:
        case Syntax.VariableDeclarator:
        case Syntax.WhileStatement:
        case Syntax.WithStatement:
            result = generateStatement(node);
            break;

        case Syntax.AssignmentExpression:
        case Syntax.ArrayExpression:
        case Syntax.ArrayPattern:
        case Syntax.BinaryExpression:
        case Syntax.CallExpression:
        case Syntax.ConditionalExpression:
        case Syntax.FunctionExpression:
        case Syntax.Identifier:
        case Syntax.Literal:
        case Syntax.LogicalExpression:
        case Syntax.MemberExpression:
        case Syntax.PluckExpression:
        case Syntax.NewExpression:
        case Syntax.ObjectExpression:
        case Syntax.ObjectPattern:
        case Syntax.Property:
        case Syntax.SequenceExpression:
        case Syntax.ThisExpression:
        case Syntax.UnaryExpression:
        case Syntax.UpdateExpression:
        case Syntax.YieldExpression:

            result = generateExpression(node, {
                precedence: Precedence.Sequence,
                allowIn: true,
                allowCall: true
            });
            break;

        default:
            throw new Error('Unknown node type: ' + node.type);
        }

        if (!sourceMap) {
            return result.toString();
        }

        pair = result.toStringWithSourceMap({
            file: options.sourceMap,
            sourceRoot: options.sourceMapRoot
        });

        if (options.sourceMapWithCode) {
            return pair;
        }
        return pair.map.toString();
    }

    // simple visitor implementation

    VisitorKeys = {
        AssignmentExpression: ['left', 'right'],
        ArrayExpression: ['elements'],
        ArrayPattern: ['elements'],
        BlockStatement: ['body'],
        BinaryExpression: ['left', 'right'],
        BreakStatement: ['label'],
        CallExpression: ['callee', 'arguments'],
        CatchClause: ['param', 'body'],
        ConditionalExpression: ['test', 'consequent', 'alternate'],
        ContinueStatement: ['label'],
        DirectiveStatement: [],
        DoWhileStatement: ['body', 'test'],
        DebuggerStatement: [],
        EmptyStatement: [],
        ExpressionStatement: ['expression'],
        ForStatement: ['init', 'test', 'update', 'body'],
        ForInStatement: ['left', 'right', 'body'],
        FunctionDeclaration: ['id', 'params', 'body'],
        FunctionExpression: ['id', 'params', 'body'],
        Identifier: [],
        IfStatement: ['test', 'consequent', 'alternate'],
        Literal: [],
        LabeledStatement: ['label', 'body'],
        LogicalExpression: ['left', 'right'],
        MemberExpression: ['object', 'property'],
        PluckExpression: ['object', 'property'],
        NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
        ObjectPattern: ['properties'],
        Program: ['body'],
        Property: ['key', 'value'],
        ReturnStatement: ['argument'],
        SequenceExpression: ['expressions'],
        SwitchStatement: ['discriminant', 'cases'],
        SwitchCase: ['test', 'consequent'],
        ThisExpression: [],
        ThrowStatement: ['argument'],
        TryStatement: ['block', 'handlers', 'finalizer'],
        UnaryExpression: ['argument'],
        UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['id', 'init'],
        WhileStatement: ['test', 'body'],
        WithStatement: ['object', 'body'],
        YieldExpression: ['argument']
    };

    VisitorOption = {
        Break: 1,
        Skip: 2
    };

    // based on LLVM libc++ upper_bound / lower_bound
    // MIT License

    function upperBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                len = diff;
            } else {
                i = current + 1;
                len -= diff + 1;
            }
        }
        return i;
    }

    function lowerBound(array, func) {
        var diff, len, i, current;

        len = array.length;
        i = 0;

        while (len) {
            diff = len >>> 1;
            current = i + diff;
            if (func(array[current])) {
                i = current + 1;
                len -= diff + 1;
            } else {
                len = diff;
            }
        }
        return i;
    }

    function extendCommentRange(comment, tokens) {
        var target, token;

        target = upperBound(tokens, function search(token) {
            return token.range[0] > comment.range[0];
        });

        comment.extendedRange = [comment.range[0], comment.range[1]];

        if (target !== tokens.length) {
            comment.extendedRange[1] = tokens[target].range[0];
        }

        target -= 1;
        if (target >= 0) {
            if (target < tokens.length) {
                comment.extendedRange[0] = tokens[target].range[1];
            } else if (token.length) {
                comment.extendedRange[1] = tokens[tokens.length - 1].range[0];
            }
        }

        return comment;
    }

    function attachComments(tree, providedComments, tokens) {
        // At first, we should calculate extended comment ranges.
        var comments = [], comment, len, i;

        if (!tree.range) {
            throw new Error('attachComments needs range information');
        }

        // tokens array is empty, we attach comments to tree as 'leadingComments'
        if (!tokens.length) {
            if (providedComments.length) {
                for (i = 0, len = providedComments.length; i < len; i += 1) {
                    comment = deepCopy(providedComments[i]);
                    comment.extendedRange = [0, tree.range[0]];
                    comments.push(comment);
                }
                tree.leadingComments = comments;
            }
            return tree;
        }

        for (i = 0, len = providedComments.length; i < len; i += 1) {
            comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
        }

        // This is based on John Freeman's implementation.
        traverse(tree, {
            cursor: 0,
            enter: function (node) {
                var comment;

                while (this.cursor < comments.length) {
                    comment = comments[this.cursor];
                    if (comment.extendedRange[1] > node.range[0]) {
                        break;
                    }

                    if (comment.extendedRange[1] === node.range[0]) {
                        if (!node.leadingComments) {
                            node.leadingComments = [];
                        }
                        node.leadingComments.push(comment);
                        comments.splice(this.cursor, 1);
                    } else {
                        this.cursor += 1;
                    }
                }

                // already out of owned node
                if (this.cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[this.cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        traverse(tree, {
            cursor: 0,
            leave: function (node) {
                var comment;

                while (this.cursor < comments.length) {
                    comment = comments[this.cursor];
                    if (node.range[1] < comment.extendedRange[0]) {
                        break;
                    }

                    if (node.range[1] === comment.extendedRange[0]) {
                        if (!node.trailingComments) {
                            node.trailingComments = [];
                        }
                        node.trailingComments.push(comment);
                        comments.splice(this.cursor, 1);
                    } else {
                        this.cursor += 1;
                    }
                }

                // already out of owned node
                if (this.cursor === comments.length) {
                    return VisitorOption.Break;
                }

                if (comments[this.cursor].extendedRange[0] > node.range[1]) {
                    return VisitorOption.Skip;
                }
            }
        });

        return tree;
    }

    // Sync with package.json.
    exports.version = '0.0.16-dev';

    exports.generate = generate;
    exports.attachComments = attachComments;
    exports.browser = false;
}());
/* vim: set sw=4 ts=4 et tw=80 : */

});

require.define("/node_modules/estraverse/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"estraverse.js"}
});

require.define("/node_modules/estraverse/estraverse.js",function(require,module,exports,__dirname,__filename,process,global){/*
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint bitwise:true */
/*global exports:true, define:true, window:true */
(function (factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // and plain browser loading,
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((window.estraverse = {}));
    }
}(function (exports) {
    'use strict';

    var Syntax,
        isArray,
        VisitorOption,
        VisitorKeys,
        wrappers;

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        PluckExpression: 'PluckExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }

    VisitorKeys = {
        AssignmentExpression: ['left', 'right'],
        ArrayExpression: ['elements'],
        BlockStatement: ['body'],
        BinaryExpression: ['left', 'right'],
        BreakStatement: ['label'],
        CallExpression: ['callee', 'arguments'],
        CatchClause: ['param', 'body'],
        ConditionalExpression: ['test', 'consequent', 'alternate'],
        ContinueStatement: ['label'],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: ['body', 'test'],
        EmptyStatement: [],
        ExpressionStatement: ['expression'],
        ForStatement: ['init', 'test', 'update', 'body'],
        ForInStatement: ['left', 'right', 'body'],
        FunctionDeclaration: ['id', 'params', 'body'],
        FunctionExpression: ['id', 'params', 'body'],
        Identifier: [],
        IfStatement: ['test', 'consequent', 'alternate'],
        Literal: [],
        LabeledStatement: ['label', 'body'],
        LogicalExpression: ['left', 'right'],
        MemberExpression: ['object', 'property'],
        PluckExpression: ['object', 'property'],
        NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
        Program: ['body'],
        Property: ['key', 'value'],
        ReturnStatement: ['argument'],
        SequenceExpression: ['expressions'],
        SwitchStatement: ['discriminant', 'cases'],
        SwitchCase: ['test', 'consequent'],
        ThisExpression: [],
        ThrowStatement: ['argument'],
        TryStatement: ['block', 'handlers', 'finalizer'],
        UnaryExpression: ['argument'],
        UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['id', 'init'],
        WhileStatement: ['test', 'body'],
        WithStatement: ['object', 'body']
    };

    VisitorOption = {
        Break: 1,
        Skip: 2
    };

    wrappers = {
        PropertyWrapper: 'Property'
    };

    function traverse(top, visitor) {
        var worklist, leavelist, node, nodeType, ret, current, current2, candidates, candidate, marker = {};

        worklist = [ top ];
        leavelist = [ null ];

        while (worklist.length) {
            node = worklist.pop();
            nodeType = node.type;

            if (node === marker) {
                node = leavelist.pop();
                if (visitor.leave) {
                    ret = visitor.leave(node, leavelist[leavelist.length - 1]);
                } else {
                    ret = undefined;
                }
                if (ret === VisitorOption.Break) {
                    return;
                }
            } else if (node) {
                if (wrappers.hasOwnProperty(nodeType)) {
                    node = node.node;
                    nodeType = wrappers[nodeType];
                }

                if (visitor.enter) {
                    ret = visitor.enter(node, leavelist[leavelist.length - 1]);
                } else {
                    ret = undefined;
                }

                if (ret === VisitorOption.Break) {
                    return;
                }

                worklist.push(marker);
                leavelist.push(node);

                if (ret !== VisitorOption.Skip) {
                    candidates = VisitorKeys[nodeType];
                    current = candidates.length;
                    while ((current -= 1) >= 0) {
                        candidate = node[candidates[current]];
                        if (candidate) {
                            if (isArray(candidate)) {
                                current2 = candidate.length;
                                while ((current2 -= 1) >= 0) {
                                    if (candidate[current2]) {
                                        if(nodeType === Syntax.ObjectExpression && 'properties' === candidates[current] && null == candidates[current].type) {
                                            worklist.push({type: 'PropertyWrapper', node: candidate[current2]});
                                        } else {
                                            worklist.push(candidate[current2]);
                                        }
                                    }
                                }
                            } else {
                                worklist.push(candidate);
                            }
                        }
                    }
                }
            }
        }
    }

    function replace(top, visitor) {
        var worklist, leavelist, node, nodeType, target, tuple, ret, current, current2, candidates, candidate, marker = {}, result;

        result = {
            top: top
        };

        tuple = [ top, result, 'top' ];
        worklist = [ tuple ];
        leavelist = [ tuple ];

        function notify(v) {
            ret = v;
        }

        while (worklist.length) {
            tuple = worklist.pop();

            if (tuple === marker) {
                tuple = leavelist.pop();
                ret = undefined;
                if (visitor.leave) {
                    node = tuple[0];
                    target = visitor.leave(tuple[0], leavelist[leavelist.length - 1][0], notify);
                    if (target !== undefined) {
                        node = target;
                    }
                    tuple[1][tuple[2]] = node;
                }
                if (ret === VisitorOption.Break) {
                    return result.top;
                }
            } else if (tuple[0]) {
                ret = undefined;
                node = tuple[0];

                nodeType = node.type;
                if (wrappers.hasOwnProperty(nodeType)) {
                    tuple[0] = node = node.node;
                    nodeType = wrappers[nodeType];
                }

                if (visitor.enter) {
                    target = visitor.enter(tuple[0], leavelist[leavelist.length - 1][0], notify);
                    if (target !== undefined) {
                        node = target;
                    }
                    tuple[1][tuple[2]] = node;
                    tuple[0] = node;
                }

                if (ret === VisitorOption.Break) {
                    return result.top;
                }

                if (tuple[0]) {
                    worklist.push(marker);
                    leavelist.push(tuple);

                    if (ret !== VisitorOption.Skip) {
                        candidates = VisitorKeys[nodeType];
                        current = candidates.length;
                        while ((current -= 1) >= 0) {
                            candidate = node[candidates[current]];
                            if (candidate) {
                                if (isArray(candidate)) {
                                    current2 = candidate.length;
                                    while ((current2 -= 1) >= 0) {
                                        if (candidate[current2]) {
                                            if(nodeType === Syntax.ObjectExpression && 'properties' === candidates[current] && null == candidates[current].type) {
                                                worklist.push([{type: 'PropertyWrapper', node: candidate[current2]}, candidate, current2]);
                                            } else {
                                                worklist.push([candidate[current2], candidate, current2]);
                                            }
                                        }
                                    }
                                } else {
                                    worklist.push([candidate, node, candidates[current]]);
                                }
                            }
                        }
                    }
                }
            }
        }

        return result.top;
    }

    exports.version = '0.0.4';
    exports.Syntax = Syntax;
    exports.traverse = traverse;
    exports.replace = replace;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
}));
/* vim: set sw=4 ts=4 et tw=80 : */

});

require.define("/tools/entry-point.js",function(require,module,exports,__dirname,__filename,process,global){/*
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {
    'use strict';
    var escodegen;
    escodegen = global.escodegen = require('../escodegen');
    escodegen.browser = true;
}());

});
require("/tools/entry-point.js");
})();

/*
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint bitwise:true */
/*global exports:true, define:true, window:true */
(function (factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // and plain browser loading,
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((window.estraverse = {}));
    }
}(function (exports) {
    'use strict';

    var Syntax,
        isArray,
        VisitorOption,
        VisitorKeys,
        wrappers;

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DebuggerStatement: 'DebuggerStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }

    VisitorKeys = {
        AssignmentExpression: ['left', 'right'],
        ArrayExpression: ['elements'],
        BlockStatement: ['body'],
        BinaryExpression: ['left', 'right'],
        BreakStatement: ['label'],
        CallExpression: ['callee', 'arguments'],
        CatchClause: ['param', 'body'],
        ConditionalExpression: ['test', 'consequent', 'alternate'],
        ContinueStatement: ['label'],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: ['body', 'test'],
        EmptyStatement: [],
        ExpressionStatement: ['expression'],
        ForStatement: ['init', 'test', 'update', 'body'],
        ForInStatement: ['left', 'right', 'body'],
        FunctionDeclaration: ['id', 'params', 'body'],
        FunctionExpression: ['id', 'params', 'body'],
        Identifier: [],
        IfStatement: ['test', 'consequent', 'alternate'],
        Literal: [],
        LabeledStatement: ['label', 'body'],
        LogicalExpression: ['left', 'right'],
        MemberExpression: ['object', 'property'],
        PluckExpression: ['object', 'property'],
        PaletteExpression: [],
        InterpolatorExpression: [],
        NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
        Program: ['body'],
        Property: ['key', 'value'],
        ReturnStatement: ['argument'],
        SequenceExpression: ['expressions'],
        SwitchStatement: ['discriminant', 'cases'],
        SwitchCase: ['test', 'consequent'],
        ThisExpression: [],
        ThrowStatement: ['argument'],
        TryStatement: ['block', 'handlers', 'finalizer'],
        UnaryExpression: ['argument'],
        UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['id', 'init'],
        WhileStatement: ['test', 'body'],
        WithStatement: ['object', 'body']
    };

    VisitorOption = {
        Break: 1,
        Skip: 2
    };

    wrappers = {
        PropertyWrapper: 'Property'
    };

    function traverse(top, visitor) {
        var worklist, leavelist, node, nodeType, ret, current, current2, candidates, candidate, marker = {};

        worklist = [ top ];
        leavelist = [ null ];

        while (worklist.length) {
            node = worklist.pop();
            nodeType = node.type;

            if (node === marker) {
                node = leavelist.pop();
                if (visitor.leave) {
                    ret = visitor.leave(node, leavelist[leavelist.length - 1]);
                } else {
                    ret = undefined;
                }
                if (ret === VisitorOption.Break) {
                    return;
                }
            } else if (node) {
                if (wrappers.hasOwnProperty(nodeType)) {
                    node = node.node;
                    nodeType = wrappers[nodeType];
                }

                if (visitor.enter) {
                    ret = visitor.enter(node, leavelist[leavelist.length - 1]);
                } else {
                    ret = undefined;
                }

                if (ret === VisitorOption.Break) {
                    return;
                }

                worklist.push(marker);
                leavelist.push(node);

                if (ret !== VisitorOption.Skip) {
                    candidates = VisitorKeys[nodeType];
                    current = candidates.length;
                    while ((current -= 1) >= 0) {
                        candidate = node[candidates[current]];
                        if (candidate) {
                            if (isArray(candidate)) {
                                current2 = candidate.length;
                                while ((current2 -= 1) >= 0) {
                                    if (candidate[current2]) {
                                        if(nodeType === Syntax.ObjectExpression && 'properties' === candidates[current] && null == candidates[current].type) {
                                            worklist.push({type: 'PropertyWrapper', node: candidate[current2]});
                                        } else {
                                            worklist.push(candidate[current2]);
                                        }
                                    }
                                }
                            } else {
                                worklist.push(candidate);
                            }
                        }
                    }
                }
            }
        }
    }

    function replace(top, visitor) {
        var worklist, leavelist, node, nodeType, target, tuple, ret, current, current2, candidates, candidate, marker = {}, result;

        result = {
            top: top
        };

        tuple = [ top, result, 'top' ];
        worklist = [ tuple ];
        leavelist = [ tuple ];

        function notify(v) {
            ret = v;
        }

        while (worklist.length) {
            tuple = worklist.pop();

            if (tuple === marker) {
                tuple = leavelist.pop();
                ret = undefined;
                if (visitor.leave) {
                    node = tuple[0];
                    target = visitor.leave(tuple[0], leavelist[leavelist.length - 1][0], notify);
                    if (target !== undefined) {
                        node = target;
                    }
                    tuple[1][tuple[2]] = node;
                }
                if (ret === VisitorOption.Break) {
                    return result.top;
                }
            } else if (tuple[0]) {
                ret = undefined;
                node = tuple[0];

                nodeType = node.type;
                if (wrappers.hasOwnProperty(nodeType)) {
                    tuple[0] = node = node.node;
                    nodeType = wrappers[nodeType];
                }

                if (visitor.enter) {
                    target = visitor.enter(tuple[0], leavelist[leavelist.length - 1][0], notify);
                    if (target !== undefined) {
                        node = target;
                    }
                    tuple[1][tuple[2]] = node;
                    tuple[0] = node;
                }

                if (ret === VisitorOption.Break) {
                    return result.top;
                }

                if (tuple[0]) {
                    worklist.push(marker);
                    leavelist.push(tuple);

                    if (ret !== VisitorOption.Skip) {
                        candidates = VisitorKeys[nodeType];
                        current = candidates.length;
                        while ((current -= 1) >= 0) {
                            candidate = node[candidates[current]];
                            if (candidate) {
                                if (isArray(candidate)) {
                                    current2 = candidate.length;
                                    while ((current2 -= 1) >= 0) {
                                        if (candidate[current2]) {
                                            if(nodeType === Syntax.ObjectExpression && 'properties' === candidates[current] && null == candidates[current].type) {
                                                worklist.push([{type: 'PropertyWrapper', node: candidate[current2]}, candidate, current2]);
                                            } else {
                                                worklist.push([candidate[current2], candidate, current2]);
                                            }
                                        }
                                    }
                                } else {
                                    worklist.push([candidate, node, candidates[current]]);
                                }
                            }
                        }
                    }
                }
            }
        }

        return result.top;
    }

    exports.version = '0.0.5-dev';
    exports.Syntax = Syntax;
    exports.traverse = traverse;
    exports.replace = replace;
    exports.VisitorKeys = VisitorKeys;
    exports.VisitorOption = VisitorOption;
}));
/* vim: set sw=4 ts=4 et tw=80 : */
