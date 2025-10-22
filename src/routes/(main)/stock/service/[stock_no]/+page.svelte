<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { API, PAGINATION } from "$lib/api.js";;
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
        query.servicable = 1;

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

    async function asset_service_selected() {
        let data = {};

        if (selection.length < 1) {
            Alerter.Info("Uyarı", "Lütfen servise alınacak serileri seçin.");
            return false;
        }

        data.stock_no = stock_no;
        data.assets = selection;

        let result = await API("/stock/service", data);

        if (!result || !result.success) {
            Alerter.Error("Servis Hatası", result.message);
            return false;
        }

        selection = [];

        Alerter.Success("Servise alım başarıyla gerçekleştirildi.", () => {
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
            empty_message="Servise alınacak seriler bulunamadı"
            select="no"
            bind:selection
            bind:trigger={trigger_table}
            onselect={(item, all) => {
                if (!item.servicable) {
                    return false;
                }
                return true;
            }}>
            <div slot="buttons">
                <button
                    onclick={() => {
                        if (selection.length < 1) {
                            Alerter.Info("Uyarı", "Lütfen servis edilecek serileri seçin.");
                            return false;
                        }

                        Alerter.Question("Servise Al", selection.length + " Seri için servise alım işlemini onaylıyor musunuz?").positive("Onayla", () => {
                            asset_service_selected();
                        });
                    }}
                    class="btn">
                    Servise Al
                </button>
            </div>
        </TableOnline>
    </Container>
{/if}
