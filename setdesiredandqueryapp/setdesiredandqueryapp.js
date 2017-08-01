'use strict';
 var iothub = require('azure-iothub');
 var uuid = require('node-uuid');
 var connectionString = '[iothubowner]';
 var registry = iothub.Registry.fromConnectionString(connectionString);

 var DeviceId = 'SoarTestFirstNodeDev';

// Step 2 Start
var queryTwins = function() {
     var query = registry.createQuery("SELECT * FROM devices WHERE deviceId = " + DeviceId, 100);
     query.nextAsTwin(function(err, results) {
         if (err) {
             console.error('Failed to fetch the results: ' + err.message);
         } else {
             console.log("queryTwins...");
             results.forEach(function(twin) {
                 var desiredConfig = twin.properties.desired.telemetryConfig;
                 var reportedConfig = twin.properties.reported.telemetryConfig;
                 console.log("Config report for: " + twin.deviceId);
                 console.log("(SSet)Desired: ");
                 console.log(JSON.stringify(desiredConfig, null, 2));
                 console.log("(SGet)Reported: ");
                 console.log(JSON.stringify(reportedConfig, null, 2));
             });
         }
     });
 };
// Step 2 End

 registry.getTwin(DeviceId, function(err, twin){
     if (err) {
         console.error(err.constructor.name + ': ' + err.message);
     } else {
         var newConfigId = uuid.v4();
         var newFrequency = process.argv[2] || "5m";
         var patch = {
             properties: {
                 desired: {
                     telemetryConfig: {
                         configId: newConfigId,
                         sendFrequency: newFrequency
                     }
                 }
             }
         }
         twin.update(patch, function(err) {
             if (err) {
                 console.error('Could not update twin: ' + err.constructor.name + ': ' + err.message);
             } else {
                 console.log(twin.deviceId + ' twin updated successfully');
             }
         });
         setInterval(queryTwins, 10000);
     }
 });
