<script>
    import form_validate from "./FormValidate.js";
    import { getContext, onMount } from "svelte";

    export let key = false;
    export let control = "";
    export let usage = "";
    export let label = "";
    export let type = "text";
    export let id = "";
    export let description = "";
    export let value = "";
    export let visible = true;
    export let disabled = false;
    export let disability = true;


    export let onwarning = (state) => {};
    let warning = "";

    if (!id) {
        id = "textarea_" + Math.random().toString(36).substring(2, 10);
    }

    const context = getContext("form_context");

    let element = null;

    let element_interface = {
        key: false,
        type: false,
        constraint: false,
        required: true,
        ignore: false,
        usage: false,
        initial: false,
        value: (value = null) => {
            if (value) {
                element.value = value;
            }
            return element.value.trim();
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
            if(key){
                element_interface.type = parts[0];
            }else{
                element_interface.key = parts[0];
            }
        } else if (parts.length === 2) {
            if(key){
                element_interface.type = parts[0];
                element_interface.constraint = parts[1];
            }else{
                element_interface.key = parts[0];
                element_interface.type = parts[1];
            }
        } else if (parts.length === 3) {
            if(!key){
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
            if (!element.classList.contains("!ring-error")) {
                element.classList.add("!ring-2");
                element.classList.add("!ring-error");
                element.classList.add("!focus:ring-error");
                onwarning(true);
            }

            warning = answer;
        } else {
            if (element.classList.contains("!ring-error")) {
                element.classList.remove("!ring-2");
                element.classList.remove("!ring-error");
                element.classList.remove("!focus:ring-error");
                onwarning(false);
            }
            warning = "";
        }
    };
    
    let first_blur = false;

    const element_trigger_change = () => {
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
    <label for={id} class="block text-md font-medium text-fore mb-1">{label}</label>
    <textarea bind:this={element} {type} {usage} class="w-full min-h-20 rounded-lg bg-float text-fore border-0 p-2 focus:ring-2 focus:ring-fore transition-all {disabled && disability ? 'bg-middle' : 'bg-float'} {disabled ? 'cursor-not-allowed' : ''}" {id} onkeyup={() => element_trigger_change()} onfocus={() => element_trigger_focus()} onblur={() => element_trigger_blur()} disabled={disabled}>{value}</textarea>
    <p class="text-sm {warning ? 'text-error' : 'text-ghost'} {(warning || description) ? 'mt-1 ' : ''}">{warning || description}</p>
</div>
