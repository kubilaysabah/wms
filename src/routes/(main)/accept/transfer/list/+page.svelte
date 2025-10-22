<script>
    import { API, PAGINATION } from "$lib/api.js";
    import { goto } from "$app/navigation";

    import Container from "$comp/dashboard/Container.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";

    import ViewIcon from "$icons/View.svelte";
    import CompleteIcon from "$icons/Complete.svelte";
    import TransferIcon from "$icons/Transfer.svelte";
    import PrinterIcon from "$icons/Printer.svelte";
    import WarehouseIcon from "$icons/Warehouse.svelte";
    import { USER } from "$lib/api.js";

    let title = "Transfer Kabul Listesi";

    let search = ["doc"];

    let filters = {
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
    };

    let headers = {
        no: "No",
        doc: "Belge No",
        moment: "Tarih",
        tac_warehouse_text: "Kaynak Depo",
        warehouse_text: "Hedef Depo",
        count_text: "Seriler",
    };

    let actions = {
        accept: {
            tooltip: "Onayla",
            icon: CompleteIcon,
            test: (item) => item.user_no === $USER.no && item.complete === 0 && item.tac_count > 0 && item.tac_accepted === 0,
            action: async (item) => {
                goto(`/accept/transfer/${item.tac_no}`);
            },
        },
    };

    async function table_data(page, limit, query) {
        query.detail = 1;

        const data = await PAGINATION("/transfer/accept/view/all", page, limit, query);

        if (data) {
            for (let item of data.data) {
                item.moment = time(item.moment);

                item.count_text = item.tac_count;
                if (!item.tac_count) {
                    item.count_text = "Boş";
                }

                if (item.tac_warehouse_no) {
                    let warehouse_indicators = [];

                    if (item.tac_warehouse.service) {
                        warehouse_indicators.push("SR");
                    }

                    if (item.warehouse.buy) {
                        warehouse_indicators.push("AL");
                    }

                    if (item.tac_warehouse.sell) {
                        warehouse_indicators.push("SA");
                    }

                    item.tac_warehouse_text = item.tac_warehouse.name;
                    if (warehouse_indicators.length > 0) {
                        item.tac_warehouse_text += " (" + warehouse_indicators.join(",") + ")";
                    }
                } else {
                    item.tac_warehouse_text = "Dışarıda";
                }

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

    let trigger_table = () => {};
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<Container>
    <TableOnline {title} {headers} data={table_data} {actions} {search} bind:trigger={trigger_table} bind:filters></TableOnline>
</Container>
