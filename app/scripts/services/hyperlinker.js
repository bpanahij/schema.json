'use strict';

/**
 * @ngdoc service
 * @name schemajsonApp.hyperLinker
 * @description
 * # hyperLinker
 * Service in the schemajsonApp.
 */
angular.module('schemajsonApp')
  .service('hyperLinker', [
    '$resource',
    '$q',
    '$window',
    '$http',
    '$location',
    function hyperLinker($resource, $q, $window, $http, $location) {
      /**
       * Get the client object from the service
       */
      return function (acceptsHeader) {
        var privateAPI = {}
          , publicAPI = {};
        /**
         * Static Headers that will be reused on each request
         */
        privateAPI.staticHeaders = {
          "Accepts": acceptsHeader,
          "Content-Type": "application/json"
        };
        /**
         * Preventing properties not in schema from being POST/PUT
         * - Validate against link schema
         *
         * @param link
         * @param params
         * @returns {{}}
         */
        privateAPI.sanitizeParams = function (link, params) {
          var payload = {}
            , defaults = {};
          angular.forEach(link.properties, function (propertyConfig, propertyName) {
            // Don't query with any empty property
            if (!angular.isObject(params[propertyName])
              && !angular.isString(params[propertyName])
              && !angular.isNumber(params[propertyName])) {
              return;
            }
            defaults[propertyName] = angular.isDefined(propertyConfig.default) ? propertyConfig.default : null;
          });
          return {
            payload: payload,
            defaults: defaults
          };
        };
        /**
         * Using the angular $resource service to perform a link traversal
         * at this point the link has been broken down into the components needed to generate a resource request
         *
         * @param url
         * @param methods
         * @param method
         * @param defaults
         * @param payload
         * @returns {*}
         */
        privateAPI.resourceURLTraverse = function (url, methods, method, defaults, payload) {
          // Create a Deferred Object
          var deferred = $q.defer();
          // Refresh methods add search params to URIs
          // All other links are traversed in this window
          var resource = $resource(url, defaults, methods);
          resource[method](payload, function (response) {
            // Resolve the promise with the response object, containing data
            deferred.resolve(response);
          }, function (err) {
            // Reject the promise with the err, because the request failed
            deferred.reject(err);
          });
          // return the promise
          return deferred.promise;
        };
        /**
         * Performing an HTTP METHOD to a given link using params for interpolation,
         * but not updating the schema (as traverse does)
         *
         * @param link
         * @param params
         * @param addHeaders
         * @returns {*}
         */
        publicAPI.traverse = function (link, params, addHeaders) {
          var deferred = $q.defer();
          publicAPI.background(link, params, addHeaders).then(function (response) {
            $location.url(url);
            privateAPI.url = url;
            deferred.resolve(response);
          }, function (err) {
            deferred.reject(err);
          });
          return deferred.promise;
        };
        /**
         * Background actions
         * @param link
         * @param params
         * @param addHeaders
         * @returns {*}
         */
        publicAPI.background = function (link, params, addHeaders) {
          var deferred = $q.defer();
          // Dereference link
          var eLink = angular.copy(link)
          // determining the method: GET is default
            , method = link.method ? link.method : 'GET'
            , methods = {}
            , headers = {}
            , paramsToUse = privateAPI.sanitizeParams(eLink, params);
          // compiling all headers, overriding with rightmost having precedent
          angular.extend(headers, privateAPI.staticHeaders, addHeaders);
          // defining endpoint with method and headers
          methods[method] = {
            method: method,
            headers: headers
          };
          // Now doing the link traversal, proxy through resourceURLTraverse method, which does the dirty-work
          privateAPI.resourceURLTraverse(link.href, methods, method, paramsToUse.defaults, paramsToUse.payload).then(function (response) {
            deferred.resolve(response);
          }, function (err) {
            deferred.reject(err);
          });
          return deferred.promise;
        };
      };
    }]);
