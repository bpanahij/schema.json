'use strict';

/**
 * @ngdoc service
 * @name schemajsonApp.apiResponseHandler
 * @description
 * # apiResponseHandler
 * Service in the schemajsonApp.
 */
angular.module('schemajsonApp')
  .service('apiResponseHandler', [
    '$location',
    '$q',
    'base64',
    'apiResponseConfig',
    function apiResponseHandler($location, $q, base64, apiResponseConfig) {
      var REDIRECT_CODE = 300;
      var ERROR_CODE = 400;
      var httpHandlers = {};
      /**
       * Set the Headers with response data
       * @param response
       */
      httpHandlers.getAuth = function (response) {
        var endpointConfig = apiResponseConfig()
          , headers = response.headers()
          , token = null;
        // Check for headers that tell the client how to authenticate
        if (angular.isDefined(headers['username']) && angular.isDefined(headers['token'])) {
          token = base64.encode(headers['username'] + ':' + headers['token']);
          endpointConfig.token = token;
          sessionStorage.token = token;
        }
        return response;
      };
      /**
       * Set the Token Header
       *
       * @param config
       * @returns {*}
       */
      httpHandlers.setTokenHeader = function (config) {
        var endpointConfig = apiResponseConfig();
        if (angular.isUndefined(config.headers)) {
          config.headers = {};
        }
        config.headers.Token = endpointConfig.token;
        return config;
      };
      /**
       * Intercepting Responses
       *
       * Interceptor returning a function that accepts a promise,
       * and returns a callback to the success and other methods
       */
      return {
        request: function (config) {
          return httpHandlers.setTokenHeader(config);
        },
        /**
         * Handling Successful Responses
         *
         * @param response
         * @returns {*}
         */
        response: function (response) {
          return httpHandlers.getAuth(response);
        },
        /**
         * Handling Redirect and Failure Responses
         *
         * @param response
         * @returns {*}
         */
        responseError: function (response) {
          var headers = angular.isDefined(response.headers) ? response.headers() : {};
          httpHandlers.getAuth(response);
          if (response.status >= REDIRECT_CODE && response.status < ERROR_CODE) {
            // Redirect, so that all API clients request new schemas and re-interpolate new data
            $location.path(headers.location);
            return response;
          }
          if (response.status >= ERROR_CODE) {
            return $q.reject(response);
          }
          return response;
        }
      };
    }]).config(['$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('apiResponseHandler');
    }]);
