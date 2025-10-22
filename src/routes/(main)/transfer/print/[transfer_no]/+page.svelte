<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { API } from "$lib/api.js";
    import CNF from "$lib/conf.js";
    import { page } from "$app/stores";

    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";

    let loading = true;

    let transfer_no = $page.params.transfer_no;

    let transfer = false;
    async function fetch_transfer() {
        let answer = await API("/transfer/info", {
            no: transfer_no,
            detail: 2,
        });

        if (!answer || !answer.success) {
            return;
        }

        transfer = answer.data;
    };

    onMount(async () => {
        loading = true;
        await fetch_transfer();

        if (!transfer) {
            Alerter.Error("Bir hata oluştu!", "Transfer çekilemedi", () => {
                goto("/transfer/list");
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
    <Container class="print:!w-full print:!max-w-none">
        <div class="
            mahmut 
            min-h-screen 
            flex 
            flex-col 
            border 
            border-border-mid 
            rounded-2xl 
            overflow-hidden
            
            print:min-h-0
            print:h-auto
            print:border-0
            print:rounded-none
            print:overflow-visible
            print:w-full
            print:block
        ">
            <div class="flex-1 print:flex-none">
                <div class="
                    flex 
                    items-center 
                    justify-between 
                    p-4 
                    border-b 
                    border-border-mid
                    print:p-2
                ">
                    <h2 class="text-lg font-semibold print:text-base">{transfer.doc}</h2>
                    <div class="print:text-sm">{time(transfer.moment)}</div>
                </div>
                
                <table class="w-full mb-20 print:mb-8">
                    <thead>
                        <tr class="border-b border-border-mid">
                            <th class="text-left p-4 font-medium print:p-2 print:text-sm">Stok</th>
                            <th class="text-right p-4 font-medium print:p-2 print:text-sm">Adet</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each transfer.entries as entry}
                            <tr>
                                <td class="p-2 text-left print:text-sm">{entry.stock.name}</td>
                                <td class="p-2 text-right print:text-sm">{entry.assets.length}</td>
                            </tr>
                            {#if entry.assets && entry.assets.length > 0}
                                <tr class="border-b border-border-mid">
                                    <td colspan="2" class="p-2 pt-0 text-sm text-muted-foreground print:text-xs">
                                        {entry.assets.map((asset) => asset.serial).join(" ")}
                                    </td>
                                </tr>
                            {/if}
                        {/each}
                    </tbody>
                </table>
            </div>
            
            <div class="
                mt-auto 
                p-2 
                print:mt-16
                print:pt-4
                print:break-inside-avoid
                print:page-break-inside-avoid
            ">
                <div class="flex items-center justify-between gap-4">
                    <div class="flex flex-col items-center w-1/2">
                        <span class="text-sm text-muted-foreground mb-2 print:text-xs">
                            Teslim Alan
                        </span>
                        <div class="w-full h-20 border-t border-dashed border-border-muted print:h-16"></div>
                    </div>
                    <div class="flex flex-col items-center w-1/2">
                        <span class="text-sm text-muted-foreground mb-2 print:text-xs">
                            Teslim Eden
                        </span>
                        <div class="w-full h-20 border-t border-dashed border-border-muted print:h-16"></div>
                    </div>
                </div>
            </div>
        </div>
    </Container>
{/if}