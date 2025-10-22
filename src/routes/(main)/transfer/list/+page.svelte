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
    import SellIcon from "$icons/Sell.svelte";

    import { exportToExcel } from "$lib/excel.js";
    import ExcelIcon from "$icons/Excel.svelte";

    let title = "Transfer Listesi";

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
        warehouse_text: "Depo",
        count_text: "Seriler",
    };

    let actions = {
        complete: {
            tooltip: "Tamamla",
            icon: CompleteIcon,
            test: (item) => item.complete === 0 && item.count > 0,
            action: async (item) => {
                Alerter.Question(
                    "Uyarı",
                    `${item.doc} belge numaralı transferi tamamlamak istiyor musunuz?`,
                    "Evet",
                    async () => {
                        let result = await API("/transfer/complete", {
                            no: item.no,
                        });

                        if (!result || !result.success) {
                            Alerter.Error("Kayıt Tamamlama Hatası", result.message);
                            return false;
                        }

                        Toaster.Info("Kayıt başarıyla tamamlandı.");
                        trigger_table();
                    },
                    "İptal",
                );
            },
        },
        view: {
            tooltip: "Görüntüle",
            icon: ViewIcon,
            test: (item) => item.complete === 1 && item.count > 0,
            action: async (item) => {
                goto(`/transfer/view/${item.no}`);
            },
        },
        edit: {
            tooltip: "Düzenle",
            test: (item) => item.complete === 0,
            action: async (item) => {
                goto(`/transfer/edit/${item.no}`);
            },
        },
        delete: {
            tooltip: "Sil",
            test: (item) => item.complete === 0,
            action: async (item) => {
                Alerter.Question(
                    "Uyarı",
                    `${item.doc} belge numaralı transferi silmek istiyor musunuz?`,
                    "Evet",
                    async () => {
                        let result = await API("/transfer/delete", {
                            no: item.no,
                        });

                        if (!result || !result.success) {
                            Alerter.Error("Kayıt Silme Hatası", result.message);
                            return false;
                        }

                        Toaster.Info("Kayıt başarıyla silindi.");
                        trigger_table();
                    },
                    "İptal",
                );
            },
        },
        transfer: {
            tooltip: "Transfer",
            icon: TransferIcon,
            test: (item) => item.complete === 1 && item.transferable,
            action: async (item) => {
                goto(`/transfer/transfer/${item.no}`);
            },
        },

        place_start: {
            tooltip: "Yerleştir",
            icon: WarehouseIcon,
            test: (item) => item.fittable === 1 && item.locked === 0,
            action: async (item) => {
                Alerter.Question(
                    "Uyarı",
                    `${item.doc} belge numaralı transferi yerleştirmek istiyor musunuz?`,
                    "Evet",
                    async () => {
                        let result = await API("/storage/in/transfer/start", {
                            transfer_no: item.no,
                        });

                        if (!result || !result.success) {
                            Alerter.Error("Kayıt Yerleştirme Hatası", result.message);
                            return false;
                        }

                        Toaster.Info("Transfer yerleştirme başladı.");

                        goto(`/transfer/place/${item.no}`);
                    },
                    "İptal",
                );
            },
        },
        place_continue: {
            tooltip: "Yerleştirmeye Devam",
            icon: WarehouseIcon,
            test: (item) => (item.fittable === 1 || item.unfittable === 1) && item.fitted === 0 && item.locked,
            action: async (item) => {
                goto(`/transfer/place/${item.no}`);
            },
        },
        print: {
            tooltip: "Yazdır",
            icon: PrinterIcon,
            action: async (item) => {
                let alert = Alerter.Alert("Uyarı", `${item.doc} belge numaralı transferi ne yapmak istiyorsunuz?`);
                alert.type("question");
                alert.positive("Yazdır", async () => {
                    goto(`/transfer/print/${item.no}`);
                });
                alert.negative("Excel", async () => {
                    let transfer_assets = await API("/transfer/assets/all", {
                        detail: 1,
                        tas_transfer_no: item.no,
                    });

                    if (!transfer_assets || !transfer_assets.success) {
                        Alerter.Error("Uyarı", "Transfer serileri bulunamadı");
                        return;
                    }

                    transfer_assets = transfer_assets.data;

                    // ...existing code...
                });
                alert.neutral("İptal");
                alert.show();
            },
        },
        sell: {
            tooltip: "Sat",
            icon: SellIcon,
            test: (item) => item.sellable,
            action: async (item) => {
                Alerter.Question(
                    "Uyarı",
                    `${item.doc} belge numaralı transferini bayi satışına eklemek istiyor musunuz?`,
                    "Evet",
                    async () => {
                        let result = await API("/transfer/sell", {
                            transfer_no: item.no,
                        });

                        if (!result || !result.success) {
                            Alerter.Error("Kayıt Ekleme Hatası", result.message);
                            return false;
                        }

                        Toaster.Info("Kayıt başarıyla eklendi.");

                        goto(`/sell/list`);
                    },
                    "İptal",
                );
            },
        },
    };

    async function table_data(page, limit, query) {
        query.detail = 1;

        const data = await PAGINATION("/transfer/all", page, limit, query);

        if (data) {
            for (let item of data.data) {
                item.moment = time(item.moment);

                item.count_text = item.count;
                if (!item.count) {
                    item.count_text = "Boş";
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
