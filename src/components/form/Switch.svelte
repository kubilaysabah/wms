<script>
    import { getContext, onMount } from "svelte";

    export let label = "";
    export let control = "";
    export let key = false;
    export let id = "";
    export let description = "";
    export let checked = false;
    export let visible = true;
    export let horizontal = false;
    export let reverse = false;

    export let onchange = (val) => {};

    let rest = { ...$$restProps };

    if (!key) {
        key = control.replace("?", "").replace("*", "").trim().split(":")[0];
    }

    if (!id) {
        id = "checkbox_" + Math.random().toString(36).substring(2, 10);
    }

    const context = getContext("form_context");

    let element = null;
    let warn_element = null;

    let element_interface = {
        initial: checked ? 1 : 0,
        key: key,
        error: () => {
            return false;
        },
        value: () => {
            return checked ? 1 : 0;
        },
    };

    onMount(() => {
        context[id] = element_interface;

        return () => {
            delete context[id];
        };
    });

    function toggle() {
        if(onchange(!checked) !== false){
            checked = !checked;
        }
    }
</script>

<div class="cursor-pointer {visible ? '' : 'hidden'} {rest.class ? rest.class : ''} max-w-max">
    <div class="flex {reverse ? 'flex-row-reverse' : ''} {horizontal ? 'items-center gap-2' : 'flex-col gap-1'}">
        <label for={id} class="text-md font-medium text-fore cursor-pointer">{label}</label>
        <div class="flex items-center">
            <button type="button" bind:this={element} {id} on:click={toggle} class="cursor-pointer relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 {checked ? 'bg-fore' : 'bg-middle'}" role="switch" aria-checked={checked}>
                <span class="sr-only">{label}</span>
                <span class="inline-block h-5 w-5 transform rounded-full bg-back transition-transform duration-200 ease-in-out {checked ? 'translate-x-6' : 'translate-x-1'}"></span>
            </button>
        </div>
    </div>
    <div class="flex items-center justify-start">
        <p class="text-sm text-ghost mt-1" initial={description} bind:this={warn_element}>{description}</p>
    </div>
</div>
