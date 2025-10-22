<script>
    import { onMount, onDestroy } from "svelte";

    export let wait = 0;
    export let timeout = 0;

    let show = false;

    setTimeout(() => {
        show = true;
    }, wait);

    setTimeout(() => {
        show = false;
    }, timeout);
</script>

{#if show}
    <div id="data-loader" class="flex items-center justify-center fixed inset-0 backdrop-blur-xs bg-back/10 z-50">
        <div class="animate-spin rounded-full h-32 w-32 border-b-4 border-brand"></div>
    </div>
{/if}
