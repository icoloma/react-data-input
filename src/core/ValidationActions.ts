import { isNullOrUndefined, isBlank, isFalse } from "./utils";
import { InputHTMLAttributes } from "react";
import { Messages } from "../core/Messages";

let re_weburl: RegExp;

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export type ValidationResult = string | undefined;

export type ValidationAction<T> = (
  value: T,
  props: InputProps
) => ValidationResult;

function timestampMinValidator(
  value: string,
  props: InputProps
): ValidationResult {
  // under ISO8601, dates and times can be compared as strings
  if (!isNullOrUndefined(value) && value < props.min) {
    return "min";
  }
}

function timestampMaxValidator(
  value: string,
  props: InputProps
): ValidationResult {
  if (!isNullOrUndefined(value) && value > props.max) {
    return "max";
  }
}

export const ValidationActions = {
  date_min: timestampMinValidator,
  date_max: timestampMaxValidator,
  time_min: timestampMinValidator,
  time_max: timestampMaxValidator,

  required(value: any, props: InputProps): ValidationResult {
    if (isBlank(value) && !isFalse(props.required)) {
      return "required";
    }
  },

  number_required(value: number, props: InputProps): ValidationResult {
    if (isNullOrUndefined(value) && !isFalse(props.required)) {
      return "required";
    }
  },

  number_min(value: number, props: InputProps): ValidationResult {
    if (!isNullOrUndefined(value) && value < +props.min) {
      return "min";
    }
  },

  number_max(value: number, props: InputProps): ValidationResult {
    if (!isNullOrUndefined(value) && value > +props.max) {
      return "max";
    }
  },

  url(value: string, props: InputProps): ValidationResult {
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
      return "url";
    }
  },

  email(value: string, props: InputProps): ValidationResult {
    // Simple email validation
    // http://stackoverflow.com/questions/742451/what-is-the-simplest-regular-expression-to-validate-emails-to-not-accept-them-bl
    if (!isNullOrUndefined(value) && !/^(\S+@\S+)?$/.test(value)) {
      return "email";
    }
  },

  pattern(value: string, props: InputProps): ValidationResult {
    let { pattern } = props;
    if (!isNullOrUndefined(value) && pattern) {
      if (pattern[0] !== "^") {
        pattern = "^" + pattern;
      }
      if (pattern[pattern.length - 1] !== "$") {
        pattern += "$";
      }
      if (!new RegExp(pattern).test(value)) {
        return "pattern";
      }
    }
  },

  maxLength(value: string, props: InputProps): ValidationResult {
    const { maxLength } = props;
    if (!isNullOrUndefined(value) && value.length > maxLength) {
      return "maxLength";
    }
  },
};
/**
 * Return a subset of actions that are applicable to a BoundComponent, given its properties
 * For example, for an element with [required, type=number, min=5] this method would return
 * [required, number_min]
 */
export function filterActionsForProps({
  type,
  ...props
}: InputProps): ValidationAction<any>[] {
  const result: ValidationAction<any>[] = [];
  result.push(ValidationActions[type]);
  for (const prop of ["required", "min", "max", "pattern", "maxLength"]) {
    result.push(ValidationActions[`${type}_${prop}`]);
    result.push(ValidationActions[prop]);
  }
  return result.filter((action) => !!action);
}
