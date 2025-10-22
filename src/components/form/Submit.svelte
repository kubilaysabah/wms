<script>
    import { getContext } from "svelte";

    export let label = "";
    export let reason = "";
    export let onclick = () => {};
    const submit = getContext("form_submit");

    let onclick_internal = () => {
        submit(reason);
        onclick();
    };
</script>
<button onclick={onclick_internal} class="btn min-w-3xs {$$props.class}">{label}</button>