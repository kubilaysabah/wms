<script>
    import { API, PAGINATION } from "$lib/api.js";
    import { exportToExcel } from "$src/lib/excel";
    import { goto } from "$app/navigation";
    import { Money } from "$lib/number";

    import Container from "$comp/dashboard/Container.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";

    import ViewIcon from "$icons/View.svelte";
    import CompleteIcon from "$icons/Complete.svelte";
    import ServiceIcon from "$icons/Service.svelte";
    import TransferIcon from "$icons/Transfer.svelte";
    import PrinterIcon from "$icons/Printer.svelte";
    import ExcelIcon from "$icons/Excel.svelte";

    let title = "Satış Listesi";

    let search = ["doc"];

    let filters = {
        account_no: {
            initial: [
                {
                    value: "",
                    short: "Alıcı",
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
                    sell: 1,
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
                    `${item.doc} belge numaralı satışını tamamlamak istiyor musunuz?`,
                    "Evet",
                    async () => {
                        let result = await API("/sell/complete", {
                            sell_no: item.no,
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
                goto(`/sell/edit/${item.no}`);
            },
        },
        view: {
            tooltip: "Görüntüle",
            icon: ViewIcon,
            test: (item) => item.complete === 1 && item.count > 0,
            action: async (item) => {
                goto(`/sell/view/${item.no}`);
            },
        },
        delete: {
            tooltip: "Sil",
            test: (item) => item.complete === 0,
            action: async (item) => {
                Alerter.Question(
                    "Uyarı",
                    `${item.doc} belge numaralı satışını silmek istiyor musunuz?`,
                    "Evet",
                    async () => {
                        let result = await API("/sell/delete", {
                            sell_no: item.no,
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
        print: {
            tooltip: "Yazdır",
            icon: PrinterIcon,
            action: async (item) => {
                goto(`/sell/print/${item.no}`);
            },
        },
        excel: {
            tooltip: "Excel",
            icon: ExcelIcon,
            test: (item) => item.complete === 1,
            action: async (item) => {
                let excel_req = await API("/sell/excel", {
                    sell_no: item.no,
                });

                if (!excel_req || !excel_req.success) {
                    Alerter.Error("Excel Oluşturma Hatası", excel_req.message);
                    return false;
                }

                // Excel verisi hazırlama
                const excelData = [];
                const entryHeaders = ["Stok Kodu", "Stok Adı", "Adet", "KDV", "Vergi", "Ara Toplam", "Toplam"];
                const assetHeaders = ["", "Seri", "Fiyat", "Vergi", "Toplam"];

                // Başlık bilgileri
                excelData.push([`Belge No: ${item.doc}`]);
                excelData.push([`Tarih: ${time(item.moment)}`]);
                excelData.push([]); // Boş satır

                // Entry headers
                excelData.push(entryHeaders);

                // Entry verileri
                for (const entry of excel_req.data.entries) {
                    excelData.push([entry.stock.code, entry.stock.name, entry.count, "%" + entry.rate * 100, entry.tax, entry.sub, entry.total]);

                    // Asset'ler varsa
                    if (entry.assets && entry.assets.length > 0) {
                        excelData.push(assetHeaders);
                        for (const asset of entry.assets) {
                            excelData.push(["", asset.serial, asset.sell_cost, asset.sell_tax, asset.sell_total]);
                        }
                        excelData.push([]); // Boş satır
                    }
                }

                // Toplam bilgileri
                excelData.push([]);
                excelData.push(["Ara Toplam:", "", "", "", "", "", excel_req.data.sell.sub]);
                excelData.push(["Vergiler Toplam:", "", "", "", "", "", excel_req.data.sell.tax]);
                excelData.push(["Toplam:", "", "", "", "", "", excel_req.data.sell.total]);

                // Excel'e aktar
                exportToExcel({
                    filename: `Satis_${item.doc}`,
                    sheetName: "Satış Faturası",
                    data: excelData,
                    columnWidths: [
                        { wch: 15 }, // Stok Kodu
                        { wch: 30 }, // Stok Adı
                        { wch: 10 }, // Adet
                        { wch: 10 }, // KDV
                        { wch: 15 }, // Vergi
                        { wch: 15 }, // Ara Toplam
                        { wch: 15 }, // Toplam
                    ],
                });
            },
        },
    };

    let data = null;

    async function table_data(page, limit, query) {
        query.detail = 1;

        data = await PAGINATION("/sell/all", page, limit, query);

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
            <button onclick={() => goto("/sell/add")} class="btn">Yeni</button>
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
