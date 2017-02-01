# Weather-App-React-Native

iOS app for comparing weather forecast with historical data built with [react-native](https://facebook.github.io/react-native/).

The source code is published for knowledge sharing purposes.

# Demo
![Weather-App-React-Native](http://i.giphy.com/Ow17HWlGTmtfG.gif)

* [Full screencast on YouTube](https://www.youtube.com/watch?v=Z0eKfLKoo7w)
* [Download app through the Apple TestFlight](http://zowni.com)

# Used components

* react-native
* redux
* d3.js (interpolate, scale, shape)
* react-native-svg

Check `package.json` for details  

# Used API

* [DarkSky](https://darksky.net/dev/) for weather forecast and historical data
* [Mapzen](https://mapzen.com/developers/sign_in) for city search

# Install

* clone repo
* type`$ npm install`
* create file `./credentials.json`    

```
{
   "DARK_SKY_API_KEY": "{DARK_SKY_API_KEY}",
   "MAPZEN_API_KEY": "{MAPZEN_API_KEY}"
}
```

Then you can follow [react-native docs to run on device](https://facebook.github.io/react-native/docs/running-on-device-ios.html#content). Or just leave your email at http://zowni.com and get a link to download the app.
