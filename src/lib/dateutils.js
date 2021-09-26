import moment from "moment";
import { isNationalHoliday } from "./praznici";

// ISO Date https://en.wikipedia.org/wiki/ISO_8601
export const ISO_STRING_FORMAT = "YYYY-MM-DD";
moment.defaultFormat = ISO_STRING_FORMAT;

export const getLastSundayInMonth = (month, year) => {
    const date = moment(new Date(year, month - 1, 1));
    return date
        .endOf("month")
        .startOf("week")
        .format();
};

export const startOfMonth = date => {
    return moment(date)
        .startOf("month")
        .format();
};

export const endOfMonth = date => {
    return moment(date)
        .endOf("month")
        .format();
};

export const startOfWeek = date => {
    return moment(date)
        .startOf("week")
        .format();
};

export const getYear = date => moment(date).year();
export const getMonth = date => moment(date).month();
export const getDay = date => moment(date).date();
export const getDow = date => moment(date).day();

export const daysBetween = (a, b) => {
    return moment(a).diff(b, "days");
};

export const dateAverage = (a, b) => {
    return moment(a)
        .add(daysBetween(b, a) / 2, "days")
        .format();
};

export const dateAdd = (date, amount, type) => {
    return moment(date)
        .add(amount, type)
        .format();
};

export const daysInMonth = date => {
    return moment(date).daysInMonth();
};

// Returns false id the date falls on Sunday, true otherwise
export const isWorkDay = date => {
    if (isNationalHoliday(date)) {
        return false;
    }
    // weekdays are 0-6 (Sunday - Saturday)
    return getDow(date) > 0;
};
