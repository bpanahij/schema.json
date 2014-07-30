'use strict';

/**
 * @ngdoc service
 * @name schemajsonApp.debounce
 * @description
 * # debounce
 * Service in the schemajsonApp.
 */
angular.module('schemajsonApp')
  .service('debounce', [
    '$timeout',
    function debounce($timeout) {
      /**
       * calling fn once after timeout no matter how many calls made, within timeout
       */
      return function (fn, timeout, apply) {
        timeout = angular.isUndefined(timeout) ? 0 : timeout;
        apply = angular.isUndefined(apply) ? true : apply;
        var nthCall = 0;
        // intercepting fn
        return function () {
          var that = this;
          var argz = arguments;
          nthCall++;
          var later = (function (version) {
            return function () {
              if (version === nthCall) {
                return fn.apply(that, argz);
              }
            };
          })(nthCall);
          return $timeout(later, timeout, apply);
        };
      };
    }]);
