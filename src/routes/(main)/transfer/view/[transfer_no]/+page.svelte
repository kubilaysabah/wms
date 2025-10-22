<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { API, PAGINATION } from "$lib/api.js";
    import CNF from "$lib/conf.js";
    import { page } from "$app/stores";

    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";
    import AssetHistory from "$custom/AssetHistory.svelte";

    import Form from "$comp/form/Form.svelte";
    import Input from "$comp/form/Input.svelte";
    import Select from "$comp/form/Select.svelte";
    import LiveSearch from "$comp/form/LiveSearch.svelte";

    import PlusIcon from "$icons/Plus.svelte";
    import TrashIcon from "$icons/Trash.svelte";
    import HistoryIcon from "$icons/History.svelte";
    import UpIcon from "$icons/Up.svelte";
    import DownIcon from "$icons/Down.svelte";
    import Spacer from "$comp/spacer/Spacer.svelte";
    import Submit from "$comp/form/Submit.svelte";
    import TextArea from "$comp/form/TextArea.svelte";

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

    let search = ["serial", "stock_code", "stock_name"];

    let headers = {
        no: "No",
        serial: "Seri",
        warehouse_text: "Depo",
        buy_cost: "Maliyet",
        buy_tax: "Vergi",
        buy_total: "Toplam",
        "stock.name": "Stok",
    };

    let trigger_table = () => {};

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
        query.tas_transfer_no = transfer_no;

        const data = await PAGINATION("/transfer/assets/all", page, limit, query);

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
        await fetch_transfer();

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
        <TableOnline {title} {headers} data={table_data} {search} {actions} bind:trigger={trigger_table}></TableOnline>
    </Container>
{/if}
