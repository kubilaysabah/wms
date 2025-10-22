
<script>
    import Modal from "$comp/modal/Modal.svelte";
    export let open = false;
    export let data = [];

    let states = {
        "0": "Alım",
        "1": "Transfer",
        "2": "Satış",
        "3": "Servis Giriş",
        "4": "Servis Durum",
        "5": "Servis Çıkış",
        "6": "Yerleştirildi",
    };
    
    let services = {
        "0": "Serviste Değil",
        "1": "Genel Bakım",
        "2": "Parça Bekliyor",
        "3": "Dış Serviste",
    };
</script>


<Modal title="Varlık Geçmişi" bind:open={open} onclose={() => (open = false)} size="lg">
    <div class="container mx-auto w-full max-w-3xl">
        <div class="relative wrap overflow-hidden py-2 h-full">
            <div class="border-2 absolute border-reverse h-full left-1/2 transform -translate-x-1/2"></div>
            
            {#if data && data.length}
                {#each data as item, i}
                    <div class="mb-6 flex justify-center items-center w-full relative">
                        <div class="{i % 2 === 0 ? 'ml-auto pr-8' : 'mr-auto pl-8'} w-[calc(50%-20px)]">
                            <div class="p-3 bg-float rounded border border-border-mid shadow-sm text-fore">
                                <h3 class="mb-1 font-medium text-fore">{states[item.state]} {item.state === 3 ? `(${services[item.service]})` : ''}  {item.state === 4 ? `(${services[item.service]})` : ''}</h3>
                                <p class="text-sm text-fore-500 mb-2">
                                    {time(item.record)}
                                </p>
                                <!-- <p class="text-sm text-fore mb-1">
                                    <span class="font-medium">Maliyet:</span> {item.cost} ₺
                                </p>
                                <p class="text-sm text-fore mb-1">
                                    <span class="font-medium">Vergi:</span> {item.tax} ₺
                                </p>
                                <p class="text-sm text-fore mb-1">
                                    <span class="font-medium">Toplam:</span> {item.total} ₺
                                </p> -->
                                <p class="text-sm text-fore mb-1">
                                    <span class="font-medium">Stok:</span> {item.stock.name}
                                </p>
                                <p class="text-sm text-fore mb-1">
                                    <span class="font-medium">Mülkiyet:</span> {item.partner.name}
                                </p>
                                <p class="text-sm text-fore mb-1">
                                    <span class="font-medium">Depo:</span> {item.warehouse.name}
                                </p>
                                {#if item.state === 0 && item.buy}
                                    <div class="mt-2 pt-2 border-t border-border-mid">
                                        <p class="text-sm text-fore">
                                            <span class="font-medium">Alım No:</span> {item.buy.no}
                                        </p>
                                        <p class="text-sm text-fore">
                                            <span class="font-medium">Alım Belge:</span> {item.buy.doc}
                                        </p>
                                    </div>
                                {/if}
                                {#if item.state === 1 && item.transfer}
                                    <div class="mt-2 pt-2 border-t border-border-mid">
                                        <p class="text-sm text-fore">
                                            <span class="font-medium">Transfer No:</span> {item.transfer.no}
                                        </p>
                                        <p class="text-sm text-fore">
                                            <span class="font-medium">Transfer Belge:</span> {item.transfer.doc}
                                        </p>
                                    </div>
                                {/if}
                                {#if item.state === 2 && item.sell}
                                    <div class="mt-2 pt-2 border-t border-border-mid">
                                        <p class="text-sm text-fore">
                                            <span class="font-medium">Satış No:</span> {item.sell.no}
                                        </p>
                                        <p class="text-sm text-fore">
                                            <span class="font-medium">Satış Belge:</span> {item.sell.doc}
                                        </p>
                                    </div>
                                {/if}
                            </div>
                        </div>
                        <div class="z-20 flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 bg-float w-7 h-7 rounded-full border-2 border-dashed border-reverse-light">
                            <p class="text-sm text-fore pt-1">{data.length - i}</p>
                        </div>
                    </div>
                {/each}
            {:else}
                <div class="w-full text-center py-10">
                    <p class="text-gray-500">Bu varlık için geçmiş bilgisi bulunamadı.</p>
                </div>
            {/if}
        </div>
    </div>
</Modal>