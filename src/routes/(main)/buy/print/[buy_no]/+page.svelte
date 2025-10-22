<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { API } from "$lib/api.js";
    import CNF from "$lib/conf.js";
    import { page } from "$app/stores";

    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";

    let loading = true;

    let buy_no = $page.params.buy_no;

    let buy = false;
    async function fetch_buy() {
        let answer = await API("/buy/info", {
            no: buy_no,
            detail: 1,
        });

        if (!answer || !answer.success) {
            return;
        }

        buy = answer.data;

        console.log(buy);
    }

    onMount(async () => {
        loading = true;
        await fetch_buy();

        if (!buy) {
            Alerter.Error("Bir hata oluştu!", "Alım çekilemedi", () => {
                goto("/buy/list");
            });
            return;
        }

        if (!buy.complete) {
            Alerter.Error("Bir hata oluştu!", "Alım tamamlanmamış!", () => {
                goto("/buy/list");
            });
            return;
        }

        loading = false;

        setTimeout(() => {
            window.print();
        }, 100);
    });
</script>

{#if loading}
    <PageLoader />
{/if}

{#if !loading}
    <Container>
        <div class="relative min-h-full flex flex-col border border-border-mid rounded-2xl overflow-hidden">
            <div class="flex items-center justify-between p-4 border-b border-border-mid">
                <h2 class="text-lg font-semibold">{buy.doc}</h2>
                <div>{time(buy.moment)}</div>
            </div>
            <div class="flex items-center justify-between p-4 border-b border-border-mid">
                <div class="flex flex-col">
                    <span>{buy.account.legal}</span>
                    <span>{buy.account.address}</span>
                    <span>{buy.account.phone}</span>
                    <span>{buy.account.email}</span>
                </div>
                <div class="flex flex-col">
                    <span>{buy.partner.legal}</span>
                    <span>{buy.partner.address}</span>
                    <span>{buy.partner.phone}</span>
                    <span>{buy.partner.email}</span>
                </div>
            </div>
            <div class="flex items-end md:items-center justify-between p-4 border-b border-border-mid">
                <div>Mal Sayısı : {buy.count}</div>
                <div>Ara Toplam : {price(buy.sub, "₺")}</div>
                <div>Vergi : {price(buy.tax, "₺")}</div>
                <div>Toplam : {price(buy.total, "₺")}</div>
            </div>
            <table class="w-full">
                <thead>
                    <tr class="border-b border-border-mid">
                        <th class="text-left p-4 font-medium">Stok</th>
                        <th class="text-center p-4 font-medium">Adet</th>
                        <th class="text-right p-4 font-medium">Fiyat</th>
                        <th class="text-right p-4 font-medium">Vergi</th>
                        <th class="text-right p-4 font-medium">Toplam</th>
                    </tr>
                </thead>
                <tbody>
                    {#each buy.entries as entry}
                        <tr>
                            <td class="p-2">{entry.stock.name}</td>
                            <td class="p-2 text-center">{entry.count}</td>
                            <td class="p-2 text-right">{price(entry.cost, "₺")}</td>
                            <td class="p-2 text-right">{price(entry.tax, "₺")}</td>
                            <td class="p-2 text-right font-medium">{price(entry.total, "₺")}</td>
                        </tr>
                        {#if entry.assets && entry.assets.length > 0}
                            <tr class="border-b border-border-mid">
                                <td colspan="4" class="p-2 pt-0 text-sm text-muted-foreground">
                                    {entry.assets.map((asset) => asset.serial).join(" ")}
                                </td>
                            </tr>
                        {/if}
                    {/each}
                </tbody>
            </table>
            <div class="absolute bottom-0 left-0 right-0 p-2">
                <div class="flex items-center justify-between gap-4">
                    <div class="flex flex-col items-center w-1/2">
                        <span class="text-sm text-muted-foreground mb-2">Satıcı ({buy.account.legal})</span>
                        <div class="w-full h-20 border-t border-dashed border-border-muted"></div>
                    </div>
                    <div class="flex flex-col items-center w-1/2">
                        <span class="text-sm text-muted-foreground mb-2">Satıcı ({buy.partner.legal})</span>
                        <div class="w-full h-20 border-t border-dashed border-border-muted"></div>
                    </div>
                </div>
            </div>
        </div>
    </Container>
{/if}
