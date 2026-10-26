'use strict';
try {
  const husky = require('husky');
  if (typeof husky === 'function') husky();
  else if (husky && typeof husky.default === 'function') husky.default();
} catch {
  // husky optional outside a full install
}
