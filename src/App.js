import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Navigation from './components/Navigation';
import Login from './components/Login';
import Register from './components/Register';
import Bookings from './components/Bookings';
import * as firebase from "firebase";

const About = () => (
    <div>
        <h2>About</h2>
    </div>
);

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={props =>
        firebase.auth().currentUser ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
  
class App extends React.Component {
    constructor(props) {
        super(props);
        this.config = {
            apiKey: "AIzaSyCBfVnluPrytgqsS2lWtBBTfGQZhKbmXlg",
            authDomain: "bookingsystem-681a4.firebaseapp.com",
            databaseURL: "https://bookingsystem-681a4.firebaseio.com",
            projectId: "bookingsystem-681a4",
            storageBucket: "bookingsystem-681a4.appspot.com",
            messagingSenderId: "24528569279"
          };
        if (!firebase.apps.length) {
            firebase.initializeApp(this.config);
        }
    }
    render() {
      return (
          <Router>
              <div>
                  <Navigation />
                  <div className="container">
                    <PrivateRoute exact path="/" component={Bookings} />            
                    <Route exact path="/login" component={Login} />            
                    <Route path="/about" component={About} />            
                    <Route path="/register" component={Register} />            
                    <PrivateRoute path="/bookings" component={Bookings} />            
                  </div>
              </div>
          </Router>
      )
  }
}

export default App;
