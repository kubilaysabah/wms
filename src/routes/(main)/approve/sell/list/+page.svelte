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

    let title = "Satış Onay Listesi";

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
        sap_warehouse_text: "Depo",
        count_text: "Seriler",
        total: "Toplam",
    };

    let actions = {
        view: {
            tooltip: "Görüntüle",
            icon: ViewIcon,
            test: (item) => item.count > 0,
            action: async (item) => {
                goto(`/approve/sell/view/${item.no}`);
            },
        },
        auth_direct: {
            tooltip: "Onayla Direkt",
            icon: CompleteIcon,
            test: (item) => item.auth_no === $USER.no && item.complete === 0 && item.sap_count > 0 && item.sap_authed === 0,
            action: async (item) => {
                Alerter.Question(
                    "Uyarı",
                    `${item.doc}  belge numaralı satış serisini onaylamak istiyor musunuz?`,
                    "Evet",
                    async () => {
                        let result = await API("/sell/approve/auth", {
                            sell_no: item.no,
                            sell_approve_no: item.sap_no,
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
            test: (item) => item.user_no === $USER.no && item.sap_warehouse.managed === 0 && item.complete === 0 && item.sap_count > 0 && item.sap_authed === 1 && item.sap_approved === 0,
            action: async (item) => {
                Alerter.Question(
                    "Uyarı",
                    `${item.doc} belge numaralı satış serisini onaylamak istiyor musunuz?`,
                    "Evet",
                    async () => {
                        let result = await API("/sell/approve/direct", {
                            sell_no: item.no,
                            sell_approve_no: item.sap_no,
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
            test: (item) => item.user_no === $USER.no && item.sap_warehouse.managed === 1 && item.complete === 0 && item.sap_count > 0 && item.sap_authed === 1  && item.sap_approved === 0,
            action: async (item) => {
                goto(`/approve/sell/managed/${item.sap_no}`);
            },
        },
    };

    async function table_data(page, limit, query) {
        query.detail = 1;
        query.sap_approved = 0;

        const data = await PAGINATION("/sell/approve/view/all", page, limit, query);

        if (data) {
            for (let item of data.data) {
                item.moment = time(item.moment);

                item.total = price(item.total," ₺");

                item.count_text = item.sap_count;
                if (!item.sap_count) {
                    item.count_text = "Boş";
                }

                if (item.sap_warehouse_no) {
                    let warehouse_indicators = [];

                    if (item.sap_warehouse.service) {
                        warehouse_indicators.push("SR");
                    }

                    if (item.sap_warehouse.buy) {
                        warehouse_indicators.push("AL");
                    }

                    if (item.sap_warehouse.sell) {
                        warehouse_indicators.push("SA");
                    }

                    item.sap_warehouse_text = item.sap_warehouse.name;
                    if (warehouse_indicators.length > 0) {
                        item.sap_warehouse_text += " (" + warehouse_indicators.join(",") + ")";
                    }
                } else {
                    item.sap_warehouse_text = "Dışarıda";
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
