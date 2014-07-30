'use strict';

describe('Service: apiResponseHandler', function () {
  var apiResponseHandler
    , apiResponseConfig
    , $httpBackend
    , httpProvider;
  beforeEach(function () {
    module('schemajsonApp', function ($httpProvider) {
      httpProvider = $httpProvider;
    });

    inject(function (_apiResponseHandler_, _apiResponseConfig_) {
      apiResponseHandler = _apiResponseHandler_;
      apiResponseConfig = _apiResponseConfig_;
    });

    inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');
    })
  });
  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be defined', inject(function () {
    expect(!!apiResponseHandler).toBe(true);
  }));

  it('should contain handler', function () {
    expect(httpProvider.interceptors).toContain('apiResponseHandler');
  });

  it('should intercept redirect and set new location', inject(function ($http, $location, $browser) {
    spyOn($location, 'path');
    $httpBackend.expectGET('/api/v1/tests').respond(302, {}, {
      'location': '/api/v1/tests2'
    });
    $http.get('/api/v1/tests');
    $httpBackend.flush();
    $browser.poll();
    expect($location.path).toHaveBeenCalledWith('/api/v1/tests2');
  }));

  it('should intercept redirect and set new location', inject(function ($http, $location, $browser) {
    $httpBackend.expectGET('/api/v1/tests').respond(302, {}, {
      'location': '/api/v1/tests2'
    });
    $http.get('/api/v1/tests');
    $httpBackend.flush();
    $browser.poll();
    expect($location.path()).toEqual('/api/v1/tests2');
  }));

  it('should send back response to error callback', inject(function ($http) {
    $httpBackend.expectGET('/api/v1/tests').respond(400, {});
    $http.get('/api/v1/tests').then(function(response) {
      expect(response.status).toEqual(400);
    }, function(response) {
      expect(response.status).toEqual(400);
    });
    $httpBackend.flush();
  }));

  it('should get the token from the response (base64 encoding username and token), and add it to all future requests', inject(function ($http, base64) {
    $httpBackend.expectGET('/api/v1/tests').respond(302, {}, {
      'location': '/api/v1/tests2',
      'token': 1234,
      'username': 'brian'
    });
    $http.get('/api/v1/tests');
    $httpBackend.flush();
    expect(apiResponseConfig().token).toEqual(base64.encode('brian' + ':' + '1234'));
    $httpBackend.expectGET('/api/v1/tests', function(headers) {
      return headers['Token'] === base64.encode('brian' + ':' + '1234');
    }).respond(200, {});
    $http.get('/api/v1/tests');
    $httpBackend.flush();
  }));
});
