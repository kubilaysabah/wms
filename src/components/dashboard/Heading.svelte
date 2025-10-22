<script>
    export let title = "";
    export let description = "";
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<div class="flex items-center justify-between">
    <div class="flex flex-1 flex-col items-start justify-between">
        {#if title}
            <h1 class="text-2xl text-reverse font-bold">{title}</h1>
        {/if}
        {#if $$slots.title}
            <h1 class="text-2xl text-reverse font-bold"><slot name="title" /></h1>
        {/if}
        {#if description}
            <p class="text-sm text-ghost">{description}</p>
        {/if}
        {#if $$slots.description}
            <p class="text-sm text-ghost"><slot name="description" /></p>
        {/if}
    </div>
    <div class="flex flex-2 items-center justify-end gap-2">
        <slot/>
    </div>
</div>