<script>
    import form_validate from "./FormValidate.js";
    import { getContext, onMount } from "svelte";

    export let key = false;
    export let control = "";
    export let usage = "";
    export let placeholder = "";
    export let label = "";
    export let id = "";
    export let description = "";
    export let value = "";
    export let visible = true;
    export let readonly = false;
    export let prefix = "";
    export let suffix = "";
    export let tabindex = "0";
    export let disabled = false;
    export let disability = true;
    export let alert = false;

    export let prefix_class = "pl-5";
    export let suffix_class = "pr-5";

    export let onwarning = (state) => {};

    let warning = "";

    export let onchange = (value) => {};
    export let onkeyup = (e) => {};
    export let onkeydown = (e) => {};
    export let oninput = (e) => {};

    if (!id) {
        id = "input_" + Math.random().toString(36).substring(2, 10);
    }

    const context = getContext("form_context");

    let element = null;

    let element_interface = {
        alert,
        key: key,
        type: false,
        constraint: false,
        required: true,
        ignore: false,
        usage: false,
        value: (new_value = null) => {
            if (new_value) {
                element.value = new_value;
            }

            let return_val = element.value;
            if (return_val && prefix) {
                return_val = return_val.replace(prefix, "");
            }
            if (return_val && suffix) {
                return_val = return_val.replace(suffix, "");
            }
            return return_val.trim();
        },
        error: () => {
            let return_value = false;
            let answer = form_validate(element_interface);
            if (answer) {
                warn_form_element(answer);
                return_value = answer;
            } else {
                warn_form_element(false);
            }
            return return_value;
        },
    };

    onMount(() => {
        element_interface.initial = element.value;
        element_interface.usage = element.getAttribute("usage");

        if (control.startsWith("*")) {
            control = control.substring(1);
            element_interface.ignore = true;
        }
        if (control.startsWith("?")) {
            control = control.substring(1);
            element_interface.required = false;
        }

        let parts = control.split(":");
        if (parts.length === 1) {
            if (key) {
                element_interface.type = parts[0];
            } else {
                element_interface.key = parts[0];
            }
        } else if (parts.length === 2) {
            if (key) {
                element_interface.type = parts[0];
                element_interface.constraint = parts[1];
            } else {
                element_interface.key = parts[0];
                element_interface.type = parts[1];
            }
        } else if (parts.length === 3) {
            if (!key) {
                element_interface.key = parts[0];
                element_interface.type = parts[1];
                element_interface.constraint = parts[2];
            }
        }

        context[id] = element_interface;

        return () => {
            delete context[id];
        };
    });

    const warn_form_element = (answer) => {
        if (answer) {
            warning = answer;
            if (!element.classList.contains("!ring-error")) {
                element.classList.add("!ring-2");
                element.classList.add("!ring-error");
                element.classList.add("!focus:ring-error");
                onwarning(true);
            }
        } else {
            warning = "";
            if (element.classList.contains("!ring-error")) {
                element.classList.remove("!ring-2");
                element.classList.remove("!ring-error");
                element.classList.remove("!focus:ring-error");
                onwarning(false);
            }
        }
    };

    let first_blur = false;

    const element_trigger_keydown = (e) => {
        if (disabled) {
            return;
        }
        if (onkeydown(e) === false) {
            return;
        }
        element.value = element.value.replace(suffix, "");
        if (element_interface.type == "integer" || element_interface.type == "numeric") {
            if ((e.key < "0" || e.key > "9") && e.key != "Backspace" && e.key != "Delete" && e.key != "Tab" && e.key != "." && e.key != ",") {
                e.preventDefault();
                return;
            }
        }
    };

    const element_trigger_input = (e) => {
        if (disabled) {
            return;
        }
        element.value = element.value.replace(",", ".");
        oninput(e);
    };

    const element_trigger_keyup = (e) => {
        if (disabled) {
            return;
        }
        onchange(element.value);
        onkeyup(e);

        if (!first_blur) {
            if (!form_validate(element_interface)) {
                warn_form_element(false);
            }
            return;
        }
        let answer = form_validate(element_interface);
        if (answer) {
            warn_form_element(answer);
        } else {
            warn_form_element(false);
        }
    };

    const element_trigger_focus = () => {
        if (disabled) {
            return;
        }
        if (!element_interface.value()) {
            return;
        }
        let answer = form_validate(element_interface);
        if (answer) {
            warn_form_element(answer);
        } else {
            warn_form_element(false);
        }
    };

    const element_trigger_blur = () => {
        if (disabled) {
            return;
        }
        let answer = form_validate(element_interface);
        if (answer) {
            first_blur = true;
            warn_form_element(answer);
        } else {
            warn_form_element(false);
        }
    };
</script>

<div class="flex flex-col {visible ? '' : 'hidden'} {$$props.class}">
    {#if label}
        <label for={id} class="block text-md font-medium text-fore mb-1">{label}</label>
    {/if}
    <div class="relative flex items-center justify-start gap-2">
        <slot name="prefix" />
        {#if prefix}
            <span class="absolute left-2 text-fore">{prefix}</span>
        {/if}
        <input bind:this={element} type="text" {usage} {disabled} {placeholder} class="w-full rounded-lg text-fore border-0 p-2 {disabled && disability ? 'bg-middle' : 'bg-float'} {disabled ? 'cursor-not-allowed' : ''} {readonly ? 'focus:ring-0' : 'focus:ring-2 focus:ring-fore'} transition-all {prefix ? prefix_class : ''} {suffix ? suffix_class : ''}" {id} onkeydown={(e) => element_trigger_keydown(e)} oninput={(e) => element_trigger_input(e)} onkeyup={(e) => element_trigger_keyup(e)} onfocus={() => element_trigger_focus()} onblur={() => element_trigger_blur()} bind:value {readonly} {tabindex} />
        {#if suffix}
            <span class="absolute right-2 text-fore">{suffix}</span>
        {/if}
        <slot name="suffix" />
    </div>
    <p class="text-sm {warning ? 'text-error' : 'text-ghost'} {warning || description ? 'mt-1 ' : ''}">{warning || description}</p>
</div>
