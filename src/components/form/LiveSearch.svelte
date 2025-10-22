<script>
    import { getContext, onMount } from "svelte";
    import Up from "./icons/Up.svelte";
    import Down from "./icons/Down.svelte";
    import form_validate from "./FormValidate.js";

    export let label = "";
    export let id = "";
    export let visible = true;
    export let placeholder = "";
    export let description = "";
    export let key = false;
    export let control = "";
    export let value = "";
    export let text = "";
    export let disabled = false;
    export let disability = true;

    export let source = async (query) => {
        return {};
    };
    export let onchange = (item) => {};

    let warning = "";
    export let onwarning = (state) => {};

    if (!key) {
        key = control.replace("?", "").replace("*", "").trim().split(":")[0];
    }

    if (!id) {
        id = "select_" + Math.random().toString(36).substring(2, 10);
    }

    const context = getContext("form_context");

    let element = null;

    let element_interface = {
        initial: value,
        key: key,
        required: true,
        ignore: false,
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
        value: () => {
            return element.getAttribute("real_value");
        },
    };

    const warn_form_element = (answer) => {
        if (answer) {
            onwarning(true);
            warning = answer;

            if (!element.classList.contains("!ring-error")) {
                element.classList.add("!ring-2");
                element.classList.add("!ring-error");
                element.classList.add("!focus:ring-error");
            }
        } else {
            onwarning(false);
            if (element.classList.contains("!ring-error")) {
                element.classList.remove("!ring-2");
                element.classList.remove("!ring-error");
                element.classList.remove("!focus:ring-error");
            }
            warning = "";
        }
    };

    let list = {};

    onMount(() => {
        if (control.startsWith("*")) {
            element_interface.required = false;
            element_interface.ignore = true;
        }
        if (control.startsWith("?")) {
            element_interface.required = false;
        }

        context[id] = element_interface;
        const handle_click = (event) => {
            if (element && !element.contains(event.target)) {
                list = {};
            }
        };

        ß(document).on("click", handle_click);

        return () => {
            delete context[id];
            ß(document).off("click", handle_click);
        };
    });

    let input_keyup = async () => {
        list = await source(text);
    };

    let input_blur = () => {
        setTimeout(() => {
            list = {};
        }, 200);
    };

    let option_click = async (item) => {
        element.setAttribute("real_value", item.key);
        text = item.value;
        onchange(item.data);
        list = {};
        element_interface.error();
    };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_label_has_associated_control -->

<div class="flex relative flex-col {visible ? '' : 'hidden'} {$$props.class}">
    {#if label}
        <label for={id} class="block text-md font-medium text-fore mb-1">{label}</label>
    {/if}
    <input
        bind:this={element}
        disabled={disabled}
        {placeholder}
        class="w-full rounded-lg bg-float text-fore border-0 p-2 focus:ring-2 focus:ring-fore transition-all {disabled && disability ? 'bg-middle' : 'bg-float'} {disabled ? 'cursor-not-allowed' : ''}"
        {id}
        onclick={() => {
            if(disabled){
                return;
            }
            if (keys(list).length > 0) {
                return;
            }
            text = "";
            element.setAttribute("real_value", "");
            input_keyup();
        }}
        onkeyup={() => {
            if(disabled){
                return;
            }
            input_keyup();
        }}
        onblur={() => {
            if(disabled){
                return;
            }
            input_blur();
        }}
        bind:value={text}
        real_value={value} />
    {#if keys(list).length > 0}
        <div class="absolute right-0 top-1/1 mt-2 w-full bg-back border border-border-mid rounded-lg shadow-lg z-50 animate-fade-in p-1.5" tabindex="-1">
            {#each values(list) as item}
                <button
                    class="block w-full text-left px-4 py-1 text-reverse hover:bg-middle transition cursor-pointer rounded-md"
                    onclick={(e) => {
                        e.stopPropagation();
                        option_click(item);
                    }}>
                    {item.value}
                </button>
            {/each}
        </div>
    {/if}
    <p class="text-sm {warning ? 'text-error' : 'text-ghost'} {warning || description ? 'mt-1 ' : ''}">{warning || description}</p>
</div>
