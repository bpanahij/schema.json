'use strict';

/**
 * @ngdoc service
 * @name schemajsonApp.apiController
 * @description
 * # apiController
 * Service in the schemajsonApp.
 */
angular.module('schemajsonApp').service('apiController', [
  'schemaResources',
  'apiResponseHandler',
  function apiController(schemaResources) {
    var privateAPI = {
      resources: {}
    }, publicAPI = {

    };
    /**
     *
     */
    privateAPI.angularify = function (url) {
      schemaResources.makeResources(url)
        .then(schemaResources.resourcify)
        .then(function (rawResources) {
          privateAPI.resources = rawResources;
        });
      $http.get(url).then(function() {

      });
    };
    /**
     *
     */
    privateAPI.fetchResources = function() {
      angular.forEach(privateAPI.resources, function(resource) {
        resource.get();
      });
    }
  }]);
