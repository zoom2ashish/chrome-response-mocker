const chromeLauncher =  require('chrome-launcher');
const chromeRemoteInterface = require('chrome-remote-interface');
const atob = require('atob');
const btoa = require('btoa');
const { configurationRepository }  = require('../configuration-repository/configuration-repository-service');

async function main() {
  const chrome = await chromeLauncher.launch({
    // startingUrl: '', // Specify starting URL if needed
    chromeFlags: [
      '--user-data-dir=/tmp/chrome-testing',
      '--auto-open-devtools-for-tabs'
    ]
  });

  const { Runtime, Network, Fetch } = await chromeRemoteInterface({ port: chrome.port });

  await Promise.all([
    Runtime.enable(),
    Network.enable(),
    Fetch.enable()
  ]);

  Fetch.requestPaused(async ({ requestId, request, resourceType, responseStatusCode, responseErrorReason }) => {
    const config = configurationRepository.findConfig(request, resourceType, responseStatusCode);
    if (!config || (config.intercept === 'Response' && !responseStatusCode)) {
      Fetch.continueRequest({ requestId })
      return;
    }

    if (Array.isArray(config.methods) && config.methods.length > 0 && !config.methods.includes(request.method)) {
      Fetch.continueRequest({ requestId })
      return;
    }

    const newResponse = config.response;
    if (!newResponse) {
      Fetch.continueRequest({ requestId })
      return;
    }

    const applyAfter = config.applyAfterRequestNumber || 0;
    config.requestNumber = (config.requestNumber || 0) + 1;

    if (config.requestNumber <= applyAfter ) {
      Fetch.continueRequest({ requestId })
      return;
    }

    Fetch.fulfillRequest({
      requestId,
      responseCode: newResponse.code,
      body: btoa(newResponse.body)
    });
  });
}

// Start Main function
main();