<script>
    import { setContext } from "svelte";
    import { onMount } from "svelte";

    export let onsubmit = (data) => {};

    const keys = {};

    const context = {};
    setContext("form_context", context);
    const form_submit = (reason) => {
        if (keys["Shift"]) {
            console.log(form_data());
            return;
        }

        if (form_error()) {
            return;
        }
        onsubmit(form_data(), reason);
    };
    setContext("form_submit", form_submit);

    const form_error = () => {
        let error = false;

        let alert = false;

        for (let [key, value] of Object.entries(context)) {
            let answer = value.error();
            if (answer) {
                if (!alert && value.alert) {
                    alert = answer;
                }
                error = true;
            }
        }
        if (alert) {
            Alerter.Info("Form Uyarı", alert);
        }
        return error;
    };

    const form_data = () => {
        let data = {};
        for (let [key, value] of Object.entries(context)) {
            const val = value.value();

            if (!value.key) {
                continue;
            }
            if (value.ignore && val === value.initial) {
                continue;
            }
            if (!value.required && val === "") {
                continue;
            }

            let keys = value.key.split(".");

            let temp = data;
            let last_key = keys[keys.length - 1];
            for (let i = 0; i < keys.length - 1; i++) {
                if (!temp[keys[i]]) {
                    temp[keys[i]] = {};
                }
                temp = temp[keys[i]];
            }

            if (last_key.includes("[]")) {
                let index = last_key.replace("[]", "");
                if (!temp[index]) {
                    temp[index] = [];
                }
                temp[index].push(val);
            } else {
                temp[last_key] = val;
            }
        }

        return data;
    };

    onMount(() => {
        const handle_keydown = (e) => {
            keys[e.key] = true;
        };
        const handle_keyup = (e) => {
            keys[e.key] = false;
        };

        window.addEventListener("keydown", handle_keydown);
        window.addEventListener("keyup", handle_keyup);

        return () => {
            window.removeEventListener("keydown", handle_keydown);
            window.removeEventListener("keyup", handle_keyup);
        };
    });
</script>

<div class="flex flex-col {$$props.class}">
    <slot />
</div>
