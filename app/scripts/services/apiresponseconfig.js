'use strict';

/**
 * @ngdoc service
 * @name schemajsonApp.apiResponseConfig
 * @description
 * # apiResponseConfig
 * Service in the schemajsonApp.
 */
angular.module('schemajsonApp')
  .service('apiResponseConfig', [function apiResponseConfig() {
    var Config = {};
    return function() {
      return Config;
    };
  }]);
