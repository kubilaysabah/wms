<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { API, PAGINATION } from "$lib/api.js";
    import { page } from "$app/stores";

    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";
    import AssetHistory from "$custom/AssetHistory.svelte";

    import Modal from "$comp/modal/Modal.svelte";
    import Form from "$comp/form/Form.svelte";
    import Input from "$comp/form/Input.svelte";
    import Submit from "$comp/form/Submit.svelte";
    import Select from "$comp/form/Select.svelte";

    import HistoryIcon from "$icons/History.svelte";

    let loading = true;

    let stock_no = $page.params.stock_no;

    let stock = false;
    async function fetch_stock() {
        let answer = await API("/stock/one", {
            no: stock_no,
            detail: 1,
        });

        if (!answer || !answer.success) {
            return;
        }

        stock = answer.data;
    }

    let trigger_table = () => {};

    let title = "Stoktan Transfer";

    let search = ["serial"];

    let headers = {
        no: "No",
        serial: "Seri",
        warehouse_text: "Depo",
        buy_cost: "Maliyet",
        buy_tax: "Vergi",
        buy_total: "Toplam",
    };

    let filters = {
        ready: {
            initial: [
                {
                    value: "",
                    short: "Durum",
                    name: "Durum Seçin",
                },
            ],
            fetch: async () => {
                const result_data = [];

                result_data.push({
                    value: 0,
                    name: "Değil",
                });
                result_data.push({
                    value: 1,
                    name: "Hazır",
                });
                return result_data;
            },
        },
        warehouse_no: {
            initial: [
                {
                    value: "",
                    short: "Depo",
                    name: "Depo Seçiniz",
                },
            ],
            fetch: async () => {
                let result = await API("/warehouse/all");
                if (!result || !result.success) {
                    return [];
                }

                const result_data = [];
                for (let item of result.data) {
                    result_data.push({
                        value: item.no,
                        name: item.name,
                    });
                }
                return result_data;
            },
        },
        partner_no: {
            initial: [
                {
                    value: "",
                    short: "Mülkiyet",
                    name: "Ortak Seçiniz",
                },
            ],
            fetch: async () => {
                const result_data = [];
                for (let item of PARTNERS) {
                    result_data.push({
                        value: item.no,
                        name: item.name,
                    });
                }
                return result_data;
            },
        },
    };

    let actions = {
        history: {
            tooltip: "Geçmişi Gör",
            icon: HistoryIcon,
            action: async (item) => {
                history_modal_data = await fetch_history(item.no);
            },
        },
    };

    async function table_data(page, limit, query) {
        query.detail = 1;
        query.stock_no = stock_no;
        query.transferable = 1;

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

    onMount(async () => {
        loading = true;
        await fetch_stock();

        if (!stock) {
            Alerter.Error("Bir hata oluştu!", "Stok çekilemedi", () => {
                goto("/stock/list");
            });
            return;
        }

        loading = false;
        title = stock.name;
    });

    let history_modal_data = false;

    let fetch_history = async (no) => {
        let result = await API("/asset/history", {
            no: no,
        });

        if (!result || !result.success) {
            return [];
        }

        return result.data;
    };
    let selection = [];

    let new_transfer_modal_data = false;
    let old_transfer_modal_data = false;

    async function asset_transfer_selected(form_data) {
        let data = {};

        if (selection.length < 1) {
            Alerter.Info("Uyarı", "Lütfen transfer edilecek serileri seçin.");
            return false;
        }

        data.stock_no = stock_no;
        data.warehouse_no = form_data.warehouse_no || 0;
        data.assets = selection;
        data.old_transfer_no = form_data.old_transfer_no || 0;

        let result = await API("/stock/transfer", data);

        if (!result || !result.success) {
            Alerter.Error("Transfer Hatası", result.message);
            return false;
        }

        new_transfer_modal_data = false;
        old_transfer_modal_data = false;

        selection = [];

        Alerter.Success("Transfer başarıyla gerçekleştirildi.", () => {
            trigger_table();
        });
    }
</script>

{#if loading}
    <PageLoader />
{/if}

{#if !loading}
    <Container>
        <AssetHistory bind:open={history_modal_data} data={history_modal_data} />
        <TableOnline
            subtitle={title}
            {headers}
            data={table_data}
            {actions}
            {search}
            {filters}
            empty_message="Transfer edilecek seriler bulunamadı"
            select="no"
            bind:selection
            bind:trigger={trigger_table}
            onselect={(item, all) => {
                if (!item.transferable) {
                    return false;
                }
                return true;
            }}>
            <div slot="buttons">
                <button
                    onclick={() => {
                        if (selection.length < 1) {
                            Alerter.Info("Uyarı", "Lütfen transfer edilecek serileri seçin.");
                            return false;
                        }

                        let alert = Alerter.Alert("Transfer", "Lütfen transfer tipini seçiniz.");
                        alert.type("question");
                        alert.positive("Yeni Transfer", async () => {
                            let transfer_data = {};
                            transfer_data.warehouse_list = {};
                            let result = await API("/warehouse/all");
                            if (!result || !result.success) {
                                Alerter.Error("Uyarı", "Uygun depo bulunamadı");
                                return;
                            }
                            for (let item of result.data) {
                                transfer_data.warehouse_list[item.no] = item.name;
                            }

                            new_transfer_modal_data = transfer_data;
                        });
                        alert.negative("Eski Transfer", async () => {
                            let transfer_data = {};
                            transfer_data.old_transfer_list = {};
                            let result = await API("/transfer/all", {
                                complete: 0,
                            });
                            if (!result || !result.success) {
                                Alerter.Error("Uyarı", "Eski transfer bulunamadı");
                                return;
                            }
                            for (let item of result.data) {
                                transfer_data.old_transfer_list[item.no] = item.doc;
                            }

                            old_transfer_modal_data = transfer_data;
                        });
                        alert.outside(true);
                        alert.show();
                    }}
                    class="btn">
                    Transfer
                </button>
            </div>
        </TableOnline>
    </Container>
    <Modal title="Transfer" bind:open={new_transfer_modal_data} size="xl">
        <Form onsubmit={(data) => asset_transfer_selected(data)}>
            <div class="flex flex-col gap-2">
                <div class="w-full">
                    <Select control="warehouse_no" label="Depo" list={new_transfer_modal_data.warehouse_list} text="Depo Seçiniz" />
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Submit label="Transfer Et" />
            </div>
        </Form>
    </Modal>
    <Modal title="Transfer" bind:open={old_transfer_modal_data} size="xl">
        <Form onsubmit={(data) => asset_transfer_selected(data)}>
            <div class="flex flex-col gap-2">
                <div class="w-full">
                    <Select control="old_transfer_no" label="Eski Transfer" list={old_transfer_modal_data.old_transfer_list} text="Eski Transfer Seçiniz" />
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Submit label="Transfer Et" />
            </div>
        </Form>
    </Modal>
{/if}
