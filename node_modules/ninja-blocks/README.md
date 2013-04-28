Node Ninja Blocks
===
A simple library to help interacting with the Ninja Blocks Platform.

## Installation
```
npm install ninja-blocks
```

## OAuth 2 Usage
```javascript
var ninjaBlocks = require('ninja-blocks');
// ACCESS_TOKEN acquired via OAuth
var ninja = ninjaBlocks.app({access_token:ACCESS_TOKEN});

ninja.devices(function(err,devices) {
  // ...
});
```

## User Access Token Usage
```javascript
var ninjaBlocks = require('ninja-blocks');
// USER_ACCESS_TOKEN acquired via settings page in Ninja Cloud
var ninja = ninjaBlocks.app({user_access_token:USER_ACCESS_TOKEN});

ninja.devices(function(err,devices) {
  // ...
});
```

## API Overview

### User
```javascript
// Fetch a user's profile anyformation
ninja.user(function(err, data) { ... }); 

// Fetch a user's activity stream
ninja.user().stream(function(err,data){ ... }) 

// Fetch a user's pusher channel
ninja.user().pusher_channel(function(err,data){ ... }) 
```

### Device
```javascript
/**
 * Fetch all the user's device details.
 * Optionally if an object is passed as the first argument,
 * it will filter by the parameters. If a string is provided, 
 * it will assume it's the device type intended for filtering. 
 *
 * NOTE: The returned data is in the form guid => meta data
 * You will need the guid for all the other device commands.    
 */
ninja.devices(function(err, data) { ... });
ninja.devices({ device_type:'rgb_led' },function(err,data){ ... })
ninja.devices({ vid:0, shortName:'On Board RGB LED' },function(err,data){ ... })

// Fetch one device's details
ninja.device(guid).fetch(function(err,data) { ... });

// Send `command` to device `guid`
ninja.device(guid).actuate(command,function(err) { ... }) 

// Subscribe to a device's data feed. Ninja Blocks will POST the requested
// device's data to the `url` provided here.
// Optionally `overwrite`s an existing callback `url`
ninja.device(guid).subscribe(url,overwrite,function(err) { ... }) 

// Unubscribe from a device's data feed.
ninja.device(guid).unsubscribe(function(err) { ... }) 

// Fetch any historical data about this device. Optionally specify the period's `start` and `end` timestamp.
ninja.device(guid).data(start, end, function(err, data) { ... })

// Fetch the last heartbeat received by this device.
ninja.device(guid).last_heartbeat(function(err, data) { ... })
```

### Helpers
```javascript
// Returns found subdevices within a set of devices
ninja.utils.findSubDevice({ shortName: 'Lamp On' }, deviceSet);
```
This is by no means exhaustive, and more functionality will be forthcoming.


## Example
```javascript

var _ = require('underscore');
var ninjaBlocks = require('ninja-blocks');
// Use the API Access Token from https://a.ninja.is/hacking
var ninja = ninjaBlocks.app({user_access_token:USER_ACCESS_TOKEN});


// Get the most recent temperature reading from all temperature sensors
ninja.devices({ device_type: 'temperature' }, function(err, devices) {
    _.each(devices, function(device,guid){
        ninja.device(guid).last_heartbeat(function(err, data) { 
            console.log(device.shortName+' is '+data.DA+'C');
        })
    })
});

// Execute an RF command by name - turn a "Lamp Off" 
ninja.devices({ device_type: 'rf433' }, function(err, devices) {
    var lamps = ninja.utils.findSubDevice({ shortName: 'Lamp Off' }, devices);
    _.each(lamps, function(lamp){
        ninja.device(lamp.guid).actuate(lamp.data) 
    })
});
