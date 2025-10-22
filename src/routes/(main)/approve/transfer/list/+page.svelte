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

    let title = "Transfer Onay Listesi";

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
        tap_warehouse_text: "Kaynak Depo",
        warehouse_text: "Hedef Depo",
        count_text: "Seriler",
    };

    let actions = {
        auth_direct: {
            tooltip: "Onayla Direkt",
            icon: CompleteIcon,
            test: (item) => item.auth_no === $USER.no && item.complete === 0 && item.tap_count > 0 && item.tap_authed === 0,
            action: async (item) => {
                console.log("ITEM", item);
                Alerter.Question(
                    "Uyarı",
                    `${item.doc}  belge numaralı transferi ${item.tap_warehouse_text} deposundan ${item.warehouse_text} deposuna transfer edilmesini onaylamak istiyor musunuz?`,
                    "Evet",
                    async () => {
                        let result = await API("/transfer/approve/auth", {
                            transfer_no: item.no,
                            transfer_approve_no: item.tap_no,
                        });

                        if (!result || !result.success) {
                            Alerter.Error("Kayıt Onaylama Hatası", result.message);
                            return false;
                        }

                        Toaster.Info("Kayıt başarıyla onaylandı.");
                        trigger_table();
                    },
                    "İptal",
                );
            },
        },
        approve_direct: {
            tooltip: "Onayla Direkt",
            icon: CompleteIcon,
            test: (item) => item.user_no === $USER.no && item.tap_warehouse.managed === 0 && item.complete === 0 && item.tap_count > 0 && item.tap_authed === 1 && item.tap_approved === 0,
            action: async (item) => {
                Alerter.Question(
                    "Uyarı",
                    `${item.doc}  belge numaralı transferi ${item.tap_warehouse_text} deposundan ${item.warehouse_text} deposuna transfer edilmesini onaylamak istiyor musunuz?`,
                    "Evet",
                    async () => {
                        let result = await API("/transfer/approve/direct", {
                            transfer_no: item.no,
                            transfer_approve_no: item.tap_no,
                        });

                        if (!result || !result.success) {
                            Alerter.Error("Kayıt Onaylama Hatası", result.message);
                            return false;
                        }

                        Toaster.Info("Kayıt başarıyla onaylandı.");
                        trigger_table();
                    },
                    "İptal",
                );
            },
        },
        approve_managed: {
            tooltip: "Onayla Yömnetilebilir",
            icon: CompleteIcon,
            test: (item) => item.user_no === $USER.no && item.tap_warehouse.managed === 1 && item.complete === 0 && item.tap_count > 0 && item.tap_authed === 1 && item.tap_approved === 0,
            action: async (item) => {
                goto(`/approve/transfer/managed/${item.tap_no}`);
            },
        },
    };

    async function table_data(page, limit, query) {
        query.detail = 1;

        const data = await PAGINATION("/transfer/approve/view/all", page, limit, query);

        if (data) {
            for (let item of data.data) {
                item.moment = time(item.moment);

                item.count_text = item.tap_count;
                if (!item.tap_count) {
                    item.count_text = "Boş";
                }

                if (item.tap_warehouse_no) {
                    let warehouse_indicators = [];

                    if (item.tap_warehouse.service) {
                        warehouse_indicators.push("SR");
                    }

                    if (item.warehouse.buy) {
                        warehouse_indicators.push("AL");
                    }

                    if (item.tap_warehouse.sell) {
                        warehouse_indicators.push("SA");
                    }

                    item.tap_warehouse_text = item.tap_warehouse.name;
                    if (warehouse_indicators.length > 0) {
                        item.tap_warehouse_text += " (" + warehouse_indicators.join(",") + ")";
                    }
                } else {
                    item.tap_warehouse_text = "Dışarıda";
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
