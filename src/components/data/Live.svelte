<script>
    import { onMount, onDestroy } from "svelte";
    import CNF from "$lib/conf.js";

    export let endpoint = "";
    export let method = "GET";
    export let data = "";
    export let interval = 0;
    export let efficient = false;
    export let headers = {};

    let response = null;
    let loading = true;
    let error = null;
    let connected = false;

    let socket;

    function connect() {
        loading = true;
        error = null;

        try {
            socket = new WebSocket(CNF.WS_URL);

            socket.onopen = () => {
                connected = true;
                // loading = false; // Bu satırı kaldırdık - response gelene kadar loading kalacak
                console.log("WebSocket bağlandı");
                socket.send(
                    JSON.stringify({
                        endpoint,
                        method,
                        data,
                        interval,
                        efficient,
                        headers,
                    }),
                );
            };

            socket.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    const raw = msg?.response ?? false;

                    if (raw) {
                        // Sadece response varsa işle
                        try {
                            const parsed = JSON.parse(raw);
                            response = parsed;
                            console.log("WebSocket Response:", parsed);
                        } catch {
                            response = raw;
                            console.log("WebSocket Response (raw):", raw);
                        }

                        // İlk response geldiğinde loading'i kapat
                        loading = false;
                    }
                } catch (e) {
                    console.error("Mesaj parse hatası:", e);
                    error = e.message;
                    response = null;
                    loading = false; // Hata durumunda da loading'i kapat
                }
            };

            socket.onclose = (event) => {
                connected = false;
                loading = false; // Bağlantı kesildiğinde loading'i kapat
                console.log("WebSocket bağlantısı kesildi", event.code, event.reason);

                // Eğer beklenmeyen bir kapanma ise hata olarak işaretle
                if (event.code !== 1000) {
                    error = `Bağlantı kesildi: ${event.reason || "Bilinmeyen hata"}`;
                }

                // Otomatik yeniden bağlanma (5 saniye sonra)
                setTimeout(() => {
                    if (!connected) {
                        console.log("Yeniden bağlanmaya çalışılıyor...");
                        connect();
                    }
                }, 5000);
            };

            socket.onerror = (err) => {
                console.error("WebSocket hatası:", err);
                error = "WebSocket bağlantı hatası";
                loading = false; // Hata durumunda loading'i kapat
            };
        } catch (e) {
            console.error("WebSocket oluşturma hatası:", e);
            error = e.message;
            loading = false;
        }
    }

    function disconnect() {
        if (socket) {
            socket.close(1000, "Component unmounted");
        }
    }

    function reconnect() {
        disconnect();
        setTimeout(connect, 100);
    }

    onMount(connect);
    onDestroy(disconnect);
</script>

{#if loading}
    <slot name="loading"></slot>
{:else if error && !connected}
    <slot name="error" {error} {reconnect}>
        <div class="text-red-500">
            Hata: {error}
            <button on:click={reconnect} class="ml-2 px-2 py-1 bg-blue-500 text-white rounded">Yeniden Bağlan</button>
        </div>
    </slot>
{:else}
    <slot {response} {loading} {error} {connected} {reconnect} {disconnect} />
{/if}
