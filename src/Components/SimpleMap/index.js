/*
 * Base Google Map example
 */
import React, { useState } from 'react';
import GoogleMap from 'google-map-react';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';
import IconButton from '@material-ui/core/IconButton';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Tooltip from '@material-ui/core/Tooltip';

function SimpleMap(props) {
    let currentUser = localStorage.getItem('currentUser') ?
        JSON.parse(localStorage.getItem('currentUser')).user : null;
    let currentUserLocation = currentUser ? currentUser.currentLocation : null;
    const [currentUserCenter] = useState([
        Number(currentUserLocation.coordinates[1]["$numberDouble"]),
        Number(currentUserLocation.coordinates[0]["$numberDouble"])
    ]);
    const [currentCenter, setCurrentCenter] = useState(currentUserCenter);
    const [currentZoom, setCurrentZoom] = useState(8);

    const onBoundsChange = (center, zoom) => {
        onCenterChange(center);
        onZoomChange(zoom);
    };

    const onCenterChange = (center) => {
        if (currentCenter[0] === center[0] && currentCenter[1] === center[1]) {
            return;
        }
        setCurrentCenter(center);
    };

    const onZoomChange = (zoom) => {
        if (currentZoom === zoom) {
            return;
        }
        setCurrentZoom(zoom);
    };

    // Ignore the console warning -- if you rename "onBoundsChange" to "onChange" the map won't render!!
    // "GoogleMap: onBoundsChange is deprecated, use onChange({center, zoom, bounds, ...other}) instead."

    return (
        <div style={{width: "100%", height: "400px", marginTop: "2px"}}>
            <GoogleMap
                bootstrapURLKeys={{key: process.env.REACT_APP_GOOGLE_MAP_API_KEY}}
                center={currentCenter}
                zoom={currentZoom}
                onBoundsChange={onBoundsChange}>
                <Tooltip title={currentUser.name} lat={currentUserCenter[0]} lng={currentUserCenter[1]}>
                    <IconButton color="primary">
                        <AccountCircleRoundedIcon />
                    </IconButton>
                </Tooltip>
                {props.events && props.events.length > 0 && props.events.map((event, index) => {
                    return (
                        <Tooltip 
                            title={event.Event} key={index}
                            lat={Number(event.coordinates[1]["$numberDouble"])}
                            lng={Number(event.coordinates[0]["$numberDouble"])}>
                            <IconButton
                                style={{color: "#fe2c27"}}>
                                <LocationOnIcon />
                            </IconButton>
                        </Tooltip>
                    )
                })}
            </GoogleMap>
        </div>
    );
}

export default SimpleMap;