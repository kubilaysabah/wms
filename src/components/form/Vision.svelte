<script>
    import { getContext, onMount } from "svelte";

    export let key = false;
    export let id = "";
    export let label = "";
    export let text = "";
    export let value = "";
    export let visible = true;

    export let control = "";

    if (!key) {
        key = control.replace("?", "").replace("*", "").trim().split(":")[0];
    }

    if (!id) {
        id = "vision_" + Math.random().toString(36).substring(2, 10);
    }

    const context = getContext("form_context");

    let element = null;

    let element_interface = {
        initial: value,
        key: key,
        error: () => {
            return false;
        },
        value: () => {
            return value;
        },
    };

    onMount(() => {
        context[id] = element_interface;

        return () => {
            delete context[id];
        };
    });

    $: text_split = text.split("\n");
</script>

<div class="flex flex-col {visible ? '' : 'hidden'} {$$props.class}">
    <!-- svelte-ignore a11y_label_has_associated_control -->
    {#if label}
        <label class="block text-md font-medium text-fore mb-1">{label}</label>
    {/if}
    <div class="w-full rounded-lg bg-float min-h-10 text-fore border-0 p-2 focus:ring-0 transition-all" {control} bind:this={element}>
        {#each text_split as item, index}
            {#if index !== 0}
                <br />
            {/if}
            {item}
        {/each}
    </div>
</div>
