const slugify = require("slugify");

module.exports = (page, data) => {
  const slug = slugify(data.productName, {
    replacement: "-", // replace spaces with replacement character, defaults to `-`
    // remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    // locale: 'vi',       // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });

  let output = page.replace(/{%IMAGE%}/g, data.image);
  output = output.replace(/{%PRODUCTNAME%}/g, data.productName);
  output = output.replace(/{%FROM%}/g, data.from);
  output = output.replace(/{%NUTRIENTS%}/g, data.nutrients);
  output = output.replace(/{%QUANTITY%}/g, data.quantity);
  output = output.replace(/{%PRICE%}/g, data.price);
  output = output.replace(/{%DESCRIPTION%}/g, data.description);
  output = output.replace(/{%PRODUCT%}/g, slug);
  output = output.replace(
    /{%NOT_ORGANIC%}/g,
    data.organic ? "" : "not-organic"
  );
  return output;
};
