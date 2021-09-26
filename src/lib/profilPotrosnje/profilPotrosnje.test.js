const {
    toBeDeepCloseTo,
    toMatchCloseTo
} = require("jest-matcher-deep-close-to");
expect.extend({ toBeDeepCloseTo, toMatchCloseTo });

const { generisiProfilPotrosnje } = require("./profilPotrosnje");
const { primeri } = require("./primeri");

const getTotal = arr =>
    arr.reduce(
        (total, value) =>
            total + value.reduce((rowSum, value) => rowSum + value, 0),
        0
    );

const testSpecificDay = (primer, dayIndex) => {
    describe(`Primer ${primer.description}`, () => {
        const generated = generisiProfilPotrosnje(primer.params);
        it(`day ${dayIndex}`, () => {
            expect(generated[dayIndex]).toBeDeepCloseTo(
                primer.result[dayIndex],
                3
            );
        });
    });
};

//describe("Svi Primeri", () => {
//    primeri.forEach(primer => {
//        describe(`Primer ${primer.description}`, () => {
//            it(`Primer total sum is equal to input Wm`, () => {
//                expect(getTotal(primer.result)).toBeCloseTo(primer.params.Wm);
//            });
//            const generated = generisiProfilPotrosnje(primer.params);
//            it(`Generated total sum and is equal to input Wm`, () => {
//                expect(getTotal(generated)).toBeCloseTo(primer.params.Wm);
//            });
//
//            primer.result.forEach((day, dayIndex) => {
//                testSpecificDay(primer, dayIndex);
//            });
//        });
//    });
//});

describe("Konkretno", () => {
    testSpecificDay(primeri[0], 31 - 1);
});
