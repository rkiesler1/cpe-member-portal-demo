import React, { useState, useEffect } from 'react';
import { useAuthDispatch, logout, useAuthState } from '../../Context';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import SimpleMap from '../../Components/SimpleMap';
import styles from './dashboard.module.css';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TemporaryDrawer from '../../Components/TemporaryDrawer';
import { TextField, Typography } from '@material-ui/core';

const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: "#E5F2F6",
        color: theme.palette.common.black,
        fontWeight: 700,
        borderBottom: "2px solid #007fcc"
    },
    body: {
        fontSize: 14
    },
}))(TableCell);

const StyledTablePagination = withStyles((theme) => ({
    root: {
        border: "1px solid #e0e3e5",
        background: "#f2f3f3"
    }
}))(TablePagination);

function Dashboard(props) {
    const dispatch = useAuthDispatch();
    const userDetails = useAuthState();
    const [eventList, setEventList] = useState([]);
    //const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    // TODO: update user prefs in database
    const handleLogout = () => {
        logout(dispatch);
        props.history.push('/login');
    };

    const requestOptions = {
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json",
            "Accept": "application/json"
        })
    };

    const handleSubmit = () => {
        if (!!searchTerm) {
            fetch(
                `${process.env.REACT_APP_EVENT_SEARCH_SERVICE_URL}?q=${searchTerm}&coordinates=[${userDetails.user.currentLocation.coordinates[0]["$numberDouble"]},${userDetails.user.currentLocation.coordinates[1]["$numberDouble"]}]&radius=${userDetails.user.prefs && userDetails.user.prefs.eventRadius ? userDetails.user.prefs.eventRadius["$numberInt"] : 100}${userDetails.user.prefs && userDetails.user.prefs.filters ? '&filters=' + encodeURIComponent(userDetails.user.prefs.filters) : ''}`,
                requestOptions
            )
            .then(res => res.json())
            .then(response => {
                console.log(JSON.stringify(response, null, 2));
                setEventList(response);
                setPage(0);
                //setIsLoading(false);
            })
            .catch(error => console.log(error));
        }
    };

    const onSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // get the events within desired distance from current location
    useEffect(() => {
        fetch(
            `${process.env.REACT_APP_EVENT_LIST_SERVICE_URL}?coordinates=[${userDetails.user.currentLocation.coordinates[0]["$numberDouble"]},${userDetails.user.currentLocation.coordinates[1]["$numberDouble"]}]&radius=${userDetails.user.prefs && userDetails.user.prefs.eventRadius ? userDetails.user.prefs.eventRadius["$numberInt"] : 100}${userDetails.user.prefs && userDetails.user.prefs.filters ? '&filters=' + encodeURIComponent(userDetails.user.prefs.filters) : ''}`,
            requestOptions
        )
        .then(res => res.json())
        .then(response => {
            console.log(JSON.stringify(response, null, 2));
            setEventList(response);
            //setIsLoading(false);
        })
        .catch(error => console.log(error));
    }, []);

    const renderDateRange = (event) => {
        const shortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let startDate = new Date(Number(event.Start["$date"]["$numberLong"]));
        let endDate = new Date(Number(event.End["$date"]["$numberLong"]));
        let dateRange;

        if (startDate.getFullYear() === endDate.getFullYear() &&
            startDate.getMonth() === endDate.getMonth() &&
            startDate.getDate() < endDate.getDate()) {
            dateRange = startDate.getDate() + '-' + endDate.getDate() + ' ' +
                shortNames[endDate.getMonth()] + ' ' + startDate.getFullYear();
        } else if (startDate.getFullYear() === endDate.getFullYear() &&
            startDate.getMonth() === endDate.getMonth() &&
            startDate.getDate() === endDate.getDate()) {
            dateRange = startDate.getDate() + ' ' +
                shortNames[endDate.getMonth()] + ' ' + startDate.getFullYear();
        } else if (startDate.getFullYear() === endDate.getFullYear() &&
            startDate.getMonth() < endDate.getMonth()) {
            dateRange = startDate.getDate() + ' ' +
                shortNames[startDate.getMonth()] + ' - ' +
                endDate.getDate() + ' ' + shortNames[endDate.getMonth()] +
                ' ' + startDate.getFullYear();
        } else if (startDate.getFullYear() < endDate.getFullYear()) {
            if (startDate.getMonth > endDate.getMonth()) {
                dateRange = startDate.getDate() + ' ' + shortNames[startDate.getMonth()] +
                    ' ' + startDate.getFullYear() + ' - ' + endDate.getDate() + ' ' +
                    shortNames[endDate.getMonth()] + ' ' + startDate.getFullYear()
            }
        }
        return (
            <div>{dateRange}</div>
        );
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const columns = [
        { id: 'event', label: 'Event', minWidth: 170 },
        { id: 'when', label: 'When', minWidth: 100 },
        {
            id: 'where',
            label: 'Where',
            minWidth: 170
        },
        {
            id: 'category',
            label: 'Category',
            minWidth: 170
        },
        {
            id: 'rating',
            label: 'Rating',
            minWidth: 170,
            align: 'right',
            format: (value) => value.toFixed(1),
        },
    ];

    return (
        <div style={{ padding: 10 }}>
            <div className={styles.dashboardPage}>
                <Grid container spacing={1} className={styles.searchBarContainer}>
                    <Grid item xs={2}>
                        <img src="/medical-services.png" height="150" alt="Member Portal"></img>
                    </Grid>
                    <Grid item xs={7}>
                        <form onSubmit={e => { e.preventDefault(); handleSubmit() }}>
                            <TextField 
                                className={styles.searchBar}
                                fullWidth={true}
                                type="search"
                                label="Search by event name or category..."
                                margin="normal"
                                variant="outlined"
                                onChange={onSearchTermChange}></TextField>
                        </form>
                    </Grid>
                    <Grid item xs={2} style={{paddingTop: "1.6em"}}>
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            color="primary"
                            size="large"
                            onClick={() => { /* call some func */ }}>Search</Button>
                    </Grid>
                    <Grid item xs={1}>
                        <div style={{marginLeft: "auto", marginRight: "auto", position: "absolute"}}>
                            <TemporaryDrawer></TemporaryDrawer>
                            <div className={styles.logout}>
                                <Link href="#" onClick={handleLogout}>
                                    Logout
                                </Link>
                            </div>
                        </div>
                    </Grid>
                </Grid>                                
            </div>
            <div className={styles.dashboardMain}>
                <Paper>
                    <TableContainer style={{ maxHeight: 347 }}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <StyledTableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth }}
                                        >
                                            {column.label}
                                            {eventList && eventList.length > 0 && !!eventList[0].score && column.label === 'Rating' ? ' / Score' : ''}
                                        </StyledTableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {eventList && eventList.length > 0 && eventList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((event, index) => {
                                    return (
                                        <TableRow hover={true} role="checkbox" tabIndex={-1} key={index}>
                                            <TableCell style={{ verticalAlign: 'top' }}>
                                                <Typography style={{ fontWeight: "500" }}>{event.Event}</Typography>
                                                <Typography variant="body2" style={{ color: "#335aa1" }}>{event.Type}</Typography>
                                            </TableCell>
                                            <TableCell style={{ verticalAlign: 'top' }}>
                                                {renderDateRange(event)}
                                            </TableCell>
                                            <TableCell style={{ verticalAlign: 'top' }}>
                                                {event.City}, {event.State}
                                            </TableCell>
                                            <TableCell style={{ verticalAlign: 'top' }}>
                                                {event.Category.map((cat, index) => {
                                                    return (<span key={index} className={styles.catRect}>{cat}</span>)
                                                })}
                                            </TableCell>
                                            <TableCell align="right" style={{ verticalAlign: 'top' }}>
                                                <Typography>{event.Rating ? (event.Rating["$numberDouble"] ? event.Rating["$numberDouble"] : (event.Rating["$numberInt"] ? Number(event.Rating["$numberInt"]).toFixed(1) : 'Unrgit commitated')) : 'Unrated'}</Typography>
                                                <Typography variant="body2" style={{color:"#999999"}}>{!!event.score ? `Score: ${Number(event.score["$numberDouble"]).toFixed(2)}` : ''}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <StyledTablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={eventList.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={handleChangePage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                </Paper>
                <SimpleMap events={eventList}></SimpleMap>
            </div>
        </div>
    );
}

export default Dashboard;
