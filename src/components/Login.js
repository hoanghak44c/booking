import React from 'react';
import { Redirect, Link } from "react-router-dom";
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import * as firebase from "firebase";

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = { username: '', password: '', auth: false};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({[name]: value});
    }

    handleSubmit(event) {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(() => {
                return firebase.auth().signInWithEmailAndPassword(this.state.username, this.state.password)
                .then(() => {
                    this.setState({auth: true});
                    alert('Login success!');
                })
                .catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    alert(errorCode + ' - ' + errorMessage);
                });    
            })
        event.preventDefault();
    }

    componentDidMount() {
        // do some thing here
    }

    componentWillUnmount() {
        // do some thing here
    }

    render() {
        if (firebase.auth().currentUser) {
            return <Redirect to={{pathname: "/"}} />;
        }
        
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <div className='wrap'>
                        <h4>Login</h4>
                        <div id="input-container">
                            <div className="e-float-input">
                                <input type="text" name="username" value={this.state.username} required onChange={this.handleChange} />
                                <span className="e-float-line"></span>
                                <label className="e-float-text">Enter user name </label>
                            </div>
                            <div className="e-float-input">
                                <input type="password" name="password" value={this.state.password} required onChange={this.handleChange}/>
                                <span className="e-float-line"></span>
                                <label className="e-float-text">Enter password </label>
                            </div>
                            <ButtonComponent cssClass='e-primary'>Login</ButtonComponent>
                            <Link id="register" to="/register">Register new user</Link>
                        </div>
                    </div>
                </form>
            </div> 
        )
    }
}
export default Login;
