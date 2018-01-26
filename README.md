# homebridge-minimal-http-blinds (forked)

### What is it?

**homebridge-minimal-http-blinds** is a minimalistic HTTP blinds or roller shutters management plugin for homebridge.

The features:
- You can control your own blinds/roller shutters apparatus with three minimalistic HTTP requests.
- The control is not a simple binary open/close: **it support percentages**. You can open your blinds at 50% or 65% for instance.
- Your blinds can still be manually operated. As long at the `get_current_position_url` returns the right value, this plugin will update iOS Home app periodically.

### How to use it

#### 1] Install it into your homebridge instance

````bash
npm install -g homebridge-minimal-http-blinds
````

#### 2] Minimal configuration

Here is an homebridge's `config.json` with the minimal valid configuration:

````json
{
    "accessories": [
        {
            "name": "Kitchen Blinds",
            "accessory": "MinimalisticHttpBlinds",
  
            "get_current_position_url": "http://192.168.1.55/get/current_position/",
            "set_target_position_url": "http://192.168.1.55/set/%position%"
        }
  
    ]
}
````

#### 3] More configuration

There are more configuration options.  
The names are self-descriptive.  
Here are them all with their default values.

````
{
    "get_current_position_method": "GET",
    "set_target_position_method": "POST",
    
    "get_current_position_polling_millis": "500",
}
````

#### 4] Protocol requirements

The three URLs specified in the accessory configuration must have the following data formats:

##### 4.1] `get_current_position_url`

This URL must return the current blinds position **in plaintext**, from 0 to 100.  
(0 being closed and 100 opened)

##### 4.2] `set_target_position_url`

This URL must trigger the blinds movement. The requested opening position is, once again, an integer from 0 to 100 (0 being closed and 100 opened).
Please note that the target position is passed **directly in the URL**. (It's the `%position%` placeholder)  
