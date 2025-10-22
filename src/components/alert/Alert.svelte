<script>
    import Info from "./icons/Info.svelte";
    import Success from "./icons/Success.svelte";
    import Warning from "./icons/Warning.svelte";
    import Error from "./icons/Error.svelte";
    import Question from "./icons/Question.svelte";
    import { onMount } from "svelte";

    export let open = true;
    export let title = "";
    export let message = "";
    export let muted = "";
    export let blocking = true;
    export let outside = false;
    export let guid = "";

    if (!guid) {
        guid = "Alert_" + Math.random().toString(36).substring(2, 9);
    }

    // info,success,warning,error,question
    export let type = "info";

    // xs,sm,md,lg,xl
    export let size = "sm";

    export let positive = "";
    export let negative = "";
    export let neutral = "";

    const message_exists = positive || negative || neutral;

    export let onPositive = () => {};
    export let onNegative = () => {};
    export let onNeutral = () => {};
    export let onDismiss = (guid) => {};
    export let onDestroy = (guid) => {};
    export let onClose = (guid) => {};

    let onNeutralInternal = () => {
        if (!blocking) {
            open = false;
            onClose(guid);
        }
        if (onNeutral()) {
            if (blocking) {
                open = false;
                onClose(guid);
            }
        }
    };

    let onNegativeInternal = () => {
        if (!blocking) {
            open = false;
            onClose(guid);
        }
        if (onNegative()) {
            if (blocking) {
                open = false;
                onClose(guid);
            }
        }
    };

    let onPositiveInternal = () => {
        if (!blocking) {
            open = false;
            onClose(guid);
        }
        if (onPositive()) {
            if (blocking) {
                open = false;
                onClose(guid);
            }
        }
    };

    let onDismissInternal = () => {
        if (!blocking) {
            open = false;
            onClose(guid);
        }
        if (onDismiss(guid)) {
            if (blocking) {
                open = false;
                onClose(guid);
            }
        }
    };

    onMount(() => {
        return () => {
            onDestroy(guid);
        };
    });

    $: icon = type === "info" ? Info : type === "success" ? Success : type === "warning" ? Warning : type === "error" ? Error : type === "question" ? Question : Info;

    $: iconColor = type === "info" ? "text-blue-500" : type === "success" ? "text-green-500" : type === "warning" ? "text-amber-500" : type === "error" ? "text-red-500" : type === "question" ? "text-purple-500" : "text-blue-500";
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if open}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        class="fixed inset-0 z-999 flex items-center justify-center p-2 backdrop-blur-xs bg-back/50"
        onclick={() => {
            if (outside) {
                onDismissInternal();
            }
        }}>
        <div class="bg-back border border-border-mid text-reverse rounded-lg shadow-lg p-6 {size === 'xs' ? 'w-64' : size === 'sm' ? 'w-96' : size === 'md' ? 'w-1/3' : size === 'lg' ? 'w-1/2' : size === 'xl' ? 'w-3/4' : 'w-full'}">
            <div class="flex items-center mb-2">
                {#if type}
                    {#if title}
                        <svelte:component this={icon} class="w-10 h-10 mr-3 {iconColor}" />
                    {:else}
                        <svelte:component this={icon} class="w-10 h-10 mx-auto mb-1 {iconColor}" />
                    {/if}
                {/if}
                {#if title}
                    <h2 class="text-2xl {!message ? 'text-xl' : ''} font-bold">{title}</h2>
                {/if}
            </div>
            {#if typeof message === "string"}
                <p>{message}</p>
            {:else if typeof message === "object"}
                <pre class="text-sm font-sans">{JSON.stringify(message, null, 2)}</pre>
            {/if}
            <p class="text-gray-500">{muted}</p>
            {#if message_exists}
                <div class="flex justify-end gap-2 mt-5">
                    {#if positive}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="bg-success hover:bg-success-hover font-medium text-back px-4 py-2 rounded cursor-pointer" onclick={() => onPositiveInternal()}>
                            {positive}
                        </div>
                    {/if}
                    {#if negative}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="bg-error hover:bg-error-hover font-medium text-back px-4 py-2 rounded cursor-pointer" onclick={() => onNegativeInternal()}>
                            {negative}
                        </div>
                    {/if}
                    {#if neutral}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="bg-secondary hover:bg-secondary-hover font-medium text-back px-4 py-2 rounded cursor-pointer" onclick={() => onNeutralInternal()}>
                            {neutral}
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
{/if}
<slot />
