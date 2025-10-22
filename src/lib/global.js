globalThis.entries = Object.entries;
globalThis.keys = Object.keys;
globalThis.values = Object.values;
globalThis.first = function (object) {
    if (!object) {
        return null;
    }
    if (typeof object !== "object") {
        return null;
    }
    if (Object.keys(object).length === 0) {
        return null;
    }
    return Object.values(object)[0];
};
globalThis.last = function (object) {
    if (!object) {
        return null;
    }
    if (typeof object !== "object") {
        return null;
    }
    if (Object.keys(object).length === 0) {
        return null;
    }
    return Object.values(object)[Object.keys(object).length - 1];
};


globalThis.generate_IMEI = function () {
    let imei = "";
    for (let i = 0; i < 14; i++) {
        imei += Math.floor(Math.random() * 10);
    }

    let sum = 0;
    for (let i = 0; i < 14; i++) {
        let digit = parseInt(imei.charAt(i));
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }
    let checkDigit = (10 - (sum % 10)) % 10;
    return imei + checkDigit;
}

globalThis.price = function (_price, suffix = "") {
    const parts = _price.toString().split(".");
    let integerPart = parts[0];
    let decimalPart = parts[1] ? parts[1].slice(0, 2) : "";

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    let result = decimalPart ? `${integerPart},${decimalPart.padEnd(2, "0")}` : integerPart;

    return suffix ? result + " " + suffix : result;
};

globalThis.time = function (input = undefined, format = "d.m.y H:i") {
    if (typeof input === "undefined") {
        return Math.floor(Date.now() / 1000);
    }

    if (typeof input === "number") {
        const date = new Date(input * 1000);

        const map = {
            d: String(date.getDate()).padStart(2, "0"),
            m: String(date.getMonth() + 1).padStart(2, "0"),
            Y: date.getFullYear(),
            y: String(date.getFullYear()).slice(-2),
            H: String(date.getHours()).padStart(2, "0"),
            i: String(date.getMinutes()).padStart(2, "0"),
            s: String(date.getSeconds()).padStart(2, "0"),
        };

        return format.replace(/d|m|Y|y|H|i|s/g, match => map[match]);
    }

    if (typeof input === "string") {
        const date = new Date(input);
        if (isNaN(date.getTime())) return null;
        return Math.floor(date.getTime() / 1000);
    }

    return Math.floor(Date.now() / 1000);
};


globalThis.ß = function (selector) {
    const elements = selector instanceof Node ? [selector] : document.querySelectorAll(selector);

    const instance = {
        elements: Array.from(elements),

        each: function (callback) {
            this.elements.forEach(callback);
            return this;
        },

        on: function (event, callback, bubble) {
            this.elements.forEach(el => el.addEventListener(event, callback, bubble));
            return this;
        },

        off: function (event, callback, bubble) {
            this.elements.forEach(el => el.removeEventListener(event, callback, bubble));
            return this;
        },

        contains: function (node) {
            return this.elements.some(el => el.contains(node));
        },

        class: {
            add: function (className) {
                instance.elements.forEach(el => el.classList.add(className));
                return instance;
            },

            remove: function (className) {
                instance.elements.forEach(el => el.classList.remove(className));
                return instance;
            },

            toggle: function (className) {
                instance.elements.forEach(el => el.classList.toggle(className));
                return instance;
            },

            has: function (className) {
                return instance.elements[0] ? instance.elements[0].classList.contains(className) : false;
            }
        },

        attr: {
            get: function (name) {
                return instance.elements[0] ? instance.elements[0].getAttribute(name) : null;
            },

            set: function (name, value) {
                instance.elements.forEach(el => el.setAttribute(name, value));
                return instance;
            },

            has: function (name) {
                return instance.elements[0] ? instance.elements[0].hasAttribute(name) : false;
            }
        },

        css: {
            get: function (prop) {
                return getComputedStyle(instance.elements[0])[prop];
            },
            set: function (prop, value) {
                instance.elements.forEach(el => el.style[prop] = value);
                return instance;
            }
        },

        html: function (content) {
            if (content === undefined) {
                return instance.elements[0] ? instance.elements[0].innerHTML : '';
            }
            this.each(el => el.innerHTML = content);
            return this;
        },

        append: function (content) {
            this.elements.forEach(el => {
                if (typeof content === 'string') {
                    el.insertAdjacentHTML('beforeend', content);
                } else {
                    el.appendChild(content);
                }
            });
            return this;
        },

        remove: function () {
            this.elements.forEach(el => el.remove());
            return this;
        },

        data: {
            get: function (key) {
                return instance.elements[0]?.dataset[key];
            },
            set: function (key, value) {
                instance.elements.forEach(el => el.dataset[key] = value);
                return instance;
            }
        },

        text: function (content) {
            if (content === undefined) {
                return instance.elements[0] ? instance.elements[0].textContent : '';
            }
            this.each(el => el.textContent = content);
            return this;
        },

        show: function () {
            this.elements.forEach(el => el.style.display = '');
            return this;
        },

        hide: function () {
            this.elements.forEach(el => el.style.display = 'none');
            return this;
        },

        first: function () {
            return ß([this.elements[0]].filter(Boolean));
        },

        last: function () {
            return ß([this.elements[this.elements.length - 1]].filter(Boolean));
        },

        eq: function (index) {
            return ß([this.elements[index]].filter(Boolean));
        },

        find: function (selector) {
            const found = [];
            this.elements.forEach(el => {
                found.push(...el.querySelectorAll(selector));
            });
            return ß(found);
        },

        closest: function (selector) {
            return ß([this.elements[0]?.closest(selector)].filter(Boolean));
        },

        parent: function () {
            return ß(this.elements.map(el => el.parentElement).filter(Boolean));
        },

        length: function () {
            return this.elements.length;
        },

        index: function () {
            const parent = this.elements[0]?.parentElement;
            return parent ? Array.from(parent.children).indexOf(this.elements[0]) : -1;
        },

        val: function (value) {
            if (value === undefined) {
                return this.elements[0]?.value || '';
            }
            this.elements.forEach(el => el.value = value);
            return this;
        },

        checked: function (value) {
            if (value === undefined) {
                return this.elements[0]?.checked || false;
            }
            this.elements.forEach(el => el.checked = value);
            return this;
        }
    };

    return instance;
};

globalThis.range = function (n) {
    return Array(n).fill(0).map((_, i) => i + 1);
}

globalThis.random_number = function (n) {
    let result = "";
    for (let i = 0; i < n; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

globalThis.random_alpha = function (n) {
    let alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < n; i++) {
        result += alpha[Math.floor(Math.random() * alpha.length)];
    }
    return result;
}


globalThis.PARTNERS = [
    {
        no: "0",
        name: "Senatech",
        legal: "Senatech Bilişim Teknoloji Sanayi Ticaret A.Ş.",
        address: "Emek, Atatürk Cd. No:4 D:1, 34785 Sancaktepe/İstanbul",
    },
    {
        no: "1",
        name: "Soysal",
        legal: "Soysal Grup İnşaat Turizm Ticaret A.Ş.",
        address: "Paşalimanı Cad. No:31 Üsküdar | İstanbul",
    },
];


globalThis.SERVICE_STATE = {
    "0": "Serviste Değil",
    "1": "Genel Bakım",
    "2": "Parça Bekliyor",
    "3": "Dış Serviste",
};