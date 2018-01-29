const request = require('request');

let Service;
let Characteristic;

/**
 * About WindowCover position: 100 is fully open, 0 is fully closed
 */
class MinimalisticHttpBlinds {
  constructor(log, config) {
    this.log = log;

    // Required parameters
    this.getCurrentPositionUrl = config.get_current_position_url || '';
    this.setTargetPositionUrl = config.set_target_position_url || '';

    // Optional parameters: HTTP methods
    this.getCurrentPositionMethod = config.get_current_position_method || 'GET';
    this.setTargetPositionMethod = config.set_target_position_method || 'POST';

    // Optional parameters: polling times
    this.currentPositionPollingInterval =
      parseInt(config.get_current_position_polling_millis, 10) || 500;

    // Internal fields
    this.lastKnownPosition = null;
    this.currentPositionTimer = null;

    this.targetPosition = null;

    this.windowCoveringService = new Service.WindowCovering(this.name);

    this.windowCoveringService
      .getCharacteristic(Characteristic.CurrentPosition)
      .on('get', this.getCurrentPosition.bind(this));

    this.windowCoveringService
      .getCharacteristic(Characteristic.TargetPosition)
      .on('get', this.getTargetPosition.bind(this))
      .on('set', this.setTargetPosition.bind(this));

    // Initialise accessories, update both CurrentPosition and TargetPosition
    this.currentPositionTimerAction(true);
    this.log(`Polling blind state every ${this.currentPositionPollingInterval}ms`);
  }

  getServices() {
    return [this.windowCoveringService];
  }

  getCurrentPosition(callback) {
    callback(null, this.lastKnownPosition);
  }

  startCurrentPositionTimer() {
    this.stopCurrentPositionTimer();

    this.currentPositionTimer = setTimeout(
      this.currentPositionTimerAction.bind(this),
      this.currentPositionPollingInterval,
    );
  }

  currentPositionTimerAction(updateTargetPosition) {
    request(
      {
        url: this.getCurrentPositionUrl,
        method: this.getCurrentPositionMethod,
        timeout: 15000,
      },
      (error, response, body) => {
        if (error) {
          this.log(`Error in getting current position: ${body} -- ${error.toString()}`);
          this.startCurrentPositionTimer();
          return;
        }

        const position = parseInt(body, 10);

        if (isNaN(position)) { // eslint-disable-line
          this.log(`Error in getting current position: ${body}`);
        } else {
          this.setLastKnownPosition(position);

          if (updateTargetPosition) {
            this.windowCoveringService
              .getCharacteristic(Characteristic.TargetPosition)
              .setValue(position);
          }
        }

        this.startCurrentPositionTimer();
      },
    );
  }

  stopCurrentPositionTimer() {
    if (this.currentPositionTimer) {
      clearTimeout(this.currentPositionTimer);
    }
  }

  static getPositionDescription(value) {
    if (value === 100) {
      return 'open';
    } else if (value === 0) {
      return 'closed';
    } else if (value === 50) {
      return 'half open';
    }

    return `${value}%`;
  }

  setLastKnownPosition(value) {
    if (isNaN(value)) { // eslint-disable-line
      this.log(`Error setting current position: ${value}`);
      return;
    }

    if (this.lastKnownPosition !== value) {
      if (this.lastKnownPosition === null) {
        this.log(`Setting initial position: ${this.constructor.getPositionDescription(value)}`);
      } else {
        this.log(`Blind has moved, new position: ${this.constructor.getPositionDescription(value)}`);
      }

      this.windowCoveringService
        .getCharacteristic(Characteristic.CurrentPosition)
        .setValue(value);
    }

    this.lastKnownPosition = value;
  }

  getTargetPosition(callback) {
    callback(null, this.targetPosition);
  }

  setTargetPosition(position, callback) {
    this.targetPosition = position;

    this.log(`Requested new position: ${this.constructor.getPositionDescription(position)}`);
    this.stopCurrentPositionTimer();

    request(
      {
        url: this.setTargetPositionUrl.replace('%position%', position),
        method: this.setTargetPositionMethod,
        timeout: 15000,
      },
      (error, response, body) => {
        if (error) {
          this.log(`Error setting the new position: ${body} -- ${error.toString()}`);
          return;
        }

        this.setLastKnownPosition(position);
        this.startCurrentPositionTimer();
        callback(null);
      },
    );
  }
}

module.exports = (homebridge) => {
  Service = homebridge.hap.Service; // eslint-disable-line
  Characteristic = homebridge.hap.Characteristic; // eslint-disable-line
  homebridge.registerAccessory('homebridge-minimal-http-blinds', 'MinimalisticHttpBlinds', MinimalisticHttpBlinds);
};
