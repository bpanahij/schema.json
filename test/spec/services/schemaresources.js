'use strict';

describe('Service: schemaResources', function () {

  // load the service's module
  beforeEach(module('schemajsonApp'));

  // instantiate service
  var schemaResources;
  beforeEach(inject(function (_schemaResources_) {
    schemaResources = _schemaResources_;
  }));

  var $httpBackend;

  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend');
    var schema = {
      "id": "/api/v1/students/{studentId}",
      "$schema": "http://json-schema.org/draft-04/schema#",
      "properties": {
        "studentId": {
          "type": "string"
        },
        "cards": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "cardId": {
                "identify": true,
                "type": "string"
              },
              "type": {
                "type": "string",
                "default": "template"
              }
            },
            "links": [
              {
                "rel": "{cardId}",
                "href": "/api/v1/students/{studentId}/cards/{cardId}",
                "schema": {
                  "type": "object",
                  "properties": {
                    "cardId": {
                      "identity": true,
                      "type": "string"
                    },
                    "type": {
                      "type": "string",
                      "default": "template"
                    }
                  }
                }
              }
            ]
          }
        }
      },
      "links": [
        {
          "rel": "root",
          "href": "/api/v1/students/{studentId}"
        },
        {
          "rel": "self",
          "href": "/api/v1/students/{studentId}"
        },
        {
          "rel": "logout",
          "href": "/api/v1/students/logout"
        }
      ]
    };
    $httpBackend.when('OPTIONS', '/api/v1/tests').respond(schema);
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should retrieve a schema object', function () {
    expect(!!schemaResources).toBe(true);
    schemaResources.makeResources('/api/v1/tests').then(function (resources) {
      expect(resources['{cardId}']['defaults']['cardId']).toBe('@cardId');
      expect(resources['{cardId}']['defaults']['type']).toBe('template');
    });
    $httpBackend.flush();
  });

  it('should create $resources', function () {
    var data = {
      studentId: 123,
      cards: [
        {
          cardId: 1,
          type: 'map'
        },
        {
          cardId: 2,
          type: 'map'
        }
      ]
    };
    expect(!!schemaResources).toBe(true);
    schemaResources.makeResources('/api/v1/tests').then(function (resources) {
      var aResources = schemaResources.resourcify(resources, data);
      expect(aResources['{cardId}'].data).toEqual([
        {
          cardId: 1,
          type: 'map'
        },
        {
          cardId: 2,
          type: 'map'
        }
      ]);
    });
    $httpBackend.flush();
  });

  it('should create $resources that produce correct urls', function () {
    var data = {
      studentId: 123,
      cards: [
        {
          cardId: 1,
          type: 'map'
        },
        {
          cardId: 2,
          type: 'map'
        }
      ]
    };
    expect(!!schemaResources).toBe(true);
    schemaResources.makeResources('/api/v1/tests').then(function (resources) {
      $httpBackend.expectGET('/api/v1/students/123/cards/1').respond(200, {
        studentId: 123,
        cardId: 1,
        type: 'map'
      });
      var aResources = schemaResources.resourcify(resources, data);
      var Resource = aResources['{cardId}'].resource;
      Resource.get({
        studentId: 123,
        cardId: 1
      });
    });
    $httpBackend.flush();
  });

  it('should POST some data', function () {
    var data = {
      studentId: 123,
      cards: [
        {
          cardId: 1,
          type: 'map'
        },
        {
          cardId: 2,
          type: 'map'
        }
      ]
    };
    schemaResources.makeResources('/api/v1/tests').then(function (resources) {
      var aResources = schemaResources.resourcify(resources, data)
        , Resource = aResources['{cardId}'].resource
        , Card = new Resource({
          studentId: 123,
          cardId: 1,
          type: 'map'
        });
      $httpBackend.expectPOST('/api/v1/students/123/cards/1').respond(200, {
        studentId: 123,
        cardId: 1,
        type: 'map'
      });
      Card.type = 'yellow';
      Card.$save();
    });
    $httpBackend.flush();
  });
});
