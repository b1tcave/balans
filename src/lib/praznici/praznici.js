import {
    dateAdd,
    getDow,
    getYear,
    getMonth,
    getDay,
    startOfWeek,
    daysBetween
} from "../dateutils";

// Praznici u Republici Srbiji
//
// Prema Zakonu o državnim i drugim praznicima („Službeni glasnik RS”, br. 43/01, 101/07 i 92/11)
//
// Državni praznici u Republici Srbiji koji se praznuju neradno su:
// Nova godina – 1. i 2. januar
// Sretenje - Dan državnosti Srbije –15. i 16. februar
// Praznik rada –1. i 2. maj
// Dan primirja u Prvom svetskom ratu –11. novembar
//
// Verski praznici u Republici Srbiji koji se obeležavaju neradno su:
// Prvi dan Božića – 7. januar
// Vaskršnji praznici – počev od Velikog petka zaključno sa drugim danom Vaskrsa
//

export const calculateOrthodoxEasterForYear = year => {
    let day = (15 + (year % 19) * 19) % 30;
    day += 10 - ((day + year + year / 4) % 7);
    let month = 4;
    if (day > 30) {
        month = 5;
        day -= 30;
    }
    day = String(Math.ceil(day)).padStart(2, "0");
    month = String(month).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// Does the date fall on the exact date of national holiday
const _isActualNationalHoliday = date => {
    const monthPart = String(getMonth(date) + 1).padStart(2, "0");
    const dayPart = String(getDay(date)).padStart(2, "0");
    const parts = `${dayPart}.${monthPart}`;
    switch (parts) {
        // Nova godina – 1. i 2. januar
        case "01.01":
        case "02.01":
        // Prvi dan Božića – 7. januar
        case "07.01":
        // Sretenje - Dan državnosti Srbije –15. i 16. februar
        case "15.02":
        case "16.02":
        // Praznik rada –1. i 2. maj
        case "01.05":
        case "02.05":
        // Dan primirja u Prvom svetskom ratu –11. novembar
        case "11.11":
            return true;
    }

    const easter = calculateOrthodoxEasterForYear(getYear(date));
    const theGoodFriday = dateAdd(easter, -2, "days");
    const theHolySaturday = dateAdd(easter, -1, "days");
    if (date == easter || date == theGoodFriday || date == theHolySaturday) {
        return true;
    }
    return false;
};

export const isNationalHoliday = date => {
    // Zakonom je propisano da ako jedan od datuma kada se praznuju
    // navedeni državni praznici padne u nedelju, ne radi se prvog
    // narednog radnog dana.
    const sunday = startOfWeek(date);
    if (_isActualNationalHoliday(sunday)) {
        let prviRadniDan = sunday;
        let loopCount = 0; // failsafe against infinite loop
        while (loopCount++ < 7 && _isActualNationalHoliday(prviRadniDan)) {
            prviRadniDan = dateAdd(prviRadniDan, 1, "days");
        }
        // Ako uskrs i prvi maj padaju na isti dan, onda je i ponedeljak i utorak neradan
        const easter = calculateOrthodoxEasterForYear(getYear(date));
        const uskrsPadaNaPrviMaj = getMonth(easter) == 4 && getDay(easter) == 1;
        if (uskrsPadaNaPrviMaj && easter == sunday) {
            //prviRadniDan = dateAdd(prviRadniDan, 1, "days");
        }
        const days = daysBetween(date, prviRadniDan);
        if (days <= 0) {
            return true;
        }
    }

    return _isActualNationalHoliday(date);
};
