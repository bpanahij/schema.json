'use strict';

/**
 * @ngdoc service
 * @name schemajsonApp.schemaResources
 * @description
 * # schemaResources
 * Service in the schemajsonApp.
 */
angular.module('schemajsonApp')
  .service('schemaResources', [
    '$resource',
    '$q',
    '$http',
    function schemaResources($resource, $q, $http) {
      /**
       * Get the client object from the service
       */
      var privateAPI = {}
        , publicAPI = {};
      /**
       * Use an accept: application/schema+json header to get the JSON-Hyper Schema
       * @param url
       * @returns {*}
       */
      privateAPI.getSchema = function (url) {
        return $http({
          method: 'OPTIONS',
          url: url,
          headers: {
            Accept: 'application/schema+json'
          }
        });
      };
      /**
       * Generate Angular $resource(s) from schema(JSON)
       *
       * @param resources
       * @param schema
       * @returns {*}
       */
      publicAPI.generateResourceParams = privateAPI.generateResourceParams = function (resources, schema, resourcePath) {
        if (!schema) {
          return [];
        }
        if (!angular.isArray(resourcePath)) {
          resourcePath = [];
        }
        angular.forEach(schema.links, function (link) {
          var resource = {};
          resource.defaultParams = {};
          resource.url = link.href.replace(/{(.*?)}/g, ":$1");
          var atParams = resource.url.match(/:([a-zA-Z_]*)[^\/]*/g);
          if (angular.isArray(atParams)) {
            var atProperties = atParams.map(function (atParam) {
              return atParam.replace(/:/g, '');
            });
            atProperties.forEach(function(property) {
              resource.defaultParams[property] = "@" + property;
            });
          }
          if (link.schema) {
            resource.required = [];
            if (angular.isDefined(link.required)) {
              resource.required = link.required
            }
            resource.properties = [];
            angular.forEach(link.schema.properties, function (config, property) {
              // configure the default values
              if (angular.isDefined(config.default)) {
                resource.defaultParams[property] = config.default;
              }
              // Identify the identity property
              if (config.identity) {
                resource.defaultParams[property] = "@" + property;
              }
              // Catalogue the available properties
              resource.properties.push(property);
            });
          }
          resources[link.rel] = {
            url: resource.url,
            properties: resource.properties,
            required: resource.required,
            defaults: resource.defaultParams,
            atParams: resource.atParams,
            path: resourcePath
          };
        });
        // Re-curse through sub-properties
        angular.forEach(schema.properties, function (config, property) {
          var resPathCopy = angular.copy(resourcePath);
          var resPathCopy2 = angular.copy(resourcePath);
          resPathCopy.push(property);
          privateAPI.generateResourceParams(resources, config, resPathCopy);
          resPathCopy2.push(property);
          privateAPI.generateResourceParams(resources, config.items, resPathCopy2);
        });
      };
      /**
       * Using the OPTIONS & accepts method on a URL to find schema
       *
       * @param url
       * @returns {*}
       */
      publicAPI.makeResources = function (url) {
        var deferred = $q.defer();
        privateAPI.getSchema(url).success(function (schema) {
          var resources = {};
          privateAPI.generateResourceParams(resources, schema, []);
          deferred.resolve(resources);
        }).error(function (err) {
          deferred.reject(err);
        });
        return deferred.promise;
      };
      /**
       * Convert arrays into $resources
       *
       * @param resourceConfigs
       * @param data
       */
      publicAPI.resourcify = function (resourceConfigs, data) {
        var resources = {};
        angular.forEach(resourceConfigs, function (resourceConfig, rel) {
          var smashedData = angular.copy(data)
            , resourceData = angular.copy(data);
          angular.forEach(resourceConfig.path, function (segment) {
            smashedData = angular.extend(smashedData, smashedData[segment]);
            resourceData = resourceData[segment];
          });
          var setupData = {};
          if (resourceConfig.properties) {
            setupData = resourceConfig.properties.map(function (property) {
              return smashedData[property];
            });
          }
          var defaults = angular.extend(setupData, resourceConfig.defaults)
            , resource = $resource(resourceConfig.url, defaults);
          resources[rel] = {
            resource: resource,
            data: resourceData
          };
          console.log('resource', resourceConfig.url, JSON.stringify(angular.extend(setupData, resourceConfig.defaults)));
        });
        return resources;
      };
      return publicAPI;
    }
  ]);
