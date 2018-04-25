import React from 'react';
import { NavLink, Link, Redirect, withRouter } from "react-router-dom";
import * as firebase from "firebase";

const NavItem = props => {
    const pageURI = window.location.pathname + window.location.search
    const liClassName = (props.path === pageURI) ? "nav-item active" : "nav-item";
    const aClassName = props.disabled ? "nav-link disabled" : "nav-link"
    return (
        <li className={liClassName}>
            <NavLink to={props.path} className={aClassName}>
                {props.name}
                {(props.path === pageURI) ? (<span className="sr-only">(current)</span>) : ''}
            </NavLink>
        </li>
    );
}

const AuthButton = withRouter(
    ({ history }) =>
        firebase.auth().currentUser ? (
            <NavLink to={{ pathname: "/" }} className="nav-link"
                onClick={() => {
                    firebase.auth().signOut().then(function () {
                        // Sign-out successful.
                        history.push("/");
                    }).catch(function (error) {
                        // An error happened.
                    });
                }}>
                Welcome {firebase.auth().currentUser.email}! Sign out
      </NavLink>
        ) : (
                <NavLink to={{ pathname: "/" }} className="nav-link">
                    Hi Guess, you can login here
                </NavLink>
            )
);


class NavDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isToggleOn: false
        };
    }

    showDropdown(e) {
        e.preventDefault();
        this.setState(prevState => ({
            isToggleOn: !prevState.isToggleOn
        }));
    }

    render() {
        const classDropdownMenu = 'dropdown-menu' + (this.state.isToggleOn ? ' show' : '')
        return (
            <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="/" id="navbarDropdown" role="button" data-toggle="dropdown"
                    aria-haspopup="true" aria-expanded="false"
                    onClick={(e) => { this.showDropdown(e) }}>
                    {this.props.name}
                </a>
                <div className={classDropdownMenu} aria-labelledby="navbarDropdown">
                    {this.props.children}
                </div>
            </li>
        )
    }
}  

class Navigation extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand" href="/">Booking</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto">
                        <NavItem path="/" name="Home" />
                        <NavItem path="/about" name="About" />

                        {/* <NavDropdown name="Dropdown">
                            <a className="dropdown-item" href="/">Action</a>
                            <a className="dropdown-item" href="/">Another action</a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item" href="/">Something else here</a>
                        </NavDropdown>                         */}
                    </ul>
                    <AuthButton />

                    {/* <form className="form-inline my-2 my-lg-0">
                        <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
                        <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                    </form> */}
                </div>
            </nav>
        )
    }
  }
export default Navigation;
