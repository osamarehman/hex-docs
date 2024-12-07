// Swiss coordinate conversion functions
export function CHtoWGSlat(y, x) {
    const y_aux = (y - 2600000) / 1000000;
    const x_aux = (x - 1200000) / 1000000;

    let lat =
        16.9023892 +
        3.238272 * x_aux -
        0.270978 * Math.pow(y_aux, 2) -
        0.002528 * Math.pow(x_aux, 2) -
        0.0447 * Math.pow(y_aux, 2) * x_aux -
        0.014 * Math.pow(x_aux, 3);

    lat = (lat * 100) / 36;
    return lat;
}

export function CHtoWGSlng(y, x) {
    const y_aux = (y - 2600000) / 1000000;
    const x_aux = (x - 1200000) / 1000000;

    let lng =
        2.6779094 +
        4.728982 * y_aux +
        0.791484 * y_aux * x_aux +
        0.1306 * y_aux * Math.pow(x_aux, 2) -
        0.0436 * Math.pow(y_aux, 3);

    lng = (lng * 100) / 36;
    return lng;
}
