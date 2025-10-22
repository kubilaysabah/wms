<script>
    import Down from "./icons/Down.svelte";
    import Up from "./icons/Up.svelte";
    import {onMount} from "svelte";
    export let options = {};
    export let text = "Seçiniz";
    export let action = (key, value) => {};

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

<div class="relative inline-block" bind:this={dropdown_dom}>
    <button class="flex items-center justify-between pl-4 pr-1 py-1.5 bg-float text-reverse rounded-md border border-border-mid transition cursor-pointer" onclick={() => (open = !open)}>
        <span>{text}</span>
        {#if open}
            <Up class="ml-1 w-7 h-7" />
        {:else}
            <Down class="ml-1 w-7 h-7" />
        {/if}
    </button>
    {#if open}
        <div class="absolute right-0 mt-2 w-max bg-back border border-border-mid rounded-lg shadow-lg z-50 animate-fade-in p-2" tabindex="-1">
            {#each Object.entries(options) as [key, value]}
                <button
                    class="block w-full text-left px-5 py-2 text-reverse hover:bg-middle transition cursor-pointer rounded-md"
                    onclick={() => {
                        action(key, value);
                        open = false;
                    }}>
                    {value}
                </button>
            {/each}
        </div>
    {/if}
</div>
