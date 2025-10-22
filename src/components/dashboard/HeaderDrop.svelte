<script>
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    export let position = "left";
    export let link = false;

    export let options = {};
    export let selected = null;
    export let action = (key, value) => {};
    export let onchange = (key, value) => {};

    let internal = (key, value) => {
        if (link) {
            goto(key);
        }
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

<div class="relative inline-block cursor-pointer" bind:this={dropdown_dom}>
    <button class="flex items-center justify-between text-reverse cursor-pointer" onclick={() => (open = !open)}>
        <span><slot /></span>
    </button>
    {#if open}
        <div class="w-max absolute {position == 'middle' ? 'left-1/2 -translate-x-1/2' : position == 'right' ? 'right-0' : 'left-0'} mt-5 min-w-50 bg-back border border-border rounded-lg shadow-lg z-50 animate-fade-in p-2" tabindex="-1">
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
