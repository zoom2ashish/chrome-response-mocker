const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { configurationRepository } = require('./configuration-repository-service');

const port = process.env.PORT || 4300;

// Add JSON BodyParser middleware in express
app.use(bodyParser.json());

/**
 * Returns all configuration
 */
app.get('/config', (req, res,  next) => {
  res.send(configurationRepository.listConfig())
})

app.post('/config', (req, res) => {
  try {
    const data = req.body;
    const configObject = configurationRepository.addConfig(data);
    res.send(configObject);
  } catch(e) {
    res.status(500).send(e.message);
  }
});

app.get('/config/:id', (req, res) => {
  const id  = +req.params.id;
  const config = configurationRepository.findById(id);
  if (config) {
    res.send(config);
  } else {
    res.status(404).send('Not found');
  }
});

app.put('/config/:id', (req, res) => {
  const id  = +req.params.id;
  const newConfig = req.body;
  const config = configurationRepository.updateConfig(id, newConfig);
  if (config) {
    res.send(config);
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(port, () => {
  console.log(`Server started on port at http://localhost:${port}`);
});