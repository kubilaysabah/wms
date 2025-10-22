<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { API, PAGINATION } from "$lib/api.js";
    import CNF from "$lib/conf.js";
    import { page } from "$app/stores";

    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";

    import CompleteIcon from "$icons/Complete.svelte";
    let loading = true;

    let transfer_accept_no = $page.params.transfer_accept_no;

    let transfer_accept = false;
    async function fetch_transfer_accept() {
        let answer = await API("/transfer/accept/one", {
            no: transfer_accept_no,
            detail: 2,
        });

        if (!answer || !answer.success) {
            return;
        }

        transfer_accept = answer.data;
    }

    let title = "Transfer Seri Listesi";

    let headers = {
        no: "No",
        serial: "Seri",
        warehouse_text: "Depo",
        buy_cost: "Maliyet",
        buy_tax: "Vergi",
        buy_total: "Toplam",
    };

    let trigger_table = () => {};

    async function table_data(page, limit, query) {
        query.detail = 1;
        query.tac_no = transfer_accept.no;
        query.tas_accepted = 0;

        const data = await PAGINATION("/transfer/accept/asset/view/all", page, limit, query);

        if (data) {
            for (let item of data.data) {
                item.buy_cost = price(item.buy_cost, "₺");
                item.buy_tax = price(item.buy_tax, "₺");
                item.buy_total = price(item.buy_total, "₺");
                item.moment = time(item.moment);

                if (item.warehouse_no) {
                    let warehouse_indicators = [];

                    if (item.warehouse.service) {
                        warehouse_indicators.push("SR");
                    }

                    if (item.warehouse.buy) {
                        warehouse_indicators.push("AL");
                    }

                    if (item.warehouse.sell) {
                        warehouse_indicators.push("SA");
                    }

                    item.warehouse_text = item.warehouse.name;
                    if (warehouse_indicators.length > 0) {
                        item.warehouse_text += " (" + warehouse_indicators.join(",") + ")";
                    }
                } else {
                    item.warehouse_text = "Dışarıda";
                }
            }
        }

        return data;
    }

    let transfer_accept_accepted = false;

    async function check_transfer_accept_accepted() {
        let data = await API("/transfer/accept/accepted", {
            transfer_accept_no: transfer_accept.no,
        });

        if (!data || !data.success) {
            transfer_accept_accepted = false;
            return false;
        }

        transfer_accept_accepted = true;
    }

    onMount(async () => {
        loading = true;
        await fetch_transfer_accept();
        await check_transfer_accept_accepted();

        if (!transfer_accept) {
            Alerter.Error("Bir hata oluştu!", "Transfer çekilemedi", () => {
                goto("/accept/transfer/list");
            });
            return;
        }

        if (transfer_accept.accepted) {
            Alerter.Error("Bir hata oluştu!", "Transfer onaylandı!", () => {
                goto("/accept/transfer/list");
            });
            return;
        }

        loading = false;
    });
</script>

{#if loading}
    <PageLoader />
{/if}

{#if !loading}
    {#if transfer_accept_accepted}
        <Container>
            <div class="flex items-center justify-center h-screen">
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <button
                    class="btn text-lg font-semibold"
                    onclick={() => {
                        Alerter.Question("Tamamlanmış", "Bu transferi onaylıyor musunuz ?", "Evet", async () => {
                            let result = await API("/transfer/accept", {
                                transfer_no: transfer_accept.transfer.no,
                                transfer_accept_no: transfer_accept.no,
                            });

                            if (!result || !result.success) {
                                Alerter.Error("Onaylama Hatası", result.message);
                                return false;
                            }

                            Alerter.Success("Transfer onaylandı.", () => {
                                goto("/accept/transfer/list");
                            });
                        });
                    }}>
                    Transferi Onayladım
                </button>
            </div>
        </Container>
    {:else}
        <Container>
            <div class="flex flex-col border border-border-mid rounded-2xl mb-4">
                <div class="flex items-center justify-between p-4 border-b border-border-mid">
                    <h2 class="text-lg font-semibold">{transfer_accept.transfer.doc}</h2>
                    <div>
                        <span class="text-sm bg-fore text-back p-2 rounded-xl">{time(transfer_accept.transfer.moment)}</span>
                    </div>
                </div>
                <div class="flex items-center justify-between p-4">
                    <div>{transfer_accept.transfer.warehouse.name}</div>
                </div>
            </div>
            <div class="flex flex-col items-center gap-2 mb-2">
                <input
                    type="text"
                    class="w-full rounded-lg bg-float text-reverse border-border focus:ring-2 focus:ring-reverse mb-2"
                    placeholder="Barkod Okutun"
                    onkeyup={async (e) => {
                        if (e.keyCode !== 13) {
                            return;
                        }

                        let value = e.target.value;

                        e.target.value = "";

                        if (!value) {
                            return;
                        }

                        let result = await API("/transfer/accept/asset", {
                            transfer_accept_no,
                            serial: value,
                        });

                        if (!result || !result.success) {
                            Toaster.Error("Barkod Hatası " + result.message);
                            return;
                        }
                        await check_transfer_accept_accepted();

                        trigger_table();
                    }} />
            </div>
            <TableOnline {headers} data={table_data} bind:trigger={trigger_table} />
        </Container>
    {/if}
{/if}
