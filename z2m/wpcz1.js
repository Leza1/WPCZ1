/**
 * @fileoverview  External converter for the WPCZ1 device, used with Zigbee2MQTT.
 *
 * @company       Leza Technology Co., Ltd
 * @project       Water Pump Controller Zigbee 1
 * @author        Le Phuoc Thanh (lpthanh2@gmail.com)
 * @version       1.0.3
 * 
 * @description
 * Provides device-specific handling for WPCZ1 to enable proper functionality within
 * the Zigbee2MQTT ecosystem.
 */

const m = require('zigbee-herdsman-converters/lib/modernExtend');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const e = exposes.presets;
const ea = exposes.access;

// Shared constants
const formatNumber = value =>
  value <= 0 ? 0 : value < 10 ? value.toFixed(2) : value < 100 ? value.toFixed(1) : value.toFixed(0);

function getStateData(source, val) {
  switch (source) {
    case 0: return `REMOTE COMMAND`;
    case 1: return `FLOAT SWITCH`;
    case 2: return `LOCAL BUTTON`;
    case 3: return `OVERLOAD ${val}W`;
    case 4: return `OVERHEAT ${val}°C`;
    default: return {};
  }
}

const actionLookup = {
  0: 'HOLD',
  1: 'SINGLE',
  2: 'DOUBLE',
  3: 'TRIPPLE',
  255: 'RELEASE',
};

// Clusters
const onOffCluster = {
  cluster: "genOnOff",
  type: ["attributeReport", "readResponse"],
  convert: (_, msg) => {
    const payload = {};

    if (msg.data.onOff !== undefined) {
      payload.state = msg.data.onOff === 1 ? 'ON' : 'OFF';
    }

    const data = msg.data['61440'];
    if (data !== undefined) {
      const val = (data >> 16) & 0xFFFF;
      const source = (data >> 8) & 0xFF;
      payload.trigger_source = getStateData(source, val);
    }

    return payload;
  },
};

const onOffSetConverter = tz.on_off;

const binaryInputCluster = {
  cluster: 'genBinaryInput',
  type: ['attributeReport', 'readResponse'],
  convert: (_, msg) => 'presentValue' in msg.data
    ? { Switch: msg.data.presentValue === 1 ? 'ON' : 'OFF' }
    : {},
};

const multiStateInputCluster = {
  cluster: 'genMultistateInput',
  type: ['attributeReport', 'readResponse'],
  convert: (_, msg) => 'presentValue' in msg.data
    ? { Button: actionLookup[msg.data.presentValue] || 'UNKNOWN' }
    : {},
};

const deviceTempCluster = fz.device_temperature;

const analogInputCluster = {
  cluster: 'genAnalogInput',
  type: ['attributeReport', 'readResponse'],
  convert: (_, msg) => {
    const val = msg.data.presentValue;
    if (val === undefined) return {};
    const formatted = formatNumber(val);
    switch (msg.endpoint.ID) {
      case 4: return { power: formatted };
      case 5: return { current: formatted };
      default: return {};
    }
  },
};

const readAttributes = {
  key: ['power', 'current'],
  convertGet: async (entity, key, meta) => {
    const endpoint = meta.device.getEndpoint(key === 'power' ? 4 : 5);
    await endpoint.read('genAnalogInput', ['presentValue']);
  },
};

const lezaBasicCluster = {
  cluster: 'genBasic',
  type: ['attributeReport', 'readResponse'],
  convert: (_, msg) => {
    const data = msg.data['65281'];
    if (!data) return {};

    const payload = {};
    for (const [key, value] of Object.entries(data)) {
      switch (key) {
        case '3': payload.device_temperature = value; break;
        case '5': payload.outlet_activation_count = value; break;
        case '99':
          const val = (value >> 16) & 0xFFFF;
          const source = (value >> 8) & 0xFF;
          const state = value & 0xFF;
          payload.state = state === 1 ? 'ON' : 'OFF';
          payload.trigger_source = getStateData(source, val);
          break;
        case '100': payload.Switch = value === 1 ? 'ON' : 'OFF'; break;
        case '101': payload.Button = actionLookup[value] || 'UNKNOWN'; break;
        case '149': payload.energy = value; break;
        case '150': payload.voltage = formatNumber(value); break;
        case '151': payload.current = formatNumber(value); break;
        case '152': payload.power = formatNumber(value); break;
      }
    }

    console.debug(`zhc:leza Processed data into payload ${JSON.stringify(payload)}`);
    return payload;
  },
};

// Definition
const definition = {
  zigbeeModel: ["WPCZ1"],
  model: "WPCZ1",
  vendor: "LEZA",
  description: "Water Pump Controller",
  fromZigbee: [
    onOffCluster,
    binaryInputCluster,
    multiStateInputCluster,
    deviceTempCluster,
    analogInputCluster,
    lezaBasicCluster
  ],
  toZigbee: [onOffSetConverter, readAttributes],
  configure: async (device, coordinatorEndpoint) => {
    await reporting.bind(device.getEndpoint(1), coordinatorEndpoint, ['genDeviceTempCfg', 'genBasic']);
    await reporting.bind(device.getEndpoint(2), coordinatorEndpoint, ['genBinaryInput']);
    await reporting.bind(device.getEndpoint(3), coordinatorEndpoint, ['genMultistateInput']);
    await reporting.bind(device.getEndpoint(4), coordinatorEndpoint, ['genAnalogInput']);
    await reporting.bind(device.getEndpoint(5), coordinatorEndpoint, ['genAnalogInput']);
  },
  exposes: [
    e.switch('On/Off state of the controller'),
    e.text('trigger_source', ea.STATE).withDescription('Trigger source of the current state'),
    e.binary('Switch', ea.STATE, 'ON', 'OFF').withDescription('On/Off state of the float switch'),
    e.enum('Button', ea.STATE, Object.values(actionLookup)).withDescription('Last action (e.g. a button press)'),
    e.device_temperature(),
    e.numeric('power', ea.STATE_GET).withUnit('W').withDescription('Instantaneous measured power'),
    e.numeric('energy', ea.STATE).withUnit('kWh').withDescription('Sum of consumed energy'),
    e.numeric('outlet_activation_count', ea.STATE).withDescription('Total times the outlet has been turned on'),
    e.numeric('voltage', ea.STATE).withUnit('V').withDescription('Measured electrical potential value'),
    e.numeric('current', ea.STATE_GET).withUnit('A').withDescription('Instantaneous measured electrical current')
  ],
  ota: true,
};

module.exports = definition;