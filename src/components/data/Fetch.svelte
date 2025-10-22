<script>
    import { onMount, onDestroy } from "svelte";

    export let endpoint = "";
    export let method = "GET";
    export let data = "";
    export let headers = {};
    export let interval = 0;

    let response = null;
    let loading = true;
    let error = null;

    let timer;

    async function fetchData() {
        loading = true;
        error = null;

        try {
            const options = {
                method,
                headers,
            };

            options.headers["api"] = "api";

            if (method !== "GET") {
                options.body = data;
            }

            const res = await fetch(endpoint, options);
            const text = await res.text();

            try {
                const json = JSON.parse(text);
                response = json;
                console.log(json);
            } catch {
                response = text;
                console.log(text);
            }
        } catch (e) {
            console.error("Fetch hatası:", e);
            error = e.message;
            response = null;
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchData();

        if (interval > 0) {
            timer = setInterval(fetchData, interval);
        }
    });

    onDestroy(() => {
        if (timer) clearInterval(timer);
    });
</script>

{#if loading && response === null}
    <slot name="loading">
    </slot>
{:else if error}
    <slot name="error" {error} refetch={fetchData}>
        x
    </slot>
{:else}
    <slot {response} {loading} {error} refetch={fetchData} />
{/if}
