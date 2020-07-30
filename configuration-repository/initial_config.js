const config = [
  {
    id: 1,
    pattern: "*/api/test/error",
    partial: true,
    methods: [ 'GET' ],
    enabled: true,
    intercept: 'Request',
    response: {
      code: 400,
      body: JSON.stringify({
        error_code: 10000,
        error_message: "Mock error response.",
        error_details: "Detailed error response",
      })
    }
  },
  {
    id: 2,
    pattern: "*/api/test/success",
    partial: true,
    methods: [ 'GET' ],
    enabled: true,
    intercept: 'Request',
    response: {
      code: 200,
      body: 'Success Response from Mock Server'
    }
  }
];

module.exports = config;
