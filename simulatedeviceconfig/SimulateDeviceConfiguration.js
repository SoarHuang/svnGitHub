/*
https://portal.azure.com/
aopenkani1070@outlook.com
@open04openmind

HostName=aopenapm.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=fJoqs8uI7sBebUu3cuzskPuXVUNCgsjn10TKV1apUiE=
HostName=aopenapm.azure-devices.net;DeviceId=SoarTestFirstNodeDev;SharedAccessKey=PDdUWsQRmAzd0zMNfOXxpSsdmk5vEpkbYcKQ5C40N48=
*/

'use strict';
 var Client = require('azure-iot-device').Client;
 var Protocol = require('azure-iot-device-mqtt').Mqtt;

 var connectionString = '[device]';
 var client = Client.fromConnectionString(connectionString, Protocol);

 // Step 2 Start
 var initConfigChange = function(twin) {
     var currentTelemetryConfig = twin.properties.reported.telemetryConfig;
     currentTelemetryConfig.pendingConfig = twin.properties.desired.telemetryConfig;
     currentTelemetryConfig.status = "Pending";

     var patch = {
     telemetryConfig: currentTelemetryConfig
     };
     twin.properties.reported.update(patch, function(err) {
         if (err) {
             console.log('Could not report properties');
         } else {
             console.log('Reported pending config change: ' + JSON.stringify(patch));
             setTimeout(function() {completeConfigChange(twin);}, 60000);
         }
     });
 }

 var completeConfigChange =  function(twin) {
     var currentTelemetryConfig = twin.properties.reported.telemetryConfig;
     currentTelemetryConfig.configId = currentTelemetryConfig.pendingConfig.configId;
     console.log('##Soar##'+ currentTelemetryConfig.configId);
     currentTelemetryConfig.sendFrequency = currentTelemetryConfig.pendingConfig.sendFrequency;
     currentTelemetryConfig.status = "Success";
     delete currentTelemetryConfig.pendingConfig;

     var patch = {
         telemetryConfig: currentTelemetryConfig
     };
     patch.telemetryConfig.pendingConfig = null;

     twin.properties.reported.update(patch, function(err) {
         if (err) {
             console.error('Error reporting properties: ' + err);
         } else {
             console.log('Reported completed config change: ' + JSON.stringify(patch));
         }
     });
 };
 // Step 2 End

 client.open(function(err) {
     if (err) {
         console.error('could not open IotHub client');
     } else {
         client.getTwin(function(err, twin) {
             if (err) {
                 console.error('could not get twin');
             } else {
                 console.log('retrieved device twin');
                 twin.properties.reported.telemetryConfig = {
                     configId: "0",
                     sendFrequency: "24h"
                 }
                 twin.on('properties.desired', function(desiredChange) {
                     console.log("received change: "+JSON.stringify(desiredChange));
                     var currentTelemetryConfig = twin.properties.reported.telemetryConfig;
                     if (desiredChange.telemetryConfig &&desiredChange.telemetryConfig.configId !== currentTelemetryConfig.configId) {
                         initConfigChange(twin);
                     }
                 });
             }
         });
     }
 });
