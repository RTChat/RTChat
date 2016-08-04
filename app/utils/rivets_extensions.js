
// === Formatters ===

Rivets.formatters.gt = function(value, arg) {
  return value > arg;
};

Rivets.formatters.gte = function(value, arg) {
  return value >= arg;
};

Rivets.formatters.lt = function(value, arg) {
  return value < arg;
};

Rivets.formatters.lte = function(value, arg) {
  return value <= arg;
};

Rivets.formatters.eq = function(value, arg) {
  return value == arg;
};

Rivets.formatters.and = function(value, arg) {
  return value && arg;
};

Rivets.formatters.or = function(value, arg) {
  return value || arg;
};

Rivets.formatters.length = function(value) {
  return value && value.length;
};

// Concatenate or add
Rivets.formatters['+'] = function(value, arg) {
  return value + arg;
};

// Allows rv-each-* to work on objects..
// Borrowed from: https://github.com/mikeric/rivets/issues/105
Rivets.formatters.to_a = function(value) {
  var new_value = [];
  _.forEach(value, function(v, k) {
    new_value.push({key: k, value: v});
  });
  return new_value;
};

// === HTML formatters ===

// Escape special html characters to prevent injection. (use this first)
Rivets.formatters.htmlEscape = function(value) {
  return !!value && value.replace(/[<>]/g, function(char) {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
    }
  }) || '';
  //TODO: should this be more complete?
};

// Linky - Turn text that looks like links _into_ anchor tags.
Rivets.formatters.linky = function(value) {
  if (!value) return '';
  var re = /(^|\s)((https?|ssh|ftp|mailto):\/\/[a-z0-9\-\._~:\/?#\[\]@!$&'\(\)\*\+,;=]+)(\s|$)/gi;
  // return value.replace(re, function(match) {
  return value.replace(re, function(str, begin, url, protocol, end) {
    return `${ begin }<a class='linky' href='${ url }' target='_blank' rel='nofollow'>${ url }</a></span>${ end }`;
  });
};

// ChatMarkdown - Renders "rich" text.
Rivets.formatters.chatMarkdown = function(value) {
  if (!value) return '';
  // Trim whitespace and render newlines.
  value = value.replace(/((^\s+)|(\s+$))/g, "").replace(/\r?\n/g, "<br>");
  // `code`, ~strike~, _italic_, and *bold* text. (respecting escape chars)
  var re = /(^|\s)(\`(.*?[^\\])\`|~(.*?[^\\])~|_(.*?[^\\])_|\*(.*?[^\\])\*)/g;
  return value.replace(re, function(str, begin, middle, code, strike, italics, bold) {
    if (italics) return `${ begin }<i>${ italics }</i>`;
    if (strike) return `${ begin }<s>${ strike }</s>`;
    if (bold) return `${ begin }<b>${ bold }</b>`;
    if (code) return `${ begin }<code>${ code }</code>`;
    // <span style="position:absolute;opacity:0;">`</span>
  });
};

// EmojiOne
var EmojiOne = window.emojione = require('emojione');
EmojiOne.cacheBustParam = ''; //HACK: makes emojione use the same url as EmojioneArea.
Rivets.formatters.emojione = function(value) {
  return !!value && EmojiOne.toImage(value) || '';
};

