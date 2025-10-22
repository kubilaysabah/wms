<script>
    import { getContext, onDestroy, onMount } from "svelte";
    import Up from "./icons/Up.svelte";
    import Down from "./icons/Down.svelte";
    import form_validate from "./FormValidate.js";

    export let label = "";
    export let control = "";
    export let key = false;
    export let id = "";
    export let visible = true;
    export let description = "";
    export let disabled = false;

    export let value = "";
    export let text = "";
    export let list = {};
    export let onstart = async (value) => {};
    export let onchange = () => {};
    export let onwarning = (state) => {};

    let warning = "";

    if (!key) {
        key = control.replace("?", "").replace("*", "").trim().split(":")[0];
    }

    if (!id) {
        id = "select_" + Math.random().toString(36).substring(2, 10);
    }

    const context = getContext("form_context");

    let element = null;

    let open = false;

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
            return value;
        },
    };

    onMount(() => {
        if (control.startsWith("*")) {
            control = control.substring(1);
            element_interface.required = false;
            element_interface.ignore = true;
        }
        if (control.startsWith("?")) {
            control = control.substring(1);
            element_interface.required = false;
        }

        context[id] = element_interface;

        const handle_click = (event) => {
            if (element && !element.contains(event.target)) {
                open = false;
            }
        };

        ß(document).on("click", handle_click);

        return () => {
            delete context[id];
            ß(document).off("click", handle_click);
        };
    });

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
            warning = "";
            if (element.classList.contains("!ring-error")) {
                element.classList.remove("!ring-2");
                element.classList.remove("!ring-error");
                element.classList.remove("!focus:ring-error");
            }
        }
    };

    const change_value = async (incoming_value) => {
        if (incoming_value === value) {
            return;
        }
        if ((await onstart(incoming_value, list[incoming_value])) === false) {
            return;
        }
        onchange(incoming_value);
        value = incoming_value;
        let answer = form_validate(element_interface);
        if (answer) {
            element_interface.first = true;
            warn_form_element(answer);
        } else {
            warn_form_element(false);
        }
    };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex flex-col cursor-pointer {visible ? '' : 'hidden'} {$$props.class}">
    <!-- svelte-ignore a11y_label_has_associated_control -->
    {#if label}
        <label class="block text-md font-medium text-fore mb-1">{label}</label>
    {/if}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
        class="flex relative items-center justify-between w-full rounded-lg bg-float text-fore border-0 p-2 focus:ring-2 focus:ring-fore transition-all {disabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
        onclick={() => {
            if (!disabled) {
                open = !open;
            }
        }}
        bind:this={element}
        tabindex="0">
        <span>{(list && list[value]) || text || ""}</span>
        {#if open}
            <Up class="ml-1 w-6 h-6" />
        {:else}
            <Down class="ml-1 w-6 h-6" />
        {/if}
        {#if open && keys(list).length > 0}
            <div class="absolute right-0 top-10 mt-2 w-full bg-back border border-border-mid rounded-lg shadow-lg z-50 animate-fade-in p-1.5" tabindex="-1">
                {#each entries(list) as [list_key, list_value] (list_key)}
                    {#if list_key == ""}
                        <button
                            class="block w-full text-left px-4 py-1 text-reverse hover:bg-middle transition cursor-pointer rounded-md"
                            onclick={(e) => {
                                e.stopPropagation();
                                open = false;
                                change_value(list_key);
                            }}>
                            {list_value}
                        </button>
                    {/if}
                {/each}
                {#each entries(list) as [list_key, list_value] (list_key)}
                    {#if list_key != ""}
                        <button
                            class="block w-full text-left px-4 py-1 text-reverse hover:bg-middle transition cursor-pointer rounded-md"
                            onclick={(e) => {
                                e.stopPropagation();
                                open = false;
                                change_value(list_key);
                            }}>
                            {list_value}
                        </button>
                    {/if}
                {/each}
            </div>
        {/if}
    </div>
    <p class="text-sm {warning ? 'text-error' : 'text-ghost'} {warning || description ? 'mt-1 ' : ''}">{warning || description}</p>
</div>
