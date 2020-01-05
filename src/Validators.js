import Messages from "./Messages";
import { isNullOrUndefined, isBlank, isFalse } from "./utils";

let re_weburl;

function timestampMinValidator(value, props) {
  // under ISO8601, dates and times can be compared as strings
  if (!isNullOrUndefined(value) && value < props.min) {
    return Messages.get("min", props);
  }
}

function timestampMaxValidator(value, props) {
  if (!isNullOrUndefined(value) && value > props.max) {
    return Messages.get("max", props);
  }
}

export default {
  required: function(value, props) {
    if (isBlank(value) && !isFalse(props.required)) {
      return Messages.get("required", props);
    }
  },

  "number.required": function(value, props) {
    if (isNullOrUndefined(value) && !isFalse(props.required)) {
      return Messages.get("required", props);
    }
  },

  "number.min": function(value, props) {
    if (!isNullOrUndefined(value) && value < +props.min) {
      return Messages.get("min", props);
    }
  },

  "number.max": function(value, props) {
    if (!isNullOrUndefined(value) && value > +props.max) {
      return Messages.get("max", props);
    }
  },

  "date.min": timestampMinValidator,
  "date.max": timestampMaxValidator,
  "time.min": timestampMinValidator,
  "time.max": timestampMaxValidator,

  url: function(value, props) {
    // Lazy init a reasonable (< 5k chars) implementation of URL regex
    // https://mathiasbynens.be/demo/url-regex
    // https://gist.github.com/dperini/729294
    if (!re_weburl) {
      re_weburl = new RegExp(
        "^" +
          // protocol identifier
          "(?:(?:https?|ftp)://)" +
          // user:pass authentication
          "(?:\\S+(?::\\S*)?@)?" +
          "(?:" +
          // IP address exclusion
          // private & local networks
          "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
          "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
          "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
          // IP address dotted notation octets
          // excludes loopback network 0.0.0.0
          // excludes reserved space >= 224.0.0.0
          // excludes network & broacast addresses
          // (first & last IP address of each class)
          "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
          "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
          "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
          "|" +
          // host name
          "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
          // domain name
          "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
          // TLD identifier
          "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
          // TLD may end with dot
          "\\.?" +
          ")" +
          // port number
          "(?::\\d{2,5})?" +
          // resource path
          "(?:[/?#]\\S*)?" +
          "$",
        "i"
      );
    }

    if (!isNullOrUndefined(value) && !re_weburl.test(value)) {
      return Messages.get("url", props);
    }
  },

  email: function(value, props) {
    // Simple email validation
    // http://stackoverflow.com/questions/742451/what-is-the-simplest-regular-expression-to-validate-emails-to-not-accept-them-bl
    if (!isNullOrUndefined(value) && !/^(\S+@\S+)?$/.test(value)) {
      return Messages.get("email", props);
    }
  },

  pattern: function(value, props) {
    let { pattern } = props;
    if (!isNullOrUndefined(value) && pattern) {
      if (pattern[0] !== "^") {
        pattern = "^" + pattern;
      }
      if (pattern[pattern.length - 1] !== "$") {
        pattern += "$";
      }
      if (!new RegExp(pattern).test(value)) {
        return Messages.get("pattern", props);
      }
    }
  },

  maxLength: function(value, props) {
    const { maxLength } = props;
    if (!isNullOrUndefined(value) && value.length > maxLength) {
      return Messages.get("maxLength", props);
    }
  },

  // return the list of properties susceptible of validation
  filterValidationProps: function(props) {
    const result = {};
    ["type", "required", "min", "max", "pattern", "maxLength"].forEach(function(
      key
    ) {
      const value = props[key];
      if (!isNullOrUndefined(value)) {
        result[key] = value;
      }
    });
    return result;
  }
};
