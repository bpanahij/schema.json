'use strict';

describe('Service: apiController', function () {

  // load the service's module
  beforeEach(module('schemajsonApp'));

  // instantiate service
  var apiController;
  beforeEach(inject(function (_apiController_) {
    apiController = _apiController_;
  }));

  it('should do something', function () {
    expect(!!apiController).toBe(true);
  });

});
