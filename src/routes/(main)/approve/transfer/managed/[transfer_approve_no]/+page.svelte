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

    let transfer_approve_no = $page.params.transfer_approve_no;

    let transfer_approve = false;
    async function fetch_transfer_approve() {
        let answer = await API("/transfer/approve/one", {
            no: transfer_approve_no,
            detail: 2,
        });

        if (!answer || !answer.success) {
            return;
        }

        transfer_approve = answer.data;
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

    let actions = {
        start: {
            tooltip: "Başlat",
            icon: CompleteIcon,
            test: (item) => item.tas_approved === 0,
            action: async (item) => {
                Alerter.Question("Başlat", "Bu seriyi onaylamak istiyor musunuz ?", "Evet", async () => {
                    let result = await API("/transfer/approve/asset/start", {
                        asset_no: item.no,
                        transfer_approve_no: transfer_approve.no,
                    });

                    if (!result || !result.success) {
                        Alerter.Error("Başlatma Hatası", result.message);
                        return false;
                    }

                    temp_slot = result.data.slot;
                    temp_asset = result.data.asset;
                    temp_segment = result.data.segment;

                    barcode_state = 1;
                    barcode_placeholder = "Segment barkodunu okutun";
                    barcode_segment_message = "Okutmanız gereken segment : " + result.data.segment.location;
                    barcode_slot_message = "Çıkarılacak Slot : " + result.data.slot.label;
                });
            },
        },
    };

    let trigger_table = () => {};

    async function table_data(page, limit, query) {
        query.detail = 1;
        query.tap_no = transfer_approve.no;
        query.tas_approved = 0;

        const data = await PAGINATION("/transfer/approve/asset/view/all", page, limit, query);

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

    let transfer_approve_approved = false;

    async function check_transfer_approve_approved() {
        let data = await API("/transfer/approve/approved", {
            transfer_approve_no: transfer_approve.no,
        });

        if (!data || !data.success) {
            transfer_approve_approved = false;
            return false;
        }

        transfer_approve_approved = true;
    }

    onMount(async () => {
        loading = true;
        await fetch_transfer_approve();
        await check_transfer_approve_approved();

        if (!transfer_approve) {
            Alerter.Error("Bir hata oluştu!", "Transfer çekilemedi", () => {
                goto("/approve/transfer/list");
            });
            return;
        }

        if (transfer_approve.approved) {
            Alerter.Error("Bir hata oluştu!", "Transfer onaylandı!", () => {
                goto("/approve/transfer/list");
            });
            return;
        }

        loading = false;
    });

    let barcode_segment_message = "";
    let barcode_slot_message = "";
    let barcode_placeholder = "";
    let barcode_state = 0;

    let temp_slot = false;
    let temp_asset = false;
    let temp_segment = false;
</script>

{#if loading}
    <PageLoader />
{/if}

{#if !loading}
    {#if transfer_approve_approved}
        <Container>
            <div class="flex items-center justify-center h-screen">
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <button
                    class="btn text-lg font-semibold"
                    onclick={() => {
                        Alerter.Question("Tamamlanmış", "Bu transferi onaylıyor musunuz ?", "Evet", async () => {
                            let result = await API("/transfer/approve/managed", {
                                transfer_no: transfer_approve.transfer.no,
                                transfer_approve_no: transfer_approve.no,
                            });

                            if (!result || !result.success) {
                                Alerter.Error("Onaylama Hatası", result.message);
                                return false;
                            }

                            Alerter.Success("Transfer onaylandı.", () => {
                                goto("/approve/transfer/list");
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
                    <h2 class="text-lg font-semibold">{transfer_approve.transfer.doc}</h2>
                    <div>
                        <span class="text-sm bg-fore text-back p-2 rounded-xl">{time(transfer_approve.transfer.moment)}</span>
                    </div>
                </div>
                <div class="flex items-center justify-between p-4">
                    <div>{transfer_approve.transfer.warehouse.name}</div>
                </div>
            </div>
            {#if barcode_state > 0}
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
                        onkeyup={async (e) => {
                            if (e.keyCode !== 13) {
                                return;
                            }

                            let value = e.target.value;

                            e.target.value = "";

                            if (!value) {
                                return;
                            }

                            if (barcode_state === 1) {
                                if (value != temp_segment.location) {
                                    Toaster.Error("Segment barkodu uyuşmuyor.");
                                    return;
                                }
                                let result = await API("/transfer/approve/asset/continue", {
                                    transfer_approve_no,
                                    barcode: value,
                                    asset_no: temp_asset.no,
                                    slot_no: temp_slot.no,
                                });

                                if (!result || !result.success) {
                                    Toaster.Error("Seçim Hatası " + result.message);
                                    return;
                                }

                                temp_slot = result.data.slot;
                                temp_asset = result.data.asset;
                                temp_segment = result.data.segment;

                                barcode_segment_message = "Lütfen aldığınız seriyi okutun";
                                barcode_slot_message = "Çıkarılacak Slot : " + temp_slot.label;

                                barcode_state = 2;
                                barcode_placeholder = "Serinin barkodunu okutun";

                                Toaster.Info("Cihaz seçildi.");
                            } else if (barcode_state === 2) {
                                if (value != temp_asset.serial) {
                                    Toaster.Error("Serinin barkodu uyuşmuyor.");
                                    return;
                                }

                                let result = await API("/transfer/approve/asset/end", {
                                    transfer_approve_no,
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

                                barcode_segment_message = "";
                                barcode_slot_message = "";
                                barcode_placeholder = "";
                                barcode_state = 0;

                                Toaster.Info("Cihaz çıkarıldı.");
                                trigger_table();
                                check_transfer_approve_approved();
                            }
                        }} />
                </div>
            {/if}
            <TableOnline {headers} data={table_data} bind:trigger={trigger_table} {actions} />
        </Container>
    {/if}
{/if}
