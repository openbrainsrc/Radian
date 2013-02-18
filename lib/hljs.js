
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

