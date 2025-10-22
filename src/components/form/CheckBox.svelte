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

    export let onchange = (val) => {};

    // rest props
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

    const element_interface = {
        initial: checked ? 1 : 0,
        key,
        error: () => false,
        value: () => (checked ? 1 : 0),
    };

    onMount(() => {
        context[id] = element_interface;
        return () => { delete context[id]; };
    });

    function handleChange(e) {
        const next = e.currentTarget.checked;
        // onchange false dönerse state'i geri al
        if (onchange(next) === false) {
            e.currentTarget.checked = checked;
            return;
        }
        checked = next;
    }
</script>

<div class="cursor-pointer {visible ? '' : 'hidden'} {rest.class ? rest.class : ''} max-w-max">
    <div class="flex {horizontal ? 'items-center gap-2' : 'flex-col gap-1'}">
        <label for={id} class="text-md font-medium text-fore cursor-pointer">{label}</label>

        <div class="flex items-center">
            <input
                bind:this={element}
                {id}
                type="checkbox"
                class="h-5 w-5 rounded border-middle accent-fore cursor-pointer"
                aria-describedby={description ? id + "_desc" : undefined}
                checked={checked}
                on:change={handleChange}
                {...$$restProps}
            />
        </div>
    </div>

    <div class="flex items-center justify-start">
        <p id={id + "_desc"} class="text-sm text-ghost mt-1" initial={description} bind:this={warn_element}>
            {description}
        </p>
    </div>
</div>
