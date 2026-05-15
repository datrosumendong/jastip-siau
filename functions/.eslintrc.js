
module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2018,
  },
  extends: [
    "eslint:recommended",
  ],
  rules: {
    "no-restricted-globals": "off",
    "prefer-arrow-callback": "off",
    "quotes": "off",
    "max-len": "off",
    "object-curly-spacing": "off",
    "indent": "off",
    "no-unused-vars": "warn",
    "comma-dangle": "off",
    "arrow-parens": "off",
    "eol-last": "off",
    "no-trailing-spaces": "off",
    "spaced-comment": "off",
    "semi": "off",
  },
};
