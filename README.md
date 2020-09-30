# Weather-Forecast-Comparison-App-React-Native

iOS app for comparing weather forecast with historical data built with [react-native](https://facebook.github.io/react-native/).
The source code is published for knowledge sharing purposes.

# Demo
<table>
    <tr>
        <td><a href="https://www.youtube.com/watch?v=Z0eKfLKoo7w"><img src="http://i.giphy.com/Ow17HWlGTmtfG.gif" alt="Weather-App-React-Native"/></a></td>
        <td><a title="iOS app for comparing weather forecast with historical data" href="https://itunes.apple.com/us/app/zowni/id1140299292?ls=1&mt=8"><img src="http://i.imgur.com/VWmlW7M.png" alt="Get invite on Apple TestFlight"/></a></td>
    </tr>
</table>


* [View full screencast on YouTube](https://www.youtube.com/watch?v=Z0eKfLKoo7w)
* [Download from AppStore](https://itunes.apple.com/us/app/zowni/id1140299292?ls=1&mt=8)


# Used components

* react-native
* redux
* d3.js (interpolate, scale, shape)
* react-native-svg

Check `package.json` for details.

# Used API

* [DarkSky](https://darksky.net/dev/) for weather forecast and historical data
* [Mapbox](https://www.mapbox.com/geocoding/) for city search

# Install

* clone repository
* type`$ npm install`
* create file `./credentials.json`

```
{
    "DARK_SKY_API_KEY": "{DARK_SKY_API_KEY}",
    "MAPBOX_API_KEY": "{MAPBOX_API_KEY}"
}
```
* setup FacebookSDK as [described here](https://github.com/facebook/react-native-fbsdk)
* type `$ ./node_modules/.bin/react-native link`

Then you can follow [react-native docs to run on device](https://facebook.github.io/react-native/docs/running-on-device-ios.html#content). Or just [download it from AppStore](https://itunes.apple.com/us/app/zowni/id1140299292?ls=1&mt=8) and try.
