export const surveyDevice = {
  resourceType: 'Device',
  id: 'welldata-survey-web',
  type: {
    coding: [{
      system: 'http://terminology.hl7.org/CodeSystem/device-type',
      code: 'CommunicatingDevice',
      display: 'Communicating Device'
    }]
  },
  deviceName: [{
    name: 'WellData Survey Web Application',
    type: 'user-friendly-name'
  }],
  version: [{
    value: '1.0.0'
  }],
  status: 'active',
  manufacturer: 'WellData',
  url: 'https://welldata.org'
};

// Device reference for the survey app
export const deviceReference = {
  reference: 'Device/survey-app',
  type: 'Device',
  display: 'Survey Web Application',
  identifier: {
    system: 'urn:ietf:rfc:3986',
    value: 'https://welldata.org/devices/survey-web'
  }
}; 