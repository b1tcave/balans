import { useState } from "react";
import Big from "big.js";
import c from "classnames";
import { Container, Row, Col, Table, Card } from "react-bootstrap";
import {
    generisiProfilPotrosnje,
    izracunajTipMernogMesta,
    getPeriod
} from "./lib/profilPotrosnje";
import { getKoeficijenti } from "./lib/profilPotrosnje/koeficijenti";
import {
    startOfMonth,
    dateAdd,
    dateAverage,
    isWorkDay,
    daysInMonth,
    getDow
} from "./lib/dateutils";
import { isNationalHoliday } from "./lib/praznici";
import { primeri } from "./lib/profilPotrosnje/primeri";
import { getSum, getSumOfSums as getTotal } from "./utils";
import Box from "./Box";
import "./Monthly.css";

function Monthly({
    match: {
        params: { view = "generated", showCoefficients = false }
    }
}) {
    const [primerIndex, setPrimerIndex] = useState(0);
    const primer = primeri[primerIndex];
    const profil = generisiProfilPotrosnje(primer.params);
    const tipMernogMesta = izracunajTipMernogMesta(primer.params);
    const obracunskiPeriodStart = dateAdd(
        startOfMonth(
            dateAverage(primer.params.startDate, primer.params.endDate)
        ),
        1,
        "days"
    );
    const days = daysInMonth(obracunskiPeriodStart);
    console.log(profil);

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
                                }}
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
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Table bordered hover size="sm" className="monthly--table">
                        <thead>
                            <th></th>
                            {[...Array(25)].map((_, hourIndex) => (
                                <th>{hourIndex + 1}</th>
                            ))}
                        </thead>
                        <tbody>
                            {[...Array(days)].map((_, dayIndex) => {
                                const date = dateAdd(
                                    obracunskiPeriodStart,
                                    dayIndex,
                                    "days"
                                );
                                const isSunday = getDow(date) === 0;
                                const isHoliday = isNationalHoliday(date);
                                const radni = !(isSunday || isHoliday);

                                const { Kw, Krd, Knd } = getKoeficijenti({
                                    Kp: primer.params.Kp,
                                    tipMernogMesta,
                                    datum: date
                                });
                                const K = radni ? Krd : Knd;

                                const actualDailySum = getSum(
                                    primer.result[dayIndex]
                                );
                                let maxDifference = 0;
                                profil.forEach((day, dayIndex) => {
                                    day.forEach((hour, hourIndex) => {
                                        const diff =
                                            primer.result[dayIndex]?.[
                                                hourIndex
                                            ] - hour;
                                        maxDifference = Math.max(
                                            Math.abs(diff),
                                            maxDifference
                                        );
                                    });
                                });
                                return (
                                    <tr key={dayIndex + 1}>
                                        <th
                                            className={c(
                                                isSunday && "nedelja",
                                                isHoliday && "praznik"
                                            )}
                                        >
                                            <abbr title={date}>
                                                {dayIndex + 1}
                                            </abbr>
                                        </th>
                                        {[...Array(25)].map((_, hourIndex) => {
                                            const generated =
                                                profil[dayIndex]?.[hourIndex] ||
                                                0;
                                            const actual =
                                                primer.result[dayIndex]?.[
                                                    hourIndex
                                                ] || 0;
                                            const difference =
                                                actual - generated;
                                            const value = {
                                                generated,
                                                actual,
                                                difference: difference.toFixed(
                                                    3
                                                )
                                            };
                                            const Kg = K[hourIndex] || 0;
                                            const Ka =
                                                (actual / actualDailySum) * 100;

                                            const coefficients = {
                                                generated: Kg.toFixed(3),
                                                actual: Ka.toFixed(3),
                                                difference: (Kg - Ka).toFixed(3)
                                            };
                                            const item = showCoefficients
                                                ? coefficients
                                                : value;
                                            const level =
                                                parseInt(
                                                    Math.abs(
                                                        (difference /
                                                            maxDifference) *
                                                            5
                                                    )
                                                ) +
                                                    difference ==
                                                0
                                                    ? 0
                                                    : 1;
                                            console.log(
                                                difference,
                                                maxDifference,
                                                level
                                            );
                                            return (
                                                <td
                                                    className={`monthly--range-${level}`}
                                                >
                                                    <abbr
                                                        title={`generated: ${item.generated}, actual: ${item.actual}, diff: ${item.difference}`}
                                                    >
                                                        {showCoefficients
                                                            ? coefficients[view]
                                                            : value[view]}
                                                    </abbr>
                                                </td>
                                            );
                                        })}
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

export default Monthly;
