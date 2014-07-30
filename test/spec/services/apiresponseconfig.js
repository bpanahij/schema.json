'use strict';

describe('Service: apiResponseConfig', function () {

  // load the service's module
  beforeEach(module('schemajsonApp'));

  // instantiate service
  var apiResponseConfig;
  beforeEach(inject(function (_apiResponseConfig_) {
    apiResponseConfig = _apiResponseConfig_;
  }));

  it('should do something', function () {
    expect(!!apiResponseConfig).toBe(true);
  });

});
