import { AppConfig } from './config/AppConfig';
import { GoogleMapApiConfig } from './config/GoogleMapApiConfig';

export default {
    name: AppConfig.app_name,
    description: AppConfig.app_description,
    slug: AppConfig.app_name.replace(/ /g,"-").toLowerCase(),
    privacy: "public",
    platforms: [
        "ios",
        "android"
    ],
    notification: {
        icon: "./assets/images/logo96x96.png"
    },
    version: AppConfig.ios_app_version,
    orientation: "portrait",
    icon: "./assets/images/logo1024x1024.png",
    splash: {
        "image": "./assets/images/splash.png",
        "resizeMode": "cover",
        "backgroundColor": "#ffffff"
    },
    updates: {
        "fallbackToCacheTimeout": 0
    },
    assetBundlePatterns: [
        "**/*"
    ],
    packagerOpts: {
        config: "metro.config.js"
    },
    ios: {
        supportsTablet: true,
        usesAppleSignIn: true,
        bundleIdentifier: AppConfig.app_identifier,
        infoPlist: {
            "NSLocationAlwaysUsageDescription": "This app uses the always location access in the background for improved pickups and dropoffs, customer support and safety purpose.",
            "NSLocationAlwaysAndWhenInUseUsageDescription": "This app uses the always location access in the background for improved pickups and dropoffs, customer support and safety purpose.",
            "NSLocationWhenInUseUsageDescription": "For a reliable ride, App collects location data from the time you open the app until a trip ends. This improves pickups, support, and more.",
            "NSCameraUsageDescription": "This app uses the camera to take your profile picture.",
            "NSPhotoLibraryUsageDescription": "This app uses Photo Library for uploading your profile picture.",
            "ITSAppUsesNonExemptEncryption":false,
            "UIBackgroundModes": [
                "location",
                "fetch"
            ]
        },
        config: {
            googleMapsApiKey: GoogleMapApiConfig.ios
        },
        googleServicesFile: "./GoogleService-Info.plist",
        buildNumber: AppConfig.ios_app_version
    },
    android: {
        package: AppConfig.app_identifier,
        versionCode: AppConfig.android_app_version,
        permissions: [
            "CAMERA",
            "READ_EXTERNAL_STORAGE",
            "WRITE_EXTERNAL_STORAGE",
            "ACCESS_FINE_LOCATION",
            "ACCESS_COARSE_LOCATION",
            "CAMERA_ROLL",
            "FOREGROUND_SERVICE",
            "ACCESS_BACKGROUND_LOCATION"
        ],
        googleServicesFile: "./google-services.json",
        config: {
            googleMaps: {
                apiKey: GoogleMapApiConfig.android
            }
        },
        useNextNotificationsApi: true
    },
    "facebookScheme": "fb" + AppConfig.facebookAppId,
    "facebookAppId": AppConfig.facebookAppId,
    "facebookDisplayName": AppConfig.app_name
}
