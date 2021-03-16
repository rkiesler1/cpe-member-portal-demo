import React, { useState, useEffect } from 'react';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import styles from './temporarydrawer.module.css';

function TemporaryDrawer() {
    const [input, setInput] = useState('');
    const [cities, setCities] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const [catFacets, setCatFacets] = useState(
        localStorage.getItem('eventCategories')
            ? JSON.parse(localStorage.getItem('eventCategories')) : null);
    const [currentUser, updateCurrentUser] = useState(
        localStorage.getItem('currentUser')
            ? JSON.parse(localStorage.getItem('currentUser')).user : null);
    const [currentLocation, setCurrentLocation] = useState(
        currentUser ? currentUser.currentLocation : null);

    const toggleDrawer = (flag) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        if (!flag) {
            handleDrawerClose();
        }
        setIsOpen(flag);
    };

    const updateLocationState = (e) => {
        console.log(e.target.id);
        setCurrentLocation({
            coordinates: [
                {
                    "$numberDouble": e.target.id === "longitude" ?
                        e.target.value : currentLocation.coordinates[0]["$numberDouble"]
                },
                {
                    "$numberDouble": e.target.id === "latitude" ?
                        e.target.value : currentLocation.coordinates[1]["$numberDouble"]
                }
            ]
        });
        if (e.target.id === "distance") {
            updateCurrentUser({
                ...currentUser,
                prefs: {
                    ...currentUser.pref,
                    eventRadius: {"$numberInt": e.target.value}
                }
            });
        }
    }

    const updateLocationAndPrefs = () => {
        let storedUser = localStorage.getItem('currentUser')
            ? JSON.parse(localStorage.getItem('currentUser')) : null;
        if (storedUser) {
            storedUser.user.currentLocation = currentLocation;
            storedUser.user.prefs = currentUser.prefs;
            localStorage.setItem('currentUser', JSON.stringify(storedUser));
            setIsOpen(false);
            // re-query dashboard events?
        } else {
            console.log("User not found in localStorage");
        }
    };

    const updateCategories = () => {
        let storedCategories = localStorage.getItem('eventCategories');
        if (!storedCategories) {
            console.log("categories not found in localStorage");
            localStorage.setItem('eventCategories', JSON.stringify(catFacets));
        } else {
            console.log("found categories in localStorage");
        }
    };

    function handleSubmit() {
        updateLocationAndPrefs();
        updateCategories();
    };

    const requestOptions = {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
            "Accept": "application/json"
        })
    };

    function searchCities() {
        console.log(`fetching cities (q=${input})`);
        fetch(`${process.env.REACT_APP_CITY_AUTOCOMPLETE_URL}?q=${input}`, requestOptions)
        .then(res => res.json())
        .then(response => {
            setCities(response);
            console.log(`Cities retrieved: ${cities.length}`)
        })
        .catch(error => console.log(error));
    };

    const loadCategories = () => {
        if (catFacets && catFacets.length > 0) {
            console.log("Using cached event categories");
        } else {
            console.log(`fetching categories`);
            fetch(`${process.env.REACT_APP_EVENT_CAT_FACET_SERVICE_URL}`, requestOptions)
            .then(res => res.json())
            .then(response => {
                setCatFacets(response[0].categories);
                console.log(`Categories retrieved: ${response[0].categories.length}`);
            })
            .catch(error => console.log(error));
        }
    };

    const handleChange = (category) => {
        if (category.target.type === "checkbox") {
            let newFilters;
            if (category.target.checked) {
                // add new
                newFilters = currentUser.prefs.filters && currentUser.prefs.filters.indexOf(category.target.name) === -1
                    ? [...currentUser.prefs.filters, category.target.name] : [category.target.name];
            } else {
                // remove previously selected
                newFilters = currentUser.prefs.filters.indexOf(category.target.name) >= 0
                    ? currentUser.prefs.filters.filter(item => item !== category.target.name)
                    : currentUser.prefs.filters;
            }
            //setUserPrefs({...userPrefs, filters: newFilters});
            updateCurrentUser({...currentUser, prefs: {...currentUser.prefs, filters: newFilters}});
        }
    };

    const handleDrawerClose = () => {
        updateLocationAndPrefs();
    };

    useEffect(() => {
        loadCategories();
    }, [currentUser]);    

    return (
        <div className={styles.accountBox}>
            <Tooltip title={currentUser.name}>
                <IconButton aria-label="preferences" onClick={toggleDrawer(true)} color="primary">
                    <AccountCircleRoundedIcon />
                </IconButton>
            </Tooltip>
            <Drawer anchor={'right'} open={isOpen} onClose={toggleDrawer(false)}>
                <div className={styles.accountPrefs} role="presentation"
                    onClickXX={toggleDrawer(false)}
                    onKeyDownXX={toggleDrawer(false)}
                >
                    <Typography variant="h6" gutterBottom>Current Location</Typography>
                    <form onSubmit={e => { e.preventDefault(); handleSubmit() }}>
                        <Autocomplete
                            freeSolo
                            style={{ margin: '-5px 0 0 0' }}
                            id="city-search-autocomplete"
                            disableClearable
                            options={cities.length > 0 ? cities.map((option) => option.city + ', ' + option.state_id) : ['']}
                            renderOption={(option, { inputValue }) => {
                                const matches = match(option, inputValue);
                                const parts = parse(option, matches);

                                return (
                                    <div>
                                        {parts.map((part, index) => (
                                            <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                                                {part.text}
                                            </span>
                                        ))}
                                    </div>
                                );
                            }}
                            onInputChange={(ev, newValue) => {
                                searchCities();
                                setInput(newValue);
                                console.log("Selected: " + newValue);
                                if (newValue.trim().length > 0) {
                                    let re = /(.*),\s(\w{2})$/;
                                    if (re.test(newValue.trim())) {
                                        let location = newValue.trim().match(re);
                                        let cityName = location[1];
                                        let stateId = location[2];
                                        let newLocation = cities.filter(city => {
                                            return city.city === cityName &&
                                                city.state_id === stateId;
                                        })[0];
                                        if (newLocation && newLocation.coordinates) {
                                            setCurrentLocation({
                                                coordinates: newLocation.coordinates
                                            });
                                        } else {
                                            console.log(`No match for ${cityName}, ${stateId}`);
                                        }
                                    }    
                                } else {
                                    setCities([]);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search by city and state name..."
                                    margin="normal"
                                    variant="outlined"
                                    InputProps={{ ...params.InputProps, type: 'search' }}
                                />
                            )}
                        />
                    </form>

                    <TextField id="latitude" label="Latitude" style={{width: "100%"}}
                        value={currentLocation.coordinates[1]["$numberDouble"]}
                        onChange={updateLocationState} />
                    <Typography variant="body1">&nbsp;</Typography>
                    <TextField id="longitude" label="Longitude" style={{width: "100%"}}
                        value={currentLocation.coordinates[0]["$numberDouble"]}
                        onChange={updateLocationState} />
                    <Typography variant="body1">&nbsp;</Typography>
                    <TextField id="distance" label="Events distance (miles)" style={{width: "100%"}}
                        type="number"
                        value={currentUser.prefs && currentUser.prefs.eventRadius
                            ? currentUser.prefs.eventRadius["$numberInt"] : 100}
                        onChange={updateLocationState} />
                    <Typography variant="body1">&nbsp;</Typography>
                    <Button variant="contained" color="primary" onClick={handleSubmit} style={{width: "100%"}}>Update</Button>
                    <Typography variant="body1">&nbsp;</Typography>
                    <Typography variant="body2">Geo lookup:&nbsp;
                        <Link href="https://simplemaps.com/data/us-cities" style={{width: "100%"}}>simplemaps.com</Link>
                    </Typography>

                    <Typography variant="body1">&nbsp;</Typography>
                    <Divider/>
                    <Typography variant="body1">&nbsp;</Typography>
                    
                    {(catFacets && catFacets.length > 0) ? <Typography variant="h6" gutterBottom>Event Categories</Typography> : <span>&nbsp;</span>}
                    <table className="facet-table">
                        <tbody>
                        {(catFacets && catFacets.length > 0 && catFacets.map((cat, index) => {
                            return (
                            <tr key={index}>
                                <td>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                icon={<FavoriteBorder />}
                                                checkedIcon={<Favorite />}
                                                onChange={handleChange}
                                                name={cat.name}
                                                checked={currentUser.prefs && currentUser.prefs.filters && currentUser.prefs.filters.indexOf(cat.name) >= 0}
                                                color="primary"
                                            />}
                                        label={cat.name + ' (' + cat.count["$numberInt"] + ')'} />
                                </td>
                            </tr>)
                        })) || <tr><td><div className="loading label"></div></td></tr>}
                        </tbody>
                    </table>

                </div>
            </Drawer>
        </div>
    );
}

export default TemporaryDrawer;
