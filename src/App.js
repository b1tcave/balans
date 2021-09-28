import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row } from "react-bootstrap";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Monthly from "./Monthly";

function App() {
    return (
        <Container fluid>
            <Router>
                <div>
                    <Link to="/generated">Generated</Link> |{" "}
                    <Link to="/generated/coefficients">
                        Generated coefficients
                    </Link>
                </div>
                <div>
                    <Link to="/actual">Actual</Link> |{" "}
                    <Link to="/actual/coefficients">Actual coefficients</Link>
                </div>
                <div>
                    <Link to="/difference">Difference</Link> |{" "}
                    <Link to="/difference/coefficients">
                        Difference in coefficients
                    </Link>
                </div>
                <Switch>
                    <Route
                        path="/:view/:showCoefficients?"
                        component={Monthly}
                    />
                </Switch>
            </Router>
        </Container>
    );
}

export default App;
