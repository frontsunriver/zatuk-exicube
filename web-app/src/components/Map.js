import React from 'react';
import {
    withGoogleMap,
    GoogleMap,
    Marker,
    InfoWindow
  } from "react-google-maps";
  /*global google*/

const Map = withGoogleMap(props =>
  <GoogleMap
    defaultZoom={10}
    defaultCenter={props.mapcenter}
  >
    {props.locations.map(marker => (
        <Marker
            position={{ lat: marker.lat, lng: marker.lng }}
            key={marker.id}
            icon={{
              url: marker.carImage,
              scaledSize:  new google.maps.Size(35,25)
            }}

        >
          <InfoWindow>
            <div>{marker.drivername}<br/>{marker.carnumber}</div>
          </InfoWindow>
        </Marker>
    ))}
  </GoogleMap>
);

export default Map;