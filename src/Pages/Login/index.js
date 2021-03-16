import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { loginUser, useAuthState, useAuthDispatch } from '../../Context';
import styles from './login.module.css';

function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useAuthDispatch();
    const { loading, errorMessage } = useAuthState();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            let response = await loginUser(dispatch, { email, password });
            if (!response.user) return;
            props.history.push('/dashboard');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginForm}>
				<div style={{marginLeft: "auto", marginRight: "auto"}}>
				<img src="/medical-services.png" height="150" width="184" alt="Member Portal"></img>
				</div>
                
                <Typography variant="body1">&nbsp;</Typography>
                <form>
                    <div>
                        <TextField style={{backgroundColor: "#fff", width: "100%"}}
                            id="email"
                            label="Username"
                            value={email}
                            variant="outlined"
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}/>
                        <Typography variant="body1">&nbsp;</Typography>
                        <TextField style={{backgroundColor: "#fff", width: "100%"}}
                            id="password"
                            type="password"
                            label="Password"
                            value={password}
                            variant="outlined"
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}/>
                        <Typography variant="body1">&nbsp;</Typography>
                        <Button style={{width: "100%"}}
							variant="contained" 
							color="primary" 
							onClick={handleLogin} 
							disabled={loading}>Login</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
