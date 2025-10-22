<script>
    import { TINTERNAL } from "$lang/lang.js";
    export let key;
    export let k;
    export let t;
    export let fallback = null;

    key = k || t || key;

    let translation;

    $: translation = TINTERNAL(key, fallback);
</script>

<span>{$translation}</span>
