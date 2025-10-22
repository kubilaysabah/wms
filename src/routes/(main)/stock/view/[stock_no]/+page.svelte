<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { API, PAGINATION } from "$lib/api.js";
    import { page } from "$app/stores";

    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";
    import AssetHistory from "$custom/AssetHistory.svelte";

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

    let title = "Stok Seri Listesi";

    let search = ["serial", "stock_code", "stock_name"];

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
</script>

{#if loading}
    <PageLoader />
{/if}

{#if !loading}
    <Container>
        <AssetHistory bind:open={history_modal_data} data={history_modal_data} />
        <TableOnline {title} {headers} data={table_data} {actions} {search} {filters}></TableOnline>
    </Container>
{/if}
