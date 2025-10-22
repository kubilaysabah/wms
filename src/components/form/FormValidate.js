const validation = {};

validation.required = (value) => {
    if (value === "" || value === null || value === undefined) {
        return "Bu alan zorunludur";
    }
    return false;
};

validation.email = (value, min, max, form_member) => {
    if (!value.match(/^\S+@\S+\.\S+$/)) {
        return "Lütfen geçerli bir e-posta adresi girin";
    }

    return false;
};

validation.phone = (value, min, max, form_member) => {
    if (!value.match(/^\+?[1-9]\d{1,14}$/)) {
        return "Lütfen geçerli bir telefon numarası girin";
    }

    if (!value.includes("+")) {
        form_member.value("+90" + value);
    }

    return false;
};

validation.tax = (value, min, max, form_member) => {
    if (!value.match(/^\d{10}$/)) {
        return "Lütfen geçerli bir vergi numarası girin";
    }

    return false;
};

validation.tckn = (value, min, max, form_member) => {
    if (!value.match(/^[1-9]\d{10}$/)) {
        return "Lütfen geçerli bir TC Kimlik Numarası girin";
    }

    const digits = value.split('').map(Number);
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

    if ((oddSum * 7 - evenSum) % 10 !== digits[9]) {
        return "Lütfen geçerli bir TC Kimlik Numarası girin";
    }

    if ((digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0)) % 10 !== digits[10]) {
        return "Lütfen geçerli bir TC Kimlik Numarası girin";
    }
    return false;
};

validation.taxtckn = (value, min, max, form_member) => {
    if (!value.match(/^\d{10}$/)) {
        if (!value.match(/^[1-9]\d{10}$/)) {
            return "Lütfen geçerli bir TC Kimlik Numarası veya Vergi Numarası girin";
        }

        const digits = value.split('').map(Number);
        const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

        if ((oddSum * 7 - evenSum) % 10 !== digits[9]) {
            return "Lütfen geçerli bir TC Kimlik Numarası veya Vergi Numarası girin";
        }

        if ((digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0)) % 10 !== digits[10]) {
            return "Lütfen geçerli bir TC Kimlik Numarası veya Vergi Numarası girin";
        }
        return false;
    }

    return false;
};

validation.imei = (value, min, max, form_member) => {
    if (!value.match(/^\d{15}$/)) {
        return "Lütfen geçerli bir IMEI numarası girin (15 rakam)";
    }

    let sum = 0;
    const digits = value.split('').map(Number);

    for (let i = 0; i < digits.length; i++) {
        if (i % 2 !== 0) {
            let doubled = digits[i] * 2;
            sum += doubled > 9 ? doubled - 9 : doubled;
        } else {
            sum += digits[i];
        }
    }

    if (sum % 10 !== 0) {
        return "Geçersiz IMEI numarası";
    }
    return false;
};

validation.text = (value, min, max, form_member) => {
    if(min && value.length < min){
        return "Lütfen geçerli bir metin girin";
    }
    if(max && value.length > max){
        return "Lütfen geçerli bir metin girin";
    }
    return false;
};

validation.integer = (value, min, max, form_member) => {
    if (!value.match(/^\d+$/)) {
        return "Lütfen geçerli bir sayı girin";
    }

    value = Number(value);
    if(min && value < min){
        return "Lütfen en az " + min + " girin";
    }
    if(max && value > max){
        return "Lütfen en fazla " + max + " girin";
    }

    return false;
};

validation.numeric = (value, min, max, form_member) => {
    if (!value.match(/^[\d.]+$/)) {
        return "Lütfen geçerli bir sayı girin";
    }

    value = Number(value);
    if(min && value < min){
        return "Lütfen en az " + min + " girin";
    }
    if(max && value > max){
        return "Lütfen en fazla " + max + " girin";
    }

    return false;
};

validation.number = (value, min, max, form_member) => {
    if (isNaN(Number(value)) || value === '') {
        return "Lütfen geçerli bir sayı girin";
    }

    return false;
};

export default (form_member) => {
    const key = form_member.key;
    const value = form_member.value();
    const type = form_member.type;
    const usage = form_member.usage;
    const required = form_member.required;
    const ignore = form_member.ignore;

    if (!key) {
        return false;
    }

    let answer;

    if (answer = validation.required(value)) {
        if (!required || ignore) {
            return false;
        }
        return usage || answer;
    }
    let min = 0;
    let max = 0;

    if(form_member.constraint){
        let parts = form_member.constraint.split("/");
        if(parts.length === 2){
            min = Number(parts[0]);
            max = Number(parts[1]);
        }
    }
    
    if(type && type.startsWith("/") && type.endsWith("/")){
        let regex = new RegExp(type.replace(/\//g, ""));
        if(!regex.test(value)){
            return usage || "Lütfen geçerli bir değer girin";
        }
        return false;
    }

    if (type && (answer = validation[type](value, min, max, form_member))) {
        return usage || answer;
    }

    return false;
};
