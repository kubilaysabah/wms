<script>
    import { onMount } from "svelte";

    export let avatar;
    export let position = "left";

    export let options = {};
    export let selected = null;
    export let action = (key, value) => {};
    export let onchange = (key, value) => {};

    let internal = (key, value) => {
        if (selected !== key) {
            selected = key;
            onchange(key, value);
        }
        if (action(key, value) !== false) {
            open = false;
        }
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
    <button class="w-10 h-10 rounded-full bg-fore text-back shadow-sm transition cursor-pointer pt-0.5" onclick={() => (open = !open)}>
        {avatar}
    </button>

    {#if open && Object.keys(options).length > 0}
        <div class="absolute {position == 'middle' ? 'left-1/2 -translate-x-1/2' : position == 'right' ? 'right-0' : 'left-0'} mt-4 min-w-40 bg-back border border-border-mid rounded-lg shadow-lg z-50 animate-fade-in p-2" tabindex="-1">
            {#each Object.entries(options) as [key, value]}
                <button
                    class="block w-full text-left px-5 py-2 text-reverse hover:bg-middle transition cursor-pointer rounded-md"
                    onclick={() => {
                        internal(key, value);
                    }}>
                    {value}
                </button>
            {/each}
        </div>
    {/if}
</div>
