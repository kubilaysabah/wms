<script>
    import { onMount, onDestroy } from 'svelte';
    import wsManager, { connectionStatus } from '$comp/data/store/store.js';

    export let endpoint = '';
    export let method = 'GET';
    export let data = '';
    export let interval = 0;
    export let efficient = false;
    export let headers = {};

    let response = null;
    let loading = true;
    let error = null;
    let subscriptionId = null;

    $: connected = $connectionStatus.connected;
    $: connecting = $connectionStatus.connecting;

    function handleResponse(msg) {
        try {
            const raw = msg?.response ?? false;
            
            // Status'u kontrol et
            if (msg.status === 'EXCEPTION') {
                error = raw;
                response = null;
                loading = false;
                return;
            }

            if (msg.status === 'USAGE') {
                error = 'Invalid request parameters';
                response = null;
                loading = false;
                return;
            }

            try {
                const parsed = JSON.parse(raw);
                response = parsed;
                console.log('WebSocket Response:', parsed);
            } catch {
                response = raw;
                console.log('WebSocket Response (raw):', raw);
            }
            
            error = null;
            loading = false;
        } catch (e) {
            console.error('Response işleme hatası:', e);
            error = e.message;
            response = null;
            loading = false;
        }
    }

    function subscribe() {
        if (subscriptionId) {
            wsManager.unsubscribe(subscriptionId);
        }

        loading = true;
        error = null;
        response = null;

        const params = {
            endpoint,
            method,
            data,
            interval,
            efficient,
            headers
        };

        subscriptionId = wsManager.subscribe(params, handleResponse);
    }

    function unsubscribe() {
        if (subscriptionId) {
            wsManager.unsubscribe(subscriptionId);
            subscriptionId = null;
        }
    }

    function reconnect() {
        // Mevcut subscription'ı koru ve yeniden gönder
        if (subscriptionId) {
            subscribe();
        }
    }

    // Reaktif olarak parametreler değiştiğinde yeniden subscribe ol
    $: if (endpoint) {
        subscribe();
    }

    onMount(() => {
        if (endpoint) {
            subscribe();
        }
    });

    onDestroy(() => {
        unsubscribe();
    });
</script>

{#if loading && response === null}
<slot name="loading">
</slot>
{:else if error}
    <slot name="error" {error} {reconnect}>
        <div class="text-red-500">
            <p>Hata: {error}</p>
            <button on:click={reconnect} class="text-blue-500 underline">
                Yeniden Dene
            </button>
        </div>
    </slot>
{:else}
    <slot 
        {response} 
        {loading} 
        {error} 
        {connected}
        {connecting}
        {reconnect}
        disconnect={unsubscribe}
    />
{/if}