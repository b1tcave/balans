import { Period } from "./constants";
import { getMonth } from "../dateutils";

export const getPeriod = date => {
    const monthIndex = getMonth(date);
    // getMonth vraca 0-11, zato dodajemo 1
    const mesec = monthIndex + 1;
    let period;
    switch (mesec) {
        case 1:
        case 2:
        case 3:
        case 11:
        case 12:
            period = Period.ZIMSKI;
            break;
        case 4:
        case 5:
        case 9:
        case 10:
            period = Period.PRELAZNI;
            break;
        case 6:
        case 7:
        case 8:
            period = Period.LETNJI;
            break;
        default:
            period = Period.LETNJI;
    }
    console.log(`Period za ${date} je ${period}`);
    return period;
};
