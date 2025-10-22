// lib/stores/websocket-store.js
import { writable } from 'svelte/store';
import CNF from "$lib/conf.js";

class WebSocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.subscriptions = new Map(); // component ID → subscription object
        this.subscriptionsByReqId = new Map(); // req ID → subscription objects array
        this.pendingSubscriptions = []; // Henüz req ID almamış subscription'lar
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.connecting = false;
        this.disconnectTimer = null;
    }

    connect() {
        if (this.socket || this.connecting) return;
        
        this.connecting = true;
        console.log('WebSocket bağlantısı kuruluyor...');

        try {
            this.socket = new WebSocket(CNF.WS_URL);

            this.socket.onopen = () => {
                this.connected = true;
                this.connecting = false;
                this.reconnectAttempts = 0;
                console.log('WebSocket bağlandı');
                
                // Mevcut tüm subscription'ları yeniden başlat
                this.resubscribeAll();
            };

            this.socket.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    
                    // Eğer req field'ı varsa bu bir interval subscription response'u
                    if (msg.req && this.subscriptionsByReqId.has(msg.req)) {
                        const subscriptions = this.subscriptionsByReqId.get(msg.req);
                        // Bu req ID'sine sahip tüm subscription'ların callback'lerini çağır
                        subscriptions.forEach(subscription => {
                            subscription.callback(msg);
                        });
                        return;
                    }

                    // Req field'ı yoksa veya yeni req ID'si ise, bu ilk response olabilir
                    if (this.pendingSubscriptions.length > 0) {
                        // Pending subscription'lar var, bunları işle
                        const currentPending = [...this.pendingSubscriptions];
                        this.pendingSubscriptions = []; // Pending listesini temizle

                        currentPending.forEach(subscription => {
                            // Eğer interval varsa req ID'sini kaydet
                            if (msg.req && subscription.params.interval > 0) {
                                subscription.reqId = msg.req;
                                
                                // Req ID'sine göre grupla
                                if (!this.subscriptionsByReqId.has(msg.req)) {
                                    this.subscriptionsByReqId.set(msg.req, []);
                                }
                                this.subscriptionsByReqId.get(msg.req).push(subscription);
                            }
                            
                            // Callback'i çağır
                            subscription.callback(msg);
                        });
                    }
                } catch (e) {
                    console.error('WebSocket mesaj parse hatası:', e);
                }
            };

            this.socket.onclose = (event) => {
                this.connected = false;
                this.connecting = false;
                this.socket = null;
                console.log('WebSocket bağlantısı kesildi', event.code, event.reason);
                
                // Tüm subscription'ların req ID'sini sıfırla
                this.subscriptions.forEach(subscription => {
                    subscription.reqId = null;
                });
                this.subscriptionsByReqId.clear();
                this.pendingSubscriptions = [];
                
                // Otomatik yeniden bağlanma
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.reconnectAttempts++;
                        console.log(`Yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                        this.connect();
                    }, this.reconnectDelay * this.reconnectAttempts);
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket hatası:', error);
                this.connecting = false;
            };

        } catch (e) {
            console.error('WebSocket oluşturma hatası:', e);
            this.connecting = false;
        }
    }

    subscribe(params, callback) {
        const subscriptionId = Symbol();
        
        const subscription = {
            id: subscriptionId,
            params,
            callback,
            reqId: null
        };

        this.subscriptions.set(subscriptionId, subscription);

        // Bağlantı yoksa önce bağlan
        if (!this.connected) {
            this.connect();
        }

        // Bağlantı varsa hemen gönder
        if (this.connected && this.socket.readyState === WebSocket.OPEN) {
            this.sendSubscription(subscription);
        }

        return subscriptionId;
    }

    sendSubscription(subscription) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            // Pending listesine ekle (response geldiğinde eşleştirmek için)
            this.pendingSubscriptions.push(subscription);
            this.socket.send(JSON.stringify(subscription.params));
        }
    }

    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        
        if (subscription) {
            // Eğer req id'si varsa sunucuya unsubscribe mesajı gönder
            if (subscription.reqId && this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(subscription.reqId.toString());
                
                // Req ID grubundan çıkar
                if (this.subscriptionsByReqId.has(subscription.reqId)) {
                    const reqSubscriptions = this.subscriptionsByReqId.get(subscription.reqId);
                    const index = reqSubscriptions.indexOf(subscription);
                    if (index > -1) {
                        reqSubscriptions.splice(index, 1);
                    }
                    
                    // Eğer bu req ID'de başka subscription kalmadıysa grubu sil
                    if (reqSubscriptions.length === 0) {
                        this.subscriptionsByReqId.delete(subscription.reqId);
                    }
                }
            }

            // Pending listesinden çıkar (eğer henüz response almamışsa)
            const pendingIndex = this.pendingSubscriptions.indexOf(subscription);
            if (pendingIndex > -1) {
                this.pendingSubscriptions.splice(pendingIndex, 1);
            }

            // Subscription'ı sil
            this.subscriptions.delete(subscriptionId);
        }

        // Eğer hiç subscription kalmadıysa bağlantıyı kapat
        // if (this.subscriptions.size === 0) {
        //     this.disconnect();
        // }
    }

    resubscribeAll() {
        this.subscriptionsByReqId.clear();
        this.pendingSubscriptions = [];

        for (const subscription of this.subscriptions.values()) {
            subscription.reqId = null; // Reset req id
            this.sendSubscription(subscription);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'Manual disconnect');
            this.socket = null;
        }
        this.connected = false;
        this.connecting = false;
        this.subscriptions.clear();
        this.subscriptionsByReqId.clear();
        this.pendingSubscriptions = [];
    }

    getConnectionStatus() {
        return {
            connected: this.connected,
            connecting: this.connecting,
            subscriptionCount: this.subscriptions.size,
            pendingCount: this.pendingSubscriptions.length,
            reqGroupCount: this.subscriptionsByReqId.size
        };
    }
}

// Singleton instance
const wsManager = new WebSocketManager();

// Svelte store'ları
export const connectionStatus = writable({
    connected: false,
    connecting: false,
    subscriptionCount: 0,
    pendingCount: 0,
    reqGroupCount: 0
});

// Connection status'u güncelle
setInterval(() => {
    connectionStatus.set(wsManager.getConnectionStatus());
}, 1000);

export default wsManager;