var _utils = require('./utils');
var escape = _utils.escape;
var unescape = _utils.unescape;

/**
 * Renderer
 */

var defaultOptions = {
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  headerAutoId: true,
  xhtml: false,
};

function Renderer(options) {
  this.options = options || defaultOptions;
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

/**
 * _createId() derives a valid element ID or NAME
 * token based on a text string. Useful for making
 * an html heading id="" that resembles the text
 * value.
 *
 * HTML 4 fragment identifiers must match the
 * pattern [A-Za-z][A-Za-z0-9:_.-]*
 *
 * This function is more strict, since it also
 * removes colons and periods.
 *
 * @param {String} text
 * @return {String} id
 */

Renderer.prototype._createId = function(text) {
  // naive strategy (remove out of range characters)
  maybeId = text.toLowerCase()
                .replace(/[^a-z0-9_-]+/g, '-')
                .replace(/(^-+)|(-+$)/g, '');

  // fail-safe strategy (convert chars to codes)
  if (!maybeId) {
    chars = text.split('');
    codes = [];
    for(i = 0; i < chars.length; i++) {
      codes[i] = chars[i].charCodeAt(0);
    }
    maybeId = codes.join('-');
  }

  // If the result does not start with a letter, prefix it
  id = maybeId.match(/^[^a-z]/) ? "id-" + maybeId : maybeId;

  return id;
};

Renderer.prototype.heading = function(text, level, raw) {
  var id = /({#)(.+)(})/g.exec(raw);
  id = id? id[2] : null;

  if (!id && this.options.headerAutoId !== false) id = this._createId(raw)

  return '<h'
    + level
    + (id? ' id="' + id + '"' : '')
    + '>'
    + text.replace(/{#.+}/g, '')
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

Renderer.prototype.math = function(content, language, display) {
  mode = display ? '; mode=display' : '';
  return '<script type="' + language + mode + '">' + content + '</script>';
}

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.reffn = function(refname) {
  return '<sup><a href="#fn_' + refname + '" id="reffn_' + refname + '">' + refname + '</a></sup>'
}

Renderer.prototype.footnote = function(refname, text) {
  return '<blockquote id="fn_' + refname + '">\n'
    + '<sup>' + refname + '</sup>. '
    + text
    + '<a href="#reffn_' + refname + '" title="Jump back to footnote [' + refname + '] in the text."> &#8617;</a>\n'
    + '</blockquote>\n';
}


Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

module.exports = Renderer;
