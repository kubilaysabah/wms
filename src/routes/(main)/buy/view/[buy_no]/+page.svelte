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
    }

    let title = "Alım Seri Listesi";

    let search = ["serial", "stock_code", "stock_name"];

    let headers = {
        no: "No",
        serial: "Seri",
        warehouse_text: "Depo",
        "stock.name": "Stok",
        buy_cost: "Maliyet",
        buy_tax: "Vergi",
        buy_total: "Toplam",
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
        query.buy_no = buy_no;

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
        <AssetHistory bind:open={history_modal_data} data={history_modal_data} {actions} />
        <div class="flex flex-col border border-border-mid rounded-2xl mb-4">
            <div class="flex items-center justify-between p-4 border-b border-border-mid">
                <h2 class="text-lg font-semibold">{buy.doc}</h2>
                <div>
                    <span class="text-sm bg-fore text-back p-2 rounded-xl">{time(buy.moment)}</span>
                </div>
            </div>
            <div class="flex items-center justify-between p-4 border-b border-border-mid">
                <div>
                    <span class="text-sm bg-fore text-back p-2 rounded-xl">{buy.account.name} > {buy.partner.name}</span>
                </div>
                <div>{buy.warehouse.name}</div>
            </div>
            <div class="flex md:flex-row flex-col items-end md:items-center justify-between p-4">
                <div>Mal Sayısı : {buy.count}</div>
                <div>Ara Toplam : {globalThis.price(buy.sub, "₺")}</div>
                <div>Vergi : {globalThis.price(buy.tax, "₺")}</div>
                <div>Toplam : {globalThis.price(buy.total, "₺")}</div>
            </div>
        </div>
        <TableOnline {title} {headers} data={table_data} {search}></TableOnline>
    </Container>
{/if}
