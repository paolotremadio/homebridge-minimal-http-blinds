const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('homebridge-minimal-http-blinds/api');

module.exports = (host, port, hooks) => {
  const app = express();

  app.disable('x-powered-by');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  app.get('/status', async (req, res) => {
    debug('GET /status');
    const status = await hooks.getStatus();
    res.json({ success: true, status});
  });

  app.post('/position', async (req, res) => {
    const { position } = req.body;
    debug(`POST /position -- ${position}`);

    await hooks.setPosition(position);
    res.json({ success: true });
  });

  app.listen(port, host, () => debug(`API running on ${host}:${port}`));
};
