import { Kategorija, Obracun } from "./constants";
import Debug from "debug";
const debug = Debug("tip");

export const izracunajTipMernogMesta = ({
    Wm, // utrošena električna energija na mesečnom nivou (kWh)
    Wvt, // utrošena energija u višoj tarifi (kWh)
    Wnt, // utrošena energija u nižoj tarifi (kWh)
    Kb, // jednotarifno ili dvotarifno brojilo
    Pmax, // mesečna maksimalna petnaestominutna aktivna snaga
    Kp, // kategorija potrošnje
    d // broj dana u obračunskom periodu
}) => {
    // Ekvivalentno vreme trajanja vršnog opterećenja
    const Tm = Wm / Pmax;
    debug("Tm:", Tm);
    switch (Kp) {
        case Kategorija.PRIVREDA_PREKO_1KV:
            switch (d) {
                case 28:
                    if (Tm < 370) {
                        return 1;
                    }
                    if (Tm < 456) {
                        return 2;
                    }
                    return 3;
                case 29:
                    if (Tm < 384) {
                        return 1;
                    }
                    if (Tm < 472) {
                        return 2;
                    }
                    return 3;

                case 30:
                    if (Tm < 397) {
                        return 1;
                    }
                    if (Tm < 489) {
                        return 2;
                    }
                    return 3;
                case 31:
                    if (Tm < 410) {
                        return 1;
                    }
                    if (Tm < 505) {
                        return 2;
                    }
                    return 3;
            }
            break;
        case Kategorija.PRIVREDA_DO_1KV_SA_MERENJEM_SNAGE:
            debug(d);
            switch (d) {
                case 28:
                    if (Tm < 307) {
                        return 1;
                    }
                    if (Tm < 413) {
                        return 2;
                    }
                    return 3;
                case 29:
                    if (Tm < 318) {
                        return 1;
                    }
                    if (Tm < 427) {
                        return 2;
                    }
                    return 3;

                case 30:
                    if (Tm < 329) {
                        return 1;
                    }
                    if (Tm < 442) {
                        return 2;
                    }
                    return 3;
                case 31:
                    if (Tm < 340) {
                        return 1;
                    }
                    if (Tm < 457) {
                        return 2;
                    }
                    return 3;
            }
            break;
        case Kategorija.PRIVREDA_DO_1KV_BEZ_MERENJA_SNAGE:
            if (Kb === Obracun.JEDNOTARIFNO_MERENJE) {
                return 2;
            }
            const HT = Wnt / (Wnt + Wvt);
            debug(Wnt, Wnt + Wvt, Wm, HT);
            if (HT < 0.23) {
                return 1;
            }
            if (HT < 0.29) {
                return 2;
            }
            return 3;
        case Kategorija.DOMACINSTVO:
            if (Kb === Obracun.DVOTARIFNO_MERENJE) {
                const HT = Wnt / (Wnt + Wvt);
                if (Wm > 700) {
                    if (HT > 0.33) {
                        return 1;
                    }
                    return 2;
                } else {
                    if (HT > 0.33) {
                        return 3;
                    }
                    return 4;
                }
            } else if (Kb === Obracun.JEDNOTARIFNO_MERENJE) {
                if (Wm > 700) {
                    return 5;
                } else {
                    return 6;
                }
            } else {
                // merno mesto sa daljinski upravljivom potrošnjom (DUT).
                return 7;
            }
        case Kategorija.JAVNA_RASVETA:
            return 1;
    }
};

export default izracunajTipMernogMesta;
