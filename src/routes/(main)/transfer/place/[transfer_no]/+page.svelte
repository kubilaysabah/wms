<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { API, PAGINATION } from "$lib/api.js";
    import CNF from "$lib/conf.js";
    import { page } from "$app/stores";

    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";
    let loading = true;

    let transfer_no = $page.params.transfer_no;

    let transfer = false;
    async function fetch_transfer() {
        let answer = await API("/transfer/one", {
            no: transfer_no,
            detail: 1,
        });

        if (!answer || !answer.success) {
            return;
        }

        transfer = answer.data;
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
        query.transfer_no = transfer_no;
        query.slot_no = 0;

        const data = await PAGINATION("/asset/all", page, limit, query);

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

    let transfer_fitted = false;

    async function check_transfer_fitted() {
        let data = await API("/transfer/fitted", {
            no: transfer_no,
        });

        if (!data || !data.success) {
            transfer_fitted = false;
            return false;
        }

        transfer_fitted = true;
    }

    onMount(async () => {
        loading = true;
        await fetch_transfer();
        await check_transfer_fitted();

        if (!transfer) {
            Alerter.Error("Bir hata oluştu!", "Transfer çekilemedi", () => {
                goto("/transfer/list");
            });
            return;
        }

        if (!transfer.complete) {
            Alerter.Error("Bir hata oluştu!", "Transfer tamamlanmamış!", () => {
                goto("/transfer/list");
            });
            return;
        }

        loading = false;
    });

    let barcode_segment_message = "";
    let barcode_slot_message = "";
    let barcode_placeholder = "Cihaz barkodunu okutun";
    let borcode_state = 1;
    let borcode_blocked = false;

    let temp_slot = false;
    let temp_asset = false;
    let temp_segment = false;
</script>

{#if loading}
    <PageLoader />
{/if}

{#if !loading}
    {#if transfer_fitted}
        <Container>
            <div class="flex items-center justify-center h-screen">
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <button
                    class="btn text-lg font-semibold"
                    onclick={() => {
                        Alerter.Question("Tamamlanmış", "Bu transferi yerleştirildi olarak işaretliyor musunuz ?", "Evet", async () => {
                            let result = await API("/storage/in/transfer/end", {
                                transfer_no,
                            });

                            if (!result || !result.success) {
                                Alerter.Error("Yerleştirme Hatası", result.message);
                                return false;
                            }

                            Alerter.Success("Transfer yerleştirildi.", () => {
                                goto("/transfer/list");
                            });
                        });
                    }}>
                    Transferi Yerleştirdim
                </button>
            </div>
        </Container>
    {:else}
        <Container>
            <div class="flex flex-col border border-border-mid rounded-2xl mb-4">
                <div class="flex items-center justify-between p-4 border-b border-border-mid">
                    <h2 class="text-lg font-semibold">{transfer.doc}</h2>
                    <div>
                        <span class="text-sm bg-fore text-back p-2 rounded-xl">{time(transfer.moment)}</span>
                    </div>
                </div>
                <div class="flex items-center justify-between p-4">
                    <div>{transfer.warehouse.name}</div>
                </div>
            </div>
            <div class="flex flex-col items-center gap-2 mb-2">
                <div class="flex items-center justify-between gap-2 w-full">
                    {#if barcode_segment_message}
                        <div class="w-full text-lg text-center bg-success/20 py-3 px-4 rounded-xl mb-2">{barcode_segment_message}</div>
                    {/if}
                    {#if barcode_slot_message}
                        <div class="w-full text-lg text-center bg-success/20 py-3 px-4 rounded-xl mb-2">{barcode_slot_message}</div>
                    {/if}
                </div>
                <input
                    type="text"
                    class="w-full rounded-lg bg-float text-reverse border-border focus:ring-2 focus:ring-reverse mb-2"
                    placeholder={barcode_placeholder}
                    disabled={borcode_blocked}
                    onkeyup={async (e) => {
                        if (e.keyCode !== 13) {
                            return;
                        }

                        let value = e.target.value;

                        e.target.value = "";

                        if (!value) {
                            return;
                        }

                        if (borcode_state === 1) {
                            let result = await API("/storage/in/asset/start", {
                                transfer_no,
                                barcode: value,
                            });

                            if (!result || !result.success) {
                                Toaster.Error("Seçim Hatası " + result.message);
                                return;
                            }

                            temp_slot = result.data.slot;
                            temp_asset = result.data.asset;
                            temp_segment = result.data.segment;

                            barcode_segment_message = "Okutmanız gereken segment : " + temp_segment.location;
                            barcode_slot_message = "Yerleşecek slot : " + temp_slot.label;

                            borcode_state = 2;
                            barcode_placeholder = "Segment barkodunu okutun";

                            Toaster.Info("Cihaz seçildi.");
                        } else if (borcode_state === 2) {
                            if (value != temp_segment.location) {
                                Toaster.Error("Segment barkodu uyuşmuyor.");
                                return;
                            }

                            let result = await API("/storage/in/asset/end", {
                                transfer_no,
                                barcode: value,
                                asset_no: temp_asset.no,
                                slot_no: temp_slot.no,
                            });

                            if (!result || !result.success) {
                                Toaster.Error("Yerleştirme Hatası " + result.message);
                                return;
                            }

                            temp_slot = false;
                            temp_asset = false;
                            temp_segment = false;

                            borcode_state = 1;
                            barcode_placeholder = "Cihaz barkodunu okutun";

                            barcode_segment_message = "";
                            barcode_slot_message = "";

                            Toaster.Info("Cihaz yerleştirildi.");
                            trigger_table();
                            check_transfer_fitted();
                        }
                    }} />
            </div>

            <TableOnline {headers} data={table_data} bind:trigger={trigger_table} />
        </Container>
    {/if}
{/if}
