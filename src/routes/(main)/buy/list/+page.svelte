<script>
    import { API, PAGINATION } from "$lib/api.js";
    import { goto } from "$app/navigation";

    import Container from "$comp/dashboard/Container.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";
    import { Money } from "$lib/number";

    import ViewIcon from "$icons/View.svelte";
    import CompleteIcon from "$icons/Complete.svelte";
    import ServiceIcon from "$icons/Service.svelte";
    import TransferIcon from "$icons/Transfer.svelte";
    import PrinterIcon from "$icons/Printer.svelte";
    import ExcelIcon from "$icons/Excel.svelte";
    import { exportToExcel } from "$src/lib/excel";

    let title = "Alım Listesi";

    let search = ["doc"];

    let filters = {
        account_no: {
            initial: [
                {
                    value: "",
                    short: "Satıcı",
                    name: "Cari Seçiniz",
                },
            ],
            fetch: async () => {
                let result = await API("/account/all");
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
        warehouse_no: {
            initial: [
                {
                    value: "",
                    short: "Depo",
                    name: "Depo Seçiniz",
                },
            ],
            fetch: async () => {
                let result = await API("/warehouse/all", {
                    buy: 1,
                });
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

    let headers = {
        no: "No",
        doc: "Belge No",
        moment: "Tarih",
        warehouse_text: "Depo",
        "account:name": "Satıcı",
        "partner:name": "Mülkiyet",
        count_text: "Seriler",
        tax: "Vergi",
        sub: "Ara Toplam",
        total: "Toplam",
    };

    let actions = {
        complete: {
            tooltip: "Tamamla",
            icon: CompleteIcon,
            test: (item) => item.complete === 0 && item.count > 0,
            action: async (item) => {
                Alerter.Question(
                    "Uyarı",
                    `${item.doc} belge numaralı alımı tamamlamak istiyor musunuz?`,
                    "Evet",
                    async () => {
                        let result = await API("/buy/complete", {
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
        edit: {
            tooltip: "Düzenle",
            test: (item) => item.complete === 0,
            action: async (item) => {
                goto(`/buy/edit/${item.no}`);
            },
        },
        view: {
            tooltip: "Görüntüle",
            icon: ViewIcon,
            test: (item) => item.complete === 1 && item.count > 0,
            action: async (item) => {
                goto(`/buy/view/${item.no}`);
            },
        },
        delete: {
            tooltip: "Sil",
            test: (item) => item.complete === 0,
            action: async (item) => {
                Alerter.Question(
                    "Uyarı",
                    `${item.doc} belge numaralı alımı silmek istiyor musunuz?`,
                    "Evet",
                    async () => {
                        let result = await API("/buy/delete", {
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
                goto(`/buy/transfer/${item.no}`);
            },
        },
        print: {
            tooltip: "Yazdır",
            icon: PrinterIcon,
            test: (item) => item.complete === 1,
            action: async (item) => {
                goto(`/buy/print/${item.no}`);
            },
        },
        excel: {
            tooltip: "Excel",
            icon: ExcelIcon,
            test: (item) => item.complete === 1,
            action: async (item) => {
                const response = await API("/buy/excel", {
                    no: item.no,
                });

                if (!response || !response.success) {
                    Alerter.Error("Excel Oluşturma Hatası", excel_req.message);
                    return false;
                }
                

                exportToExcel({
                    headers: ["Stok Kodu", "Stok Adı", "Adet", "Maliyet", "Vergi", "Ara Toplam", "Toplam"],
                    fileName: 'alim_listesi_' + Date.now().toString(),
                    data: response?.data?.entries?.map((item) => [
                        item.stock.code,
                        item.stock.name,
                        item.stock.count,
                        item.cost,
                        item.tax,
                        item.sub,
                        item.total
                    ]),
                    footerData: [
                        [],
                        [],
                        [],
                        [],
                        [],
                        ["Ara Toplam", response?.data?.sub],
                        ["Vergi Toplamı", response?.data?.tax],
                        ["Toplam", response?.data?.total],
                    ],
                });
            },
        },
    };

    let data = null;

    async function table_data(page, limit, query) {
        query.detail = 1;

        data = await PAGINATION("/buy/all", page, limit, query);

        if (data) {
            for (let item of data.data) {
                item.total = price(item.total, "₺");
                item.tax = price(item.tax, "₺");
                item.sub = price(item.sub, "₺");
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
        } else {
            data = null;
        }

        return data;
    }

    let trigger_table = () => {};
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<Container>
    <TableOnline {title} {headers} data={table_data} {actions} {search} bind:trigger={trigger_table} bind:filters>
        <div slot="buttons">
            <button onclick={() => goto("/buy/add")} class="btn">Yeni</button>
        </div>

        <div slot="bottom">
            <ul class="space-y-3 text-lg font-semibold mt-5 text-right">
                <li>
                    Ara Toplam: {Money(data?.extra?.totals?.sub)}
                </li>
                <li>
                    Vergiler Toplam: {Money(data?.extra?.totals?.tax)}
                </li>
                <li>
                    Toplam: {Money(data?.extra?.totals?.total)}
                </li>
            </ul>
        </div>
    </TableOnline>
</Container>
