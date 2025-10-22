<script>
    import Close from "$icons/Close.svelte";
    import { onMount } from "svelte";

    export let open = true;
    export let size = "";
    export let closable = false;
    export let title = "";

    export let onclose = () => {};

    export let onstart = () => {};
    export let onopen = () => {};

    function close(event) {
        if (closable && event.target === event.currentTarget) {
            open = false;
        }
    }
    function force_close(event) {
        open = false;
    }

    let control = open;

    $: {
        if (open && !control) {
            onstart();
            onopen();
        } else if (!open && control) {
            onclose();
        }
        control = open;
    }

    onMount(() => {});
</script>

{#if open}
    <div class="fixed w-full h-screen top-0 left-0 overflow-y-auto z-99 grid place-items-center p-2 backdrop-blur-xs bg-back/50" onclick={close} aria-modal="true" tabindex="0" role="dialog" onkeydown={close}>
        <div class="relative flex flex-col bg-back border border-border-mid text-reverse rounded-2xl shadow-lg w-full {size === 'xs' ? 'md:max-w-3xl' : size === 'sm' ? 'md:max-w-4xl' : size === 'md' ? 'md:max-w-4xl' : size === 'lg' ? 'md:max-w-5xl' : size === 'xl' ? 'md:max-w-6xl' : size === 'xxl' ? 'md:max-w-7xl' : 'md:max-w-full'}">
            {#if title}
                <div class="flex items-center justify-between w-full px-6 pt-6 text-xl">{title}</div>
                <button class="absolute top-6 right-6 cursor-pointer" onclick={force_close}><Close class="w-10 h-10 text-fore" /></button>
            {/if}
            <div class="p-6">
                <slot close={force_close} />
            </div>
        </div>
    </div>
{/if}
