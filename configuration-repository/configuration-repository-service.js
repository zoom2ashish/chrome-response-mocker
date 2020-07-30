const EventEmitter = require('events');
const _ = require('lodash');
const config = require('./initial_config');

const DEFAULT_CONFIG =   {
  partial: true,
  methods: [ 'PUT', 'GET', 'POST', 'DELETE' ],
  enabled: true,
  intercept: 'Request',
  resourceType: 'XHR',
  response: {
    code: 200,
    body: 'Empty Body'
  }
};

class ConfigurationRepositoryService extends EventEmitter {
  config = [];

  static CONFIG_EVENTS = {
    ADDED: 'CONFIG_ADDED',
    DELETED: 'CONFIG_DELETED',
    UPDATED: 'CONFIG_UPDATED'
  };

  addConfig(config) {
    const interceptConfig = _.merge(_.cloneDeep(DEFAULT_CONFIG), config);
    if (_.isEmpty(interceptConfig.pattern)) {
      throw new Error('URL Pattern cannot be empty');
    }

    if (!interceptConfig.response || !interceptConfig.response.code || !interceptConfig.response.body) {
      throw new Error('Response code and body must be specified');
    }

    interceptConfig.id = (new Date()).getTime();
    this.config.push(interceptConfig);

    super.emit(ConfigurationRepositoryService.CONFIG_EVENTS.ADDED, interceptConfig);

    return interceptConfig;
  }

  updateConfig(id, config) {
    const index = this.config.findIndex(c => {
      return c.id === id;
    });
    if (index === -1) {
      return null;
    }
    const existingConfig = this.config[index];
    const updatedConfig = {...existingConfig, ...config };

    this.config.splice(index, 1, updatedConfig);
    return this.config[index];
  }

  listConfig() {
    return this.config || [];
  }

  deleteConfig(id) {
    this.config = this.config.filter((config) => config.id != id);
    super.emit(ConfigurationManager.CONFIG_EVENTS.DELETED, this.config);
  }
  findById(id) {
    return this.config.find(c => c.id === id);
  }

  findConfig(request) {
    return this.config.find((value) => {
      if (value.partial) {
        const url = value.pattern.trim().replace(/\*/ig, '.*').replace(/\//ig, '\/');
        return (new RegExp(url + '$')).test(request.url);
      } else {
        return request.url == value.pattern;
      }
    }) || null;
  }

}

const configurationRepository = new ConfigurationRepositoryService();
config.forEach(configObject => configurationRepository.addConfig(configObject));

module.exports.configurationRepository = configurationRepository;
