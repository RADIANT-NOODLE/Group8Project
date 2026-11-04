import React from "react";
import { Link } from "react-router-dom";

import "./ErrorBoundary.css";


/*
=========================================================
ERROR BOUNDARY

A page that throws used to leave the resident staring at a
blank screen: React unmounts the whole tree. This keeps the
shell and the sidebar usable and says what happened.

`App.jsx` keys this component on the current path, so
navigating somewhere else clears the error and mounts the
next page fresh.
=========================================================
*/

class ErrorBoundary extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            error: null
        };

        this.handleRetry = this.handleRetry.bind(this);
    }


    static getDerivedStateFromError(error) {

        return { error };
    }


    componentDidCatch(error, info) {

        /*
        The console is the only reporting this app has; the
        component stack is what makes it worth reading.
        */

        console.error(
            "A VALORA page failed to render:",
            error,
            info?.componentStack
        );
    }


    handleRetry() {

        this.setState({ error: null });
    }


    render() {

        if (!this.state.error) {

            return this.props.children;
        }


        return (

            <div className="error-boundary">

                <div className="error-boundary-card">

                    <span className="error-boundary-eyebrow">
                        SOMETHING WENT WRONG
                    </span>

                    <h2>
                        This page could not be displayed
                    </h2>

                    <p>
                        The rest of VALORA is still working. You can
                        try again, or go back to your dashboard.
                    </p>

                    <div className="error-boundary-actions">

                        <button
                            type="button"
                            className="error-boundary-button"
                            onClick={this.handleRetry}
                        >
                            Try again
                        </button>

                        <Link
                            to="/dashboard"
                            className="error-boundary-link"
                        >
                            Back to dashboard
                        </Link>

                    </div>

                </div>

            </div>

        );
    }
}


export default ErrorBoundary;
