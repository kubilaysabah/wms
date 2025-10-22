<script>
    import "$lib/global.js";
    import Alert from "./Alert.svelte";

    let alerts = {};

    let alert_structure = {
        guid: "",
        open: false,
        title: "",
        message: "",
        type: "success",
        blocking: false,
        outside: false,
        size: "sm",
        positive: "",
        negative: "",
        neutral: "",
        onPositive: () => {},
        onNegative: () => {},
        onNeutral: () => {},
        onDismiss: () => {},
    };

    function alert_return() {
        let structure = { ...alert_structure };

        let return_object = {
            structure,
            blocking: (blocking) => {
                if (blocking !== undefined) {
                    structure.blocking = blocking;
                }
                return return_object;
            },
            outside: (outside) => {
                if (outside !== undefined) {
                    structure.outside = outside;
                }
                return return_object;
            },
            title: (title) => {
                if (title !== undefined) {
                    structure.title = title;
                }
                return return_object;
            },
            message: (message) => {
                if (message !== undefined) {
                    structure.message = message;
                }
                return return_object;
            },
            type: (type) => {
                if (type !== undefined) {
                    structure.type = type;
                }
                return return_object;
            },
            size: (size) => {
                if (size !== undefined) {
                    structure.size = size;
                }
                return return_object;
            },
            positive: (positive, callback = () => {}) => {
                if (positive !== undefined) {
                    structure.positive = positive;
                }
                structure.onPositive = callback;
                return return_object;
            },
            negative: (negative, callback = () => {}) => {
                if (negative !== undefined) {
                    structure.negative = negative;
                }
                structure.onNegative = callback;
                return return_object;
            },
            neutral: (neutral, callback = () => {}) => {
                if (neutral !== undefined) {
                    structure.neutral = neutral;
                }
                structure.onNeutral = callback;
                return return_object;
            },
            show: () => {
                if(!structure.positive && !structure.negative && !structure.neutral){
                    structure.outside = true;
                }
                structure.open = true;
                structure.guid = "Alert_" + Math.random().toString(36).substring(2, 9);
                alerts = { ...alerts, [structure.guid]: structure };
                return return_object;
            },
        };

        return return_object;
    }

    globalThis.Alerter = {
        Success: (title, message = "", button = "Tamam", callback = () => {}) => {
            if (typeof message === "function") {
                callback = message;
                message = "";
            }
            if (typeof button === "function") {
                callback = button;
                button = "Tamam";
            }
            return alert_return().title(title).message(message).type("success").neutral(button, callback).blocking(false).show();
        },
        Error: (title, message = "", button = "Tamam", callback = () => {}) => {
            if (typeof message === "function") {
                callback = message;
                message = "";
            }
            if (typeof button === "function") {
                callback = button;
                button = "Tamam";
            }
            return alert_return().title(title).message(message).type("error").neutral(button, callback).blocking(false).show();
        },
        Warning: (title, message = "", button = "Tamam", callback = () => {}) => {
            if (typeof message === "function") {
                callback = message;
                message = "";
            }
            if (typeof button === "function") {
                callback = button;
                button = "Tamam";
            }
            return alert_return().title(title).message(message).type("warning").neutral(button, callback).blocking(false).show();
        },
        Info: (title, message = "", button = "Tamam", callback = () => {}) => {
            if (typeof message === "function") {
                callback = message;
                message = "";
            }
            if (typeof button === "function") {
                callback = button;
                button = "Tamam";
            }
            return alert_return().title(title).message(message).type("info").neutral(button, callback).blocking(false).show();
        },
        Question: (title, message = "", positive = "Evet", pcallback = () => {}, negative = "Hayır", ncallback = () => {}) => {
            if (typeof message === "function") {
                pcallback = message;
                message = "";
            }
            if (typeof positive === "function") {
                pcallback = positive;
                positive = "Evet";
            }
            if (typeof negative === "function") {
                ncallback = negative;
                negative = "Hayır";
            }
            return alert_return().title(title).message(message).type("question").positive(positive, pcallback).negative(negative, ncallback).blocking(false).show();
        },
        Alert: (title, message) => {
            return alert_return().title(title).message(message);
        },
    };

    $: first_alert = first(alerts);
</script>

{#if first_alert !== null}
    <Alert
        {...first_alert}
        onClose={(guid) => {
            delete alerts[first_alert.guid];
            alerts = { ...alerts };
        }} />
{/if}
