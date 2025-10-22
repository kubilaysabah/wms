<script>
    import "$src/app.css";
    import "$lib/global.js";
    import Alerter from "$comp/alert/Alerter.svelte";
    let { children } = $props();
</script>

<Alerter />
{@render children()}