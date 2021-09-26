import { useState, useEffect } from "react";
import c from "classnames";
import { Container, Row, Col, Table, Card } from "react-bootstrap";
import {
    generisiProfilPotrosnje,
    izracunajTipMernogMesta,
    getPeriod
} from "./lib/profilPotrosnje";
import { getKoeficijenti } from "./lib/profilPotrosnje/koeficijenti";
import { startOfMonth, dateAdd, isWorkDay, getDow } from "./lib/dateutils";
import { isNationalHoliday } from "./lib/praznici";
import { primeri } from "./lib/profilPotrosnje/primeri";
import { getSumOfSums as getTotal } from "./utils";
import Box from "./Box";

const dani = [
    "nedelja",
    "ponedeljak",
    "utorak",
    "sreda",
    "cetvrtak",
    "petak",
    "subota"
];

function Test() {
    const [primerIndex, setPrimerIndex] = useState(0);
    const [dayIndex, setDayIndex] = useState(0);
    const [profil, setProfil] = useState([]);
    const primer = primeri[primerIndex];
    const generated = profil[dayIndex] || [];
    const actual = primer.result[dayIndex];
    const firstDayOfMonth = startOfMonth(primer.params.startDate);
    const date = dateAdd(firstDayOfMonth, dayIndex + 1, "days");
    const period = getPeriod(date);
    const isHoliday = isNationalHoliday(date);
    const radni = isWorkDay(date);
    const tipMernogMesta = izracunajTipMernogMesta(primer.params);
    const { Kw, Krd, Knd } = getKoeficijenti({
        Kp: primer.params.Kp,
        tipMernogMesta,
        datum: date
    });
    const Kd = radni ? Krd : Knd;
    const dailyTotalGenerated = generated.reduce(
        (total, value) => total + value,
        0
    );
    const dailyTotalActual = actual.reduce((total, value) => total + value, 0);

    useEffect(() => {
        setProfil(generisiProfilPotrosnje(primer.params));
    }, [primerIndex]);

    return (
        <Container>
            <Row>
                <Col>
                    <Box>
                        <h2>{primer.description}</h2>
                        <div>
                            testing primer{" "}
                            <input
                                type="number"
                                value={primerIndex + 1}
                                min={1}
                                max={primeri.length}
                                onChange={e => {
                                    setPrimerIndex(
                                        Math.max(
                                            0,
                                            Math.min(
                                                e.target.value - 1,
                                                primeri.length - 1
                                            )
                                        )
                                    );
                                    setDayIndex(0);
                                }}
                            />{" "}
                            day{" "}
                            <input
                                type="number"
                                value={dayIndex + 1}
                                min={1}
                                max={primer.result.length}
                                onChange={e =>
                                    setDayIndex(
                                        Math.max(
                                            0,
                                            Math.min(
                                                e.target.value - 1,
                                                primer.result.length - 1
                                            )
                                        )
                                    )
                                }
                            />
                        </div>
                    </Box>
                    <Card>
                        <Card.Body>
                            <h4>Parametri</h4>
                            <Table size="sm">
                                <tbody>
                                    <tr>
                                        <th>startDate</th>
                                        <td>{primer.params.startDate}</td>
                                    </tr>
                                    <tr>
                                        <th>endDate</th>
                                        <td>{primer.params.endDate}</td>
                                    </tr>
                                    <tr>
                                        <th>date</th>
                                        <td>{date}</td>
                                    </tr>
                                    <tr>
                                        <th>Wm</th>
                                        <td>{primer.params.Wm}</td>
                                    </tr>
                                    <tr>
                                        <th>Wm sum (generated/actual)</th>
                                        <td>
                                            {getTotal(profil)}/
                                            {getTotal(primer.result)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Wdaily</th>
                                        <td>
                                            {dailyTotalGenerated.toFixed(3)}/
                                            {dailyTotalActual.toFixed(3)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Wvt</th>
                                        <td>{primer.params.Wvt}</td>
                                    </tr>
                                    <tr>
                                        <th>Wnt</th>
                                        <td>{primer.params.Wnt}</td>
                                    </tr>
                                    <tr>
                                        <th>Pmax</th>
                                        <td>{primer.params.Pmax}</td>
                                    </tr>
                                    <tr>
                                        <th>Tip</th>
                                        <td>{tipMernogMesta}</td>
                                    </tr>
                                    <tr>
                                        <th>Period</th>
                                        <td>{period}</td>
                                    </tr>
                                    <tr>
                                        <th>Dan</th>
                                        <td>{dani[getDow(date)]}</td>
                                    </tr>
                                    <tr>
                                        <th>Praznik?</th>
                                        <td>{isHoliday ? "Da" : "Ne"}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Table bordered hover size="sm">
                        <thead>
                            <th>Hour</th>
                            <th>Generated</th>
                            <th>Actual</th>
                            <th>Difference</th>
                            <th>Coeff</th>
                        </thead>
                        <tbody>
                            {actual.map((k, index) => {
                                const value = generated[index];
                                const razlika = value - k;
                                return (
                                    <tr
                                        key={index}
                                        className={c(
                                            Math.abs(razlika) > 0.0005
                                                ? "bg-danger"
                                                : "bg-success",
                                            "text-white"
                                        )}
                                    >
                                        <td>{index + 1}</td>
                                        <td>
                                            <abbr title={value}>
                                                {value?.toFixed(3)}
                                            </abbr>
                                        </td>
                                        <td>{k}</td>
                                        <td>
                                            <abbr title={razlika}>
                                                {razlika.toFixed(3)}
                                            </abbr>
                                        </td>
                                        <td>{Kd[index]}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}

export default Test;
