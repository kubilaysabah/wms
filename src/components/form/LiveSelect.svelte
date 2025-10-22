<script>
    import { getContext, onMount } from "svelte";
    import Up from "./icons/Up.svelte";
    import Down from "./icons/Down.svelte";
    import form_validate from "./FormValidate.js";

    export let label = "";
    export let visible = true;
    export let placeholder = "";
    export let disabled = false;
    export let value = "";

    export let source = async (query) => {
        return {};
    };
    export let onchange = (item) => {};

    const context = getContext("form_context");

    let element = null;

    let list = {};

    onMount(() => {
        const handle_click = (event) => {
            if (element && !element.contains(event.target)) {
                list = {};
            }
        };

        ß(document).on("click", handle_click);

        return () => {
            ß(document).off("click", handle_click);
        };
    });

    let input_keyup = async () => {
        list = await source(element.value);
    };

    let input_blur = () => {
        setTimeout(() => {
            list = {};
        }, 200);
    };

    let option_click = async (item) => {
        onchange(item.data);
        list = {};
        value = item.key;
        element.value = item.value;
    };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_label_has_associated_control -->

<div class="flex relative flex-col {visible ? '' : 'hidden'}">
    <label class="block text-md font-medium text-fore mb-1">{label}</label>
    <input
        disabled={disabled}
        bind:this={element}
        {placeholder}
        class="w-full rounded-lg bg-float text-fore border-0 p-2 focus:ring-2 focus:ring-fore transition-all disabled:cursor-not-allowed"
        onclick={() => {
            if (keys(list).length > 0) {
                return;
            }
            element.value = "";
            value = "";
            input_keyup();
        }}
        onkeyup={() => {
            input_keyup()
        }}
        onblur={() => input_blur()} />
    {#if keys(list).length > 0}
        <div class="absolute right-0 top-20 w-full bg-back border border-border-mid rounded-lg shadow-lg z-50 animate-fade-in p-1.5" tabindex="-1">
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
</div>
