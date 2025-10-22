<script>
    import { TINTERNAL } from "$lang/lang.js";
    export let key;
    export let fallback = null;

    let translation;

    $: translation = TINTERNAL(key, fallback);
</script>

<span>{$translation}</span>
