<script>
    import { page } from "$app/stores";
    import { API, PAGINATION } from "$lib/api.js";
    import { onMount } from "svelte";

    import Container from "$comp/dashboard/Container.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";
    import HistoryIcon from "$icons/History.svelte";
    import AssetHistory from "$custom/AssetHistory.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";

    let loading = true;

    let warehouse_no = $page.params.warehouse_no;

    let warehouse = false;
    async function fetch_warehouse() {
        let answer = await API("/warehouse/one", {
            no: warehouse_no,
            detail: 1,
        });

        if (!answer || !answer.success) {
            return;
        }

        warehouse = answer.data;
    }

    let title = "Depo Seri Listesi";

    let search = ["serial","stock_code","stock_name"];

    let headers = {
        no: "No",
        serial: "Seri",
        "partner:name": "Mülkiyet",
        "warehouse:name": "Konum",
        "stock:name": "Stok",
        buy_cost: "Maliyet",
        buy_tax: "Vergi",
        buy_total: "Toplam",
    };

    let actions = {
        history: {
            icon: HistoryIcon,
            action: async (item) => {
                history_data = await fetch_history(item.no);
                history_modal_open = true;
            },
        },
    };

    let history_modal_open = false;
    let history_data = {};

    let fetch_history = async (no) => {
        let result = await API("/asset/history", {
            no: no,
        });

        if (!result || !result.success) {
            return [];
        }

        return result.data;
    };

    async function table_data(page, limit, query) {
        query.detail = 1;
        query.warehouse_no = warehouse_no;

        let data = await PAGINATION("/asset/all", page, limit, query);

        if (data) {
            for (let item of data.data) {
                item.buy_total = price(item.buy_total, "₺");
                item.buy_cost = price(item.buy_cost, "₺");
                item.buy_tax = price(item.buy_tax, "₺");
            }
        }

        return data;
    }

    onMount(async () => {
        loading = true;
        await fetch_warehouse();

        if (!warehouse) {
            Alerter.Error("Bir hata oluştu!", "Depo çekilemedi", () => {
                goto("/buy/list");
            });
            return;
        }

        loading = false;
    });
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<Container>
    <TableOnline {title} {headers} data={table_data} {search} {actions} />
    <AssetHistory bind:open={history_modal_open} data={history_data} />
</Container>
