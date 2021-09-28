/*
 * Biblioteka za generisanje profila potršnje na osnovu mesečne potrošnje
 * https://web.archive.org/web/20210922131801/http://www.epsdistribucija.rs/propisi/Pravila_o_Radu_20072017.pdf
 *
 * Profili potrošnje
 *
 * 7.11.1 U slučaju da ne postoje tehničke mogućnosti za registrovanje podataka o
 *   petnaestominutnim opterećenjima, ODS će te podatke za merno mesto
 *   odrediti na osnovu mesečno utrošene električne energije i karakterističnog
 *   dijagrama potrošnje električne energije (profil potrošnje).
 * 7.11.2 Profili potrošnje su iskazani u procentima kao relativno satno
 *   opterećenje u odnosu na dnevnu energiju (Prilog 2).
 * 7.11.3 Profili potrošnje se određuju za karakteristične tipove mernog mesta,
 *   periode tokom kalendarske godine i tipove dana.
 * 7.11.4 Tipovi mernog mesta se utvrđuju za kategorije potrošnje. Kategorije
 *   potrošnje se utvrđuju na osnovu naponskog nivoa na kome je merno mesto i
 *   namene potrošnje.
 * 7.11.5 Periodi tokom godine se definišu uz uvažavanje karakterističnih
 *   klimatskih uslova, privrednih aktivnosti i drugih karakterističnih
 *   pokazatelja.
 * 7.11.6 Tipovi dana se određuju u zavisnosti od dana u sedmici uz uvažavanje
 *   državnih i verskih prazničnih dana.
 * 7.11.7 Dnevna energija definisanih tipova dana i profili potrošnje za te dane
 *   se određuju na osnovu izmerenih satnih opterećenja na mernim mestima koja
 *   po svojim karakteristikama predstavljaju reprezentativne primere za svaki
 *   od tipova mernih mesta.
 * 7.11.8
 *   Definisane su sledeće kategorije potrošnje:
 *   1) Privreda na naponskom nivou iznad 1 kV,
 *   2) Privreda na naponskom nivou do 1 kV, sa merenjem snage,
 *   3) Privreda na naponskom nivou do 1 kV, bez merenja snage,
 *   4) Domaćinstvo,
 *   5) Javno osvetljenje.
 **/
import Big from "big.js";
import { getKoeficijenti } from "./koeficijenti";
import { izracunajTipMernogMesta } from "./tipMernogMesta";
import {
    isWorkDay,
    daysInMonth,
    startOfMonth,
    dateAverage,
    daysBetween,
    dateAdd
} from "../dateutils";
import Debug from "debug";
const debug = Debug("balans");

const generisiProfilPotrosnjeHighPrecision = ({
    Wm, // utrošena električna energija na mesečnom nivou (kWh)
    Wvt, // utrošena energija u višoj tarifi (kWh)
    Wnt, // utrošena energija u nižoj tarifi (kWh)
    Pmax, // mesečna maksimalna petnaestominutna aktivna snaga
    Kb, // kategorija brojila jednotarifno/dvotarifno
    Kp, // kategorija potrošnje
    startDate, // pocetak obracunskog perioda
    endDate // kraj obracunskog perioda
}) => {
    debug("Generating profil potrosnje for %O", {
        Wm, // utrošena električna energija na mesečnom nivou (kWh)
        Wvt, // utrošena energija u višoj tarifi (kWh)
        Wnt, // utrošena energija u nižoj tarifi (kWh)
        Pmax, // mesečna maksimalna petnaestominutna aktivna snaga
        Kb, // kategorija brojila jednotarifno/dvotarifno
        Kp, // kategorija potrošnje
        startDate, // pocetak obracunskog perioda
        endDate // kraj obracunskog perioda
    });
    const result = [];
    // 1. u mesecu pripada prethodnom mesecu
    // vrednosti prvog u mesecu se koriste da se izračuna profil za 2. u mesecu
    const obracunskiPeriodStart = dateAdd(
        startOfMonth(dateAverage(startDate, endDate)),
        1,
        "days"
    );
    console.log(
        startDate,
        endDate,
        daysBetween(startDate, endDate),
        dateAverage(startDate, endDate),
        startOfMonth(dateAverage(startDate, endDate))
    );
    const days = daysInMonth(obracunskiPeriodStart);
    const tipMernogMesta = izracunajTipMernogMesta({
        Wm,
        Wvt,
        Wnt,
        Pmax,
        Kb,
        Kp,
        d: days
    });

    const { Kw } = getKoeficijenti({
        Kp,
        datum: obracunskiPeriodStart,
        tipMernogMesta
    });

    // Izračunaj ukupan broj radnih i neradnih sati u obračunskom periodu
    let Sr = 0,
        Sn = 0;

    // TODO: izvuci ovo u posebnu funkciju
    // Loop through all the dates and calculate total number of workday hours (Sr) and non-workday hours (Sn)
    let datum = obracunskiPeriodStart;
    for (let i = 0; i < days; i++) {
        const { Krd, Knd } = getKoeficijenti({
            Kp,
            datum,
            tipMernogMesta
        });
        const radni = isWorkDay(datum);
        if (radni) {
            Sr += Krd.length;
        } else {
            Sn += Knd.length;
        }
        // sledeci dan
        datum = dateAdd(datum, 1, "day");
    }

    // Loop through all the dates
    datum = obracunskiPeriodStart;
    for (let i = 0; i < days; i++) {
        let { Krd, Knd } = getKoeficijenti({
            Kp,
            datum,
            tipMernogMesta
        });
        // console.log( Kp, datum, tipMernogMesta, koef.reduce((result, value) => result + value, 0));
        const radni = isWorkDay(datum);
        // i - redni broj posmatranog radnog dana u obračunskom periodu za angažovanu balansnu energiju
        // j - redni broj posmatranog neradnog dana u obračunskom periodu za angažovanu balansnu energiju
        // Wri - dnevna potrošnja električne energije u toku radnog dana i
        // Wnj - dnevna potrošnja električne energije u toku neradnog dana j
        // Wm - utrošena električna energija na mesečnom nivou
        // Kw - koeficijent tipa dana
        // Sr - broj sati radnih dana u obračunskom periodu za angažovanu balansnu energiju
        // Sn - broj sati neradnih dana u obračunskom periodu za angažovanu balansnu energiju
        // S - broj sati u posmatranom tržišnom danu
        const koef = radni ? Krd : Knd;
        const S = koef.length;

        // Low precision
        // const W = ((radni ? Kw : 1) * Wm * S) / (Kw * Sr + Sn);
        // result.push(koef.map(k => (k / 100) * W));

        // High precision
        const W = Big(Wm)
            .times(S)
            .times(radni ? Kw : 1)
            .div(
                Big(Kw)
                    .times(Sr)
                    .plus(Sn)
            );
        result.push(
            koef.map(k =>
                Big(k)
                    .times(W)
                    .div(100)
                    .round(3)
                    .toNumber()
            )
        );
        //console.log({ datum, Kw, Wm, S, Sr, Sn, W: W.toNumber(), i, days });

        // sledeci dan
        datum = dateAdd(datum, 1, "day");
    }
    return result;
};

export const generisiProfilPotrosnje = ({
    Wm, // utrošena električna energija na mesečnom nivou (kwh)
    Wvt, // utrošena energija u višoj tarifi (kwh)
    Wnt, // utrošena energija u nižoj tarifi (kwh)
    Pmax, // mesečna maksimalna petnaestominutna aktivna snaga
    Kb, // kategorija brojila jednotarifno/dvotarifno
    Kp, // kategorija potrošnje
    startDate, // pocetak obracunskog perioda
    endDate // kraj obracunskog perioda
}) => {
    return generisiProfilPotrosnjeHighPrecision({
        Wm,
        Wvt,
        Wnt,
        Pmax,
        Kb,
        Kp,
        startDate,
        endDate
    });
    //.map(day => day.map(value => parseFloat(value.toFixed(3))));
};
export default generisiProfilPotrosnje;
