const Mustache = require("mustache");

const recursiveReplace = (args, context) => {
  let processedArgs = Array.isArray(args) ? [] : {};

  for (let key in args) {
    if (Object.hasOwnProperty.call(args, key)) {
      let arg = args[key];
      if (arg == null || arg == undefined) {
        processedArgs[key] = arg;
      } else {
        switch (typeof arg) {
          case "string": //If string, process directly. Else, recurse down the rabbit hole.
            processedArgs[key] = Mustache.render(arg, context);
            break;
          case "number":
            processedArgs[key] = arg;
            break;
          case "boolean":
            processedArgs[key] = arg;
            break;
          case "object":
            processedArgs[key] = recursiveReplace(arg, context);
            break;
          default:
            throw new Error(`Type Error: type ${typeof arg} for argument ${key} is not supported`);
        }
      }
    }
  }

  return processedArgs;
};

module.exports.recursiveReplace = recursiveReplace;

module.exports.pick = (obj, props) => {
  return props.reduce(function (o, k) {
    if (obj[k] && !(typeof obj[k] == "object" && Object.keys(obj[k]).length == 0)) o[k] = obj[k];
    return o;
  }, {});
};

/**
 * Searches the provided string for any values in the secrets array and replaces
 * them. Use this as a last resort alternative to `safeParameters`
 */
module.exports.removeSensitiveData = (stringData, secrets, substitute = "****") => {
  let cleanData = stringData;
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  secrets.forEach((secret) => {
    const escapedSecret = escapeRegExp(secret);
    const regexp = new RegExp(escapedSecret, "g");
    cleanData = cleanData.replace(regexp, substitute);
  });
  return cleanData;
};
