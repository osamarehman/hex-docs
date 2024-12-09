// Utility functions
window.debounce = function (func, delay) {
    let timer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

window.PMT = function (rate, nper, pv) {
    const pvif = Math.pow(1 + rate, nper);
    const pmt = (rate * pv * pvif) / (pvif - 1);
    return pmt;
}
