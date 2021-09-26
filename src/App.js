import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row } from "react-bootstrap";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Daily from "./Daily";
import Monthly from "./Monthly";

function App() {
    return (
        <Container fluid>
            <Router>
                <div>
                    <Link to="/daily">Daily</Link> |{" "}
                    <Link to="/monthly">Monthly</Link>
                </div>
                <Switch>
                    <Route path="/daily">
                        <Daily />
                    </Route>
                    <Route path="/monthly">
                        <Monthly />
                    </Route>
                </Switch>
            </Router>
        </Container>
    );
}

export default App;
