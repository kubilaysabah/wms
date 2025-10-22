<script>
    import { onMount } from "svelte";

    export let circle;
    export let background = "bg-red-400";
    export let color = "text-light";
    export let position = "";

    let position_class = "left-0";
    if (position == "middle") {
        position_class = "left-1/2 -translate-x-1/2";
    }
    if (position == "right") {
        position_class = "right-0";
    }

    export let options = {};
    export let selected = "_____";
    export let action = (key, value) => {};
    export let onchange = (key, value) => {};

    let internal = (key, value) => {
        if (selected != key) {
            selected = key;
            onchange(key, value);
        }
        action(key, value);
    };

    let open = false;
    let dropdown_dom;

    onMount(() => {
        const handle_click = (event) => {
            if (dropdown_dom && !dropdown_dom.contains(event.target)) {
                open = false;
            }
        };

        ß(document).on("click", handle_click);

        return () => {
            ß(document).off("click", handle_click);
        };
    });
</script>

<div class="relative" bind:this={dropdown_dom}>
    <button class="w-10 h-10 rounded-full {background} {color} shadow-sm transition cursor-pointer pt-0.5" onclick={() => (open = !open)}>
        {circle}
    </button>

    {#if open && Object.keys(options).length > 0}
        <div class="absolute right-0 mt-4 min-w-40 bg-back border border-border-mid rounded-lg shadow-lg z-50 animate-fade-in p-2" tabindex="-1">
            {#each Object.entries(options) as [key, value]}
                <button
                    class="block w-full text-left px-5 py-2 text-reverse hover:bg-middle transition cursor-pointer rounded-md"
                    onclick={() => {
                        internal(key, value);
                        open = false;
                    }}>
                    {value}
                </button>
            {/each}
        </div>
    {/if}
</div>
