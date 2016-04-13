
// === Formatters ===
Rivets.formatters.length = function(value) {
  return value && value.length;
};

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
  return value >= arg;
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

// Concatenate
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
