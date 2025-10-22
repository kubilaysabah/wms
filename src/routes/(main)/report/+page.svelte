<script>
    import { goto } from "$app/navigation";
    import Container from "$comp/dashboard/Container.svelte";
    import PrinterIcon from "$icons/Printer.svelte";
    import { API } from "$lib/api.js";
    import * as XLSX from "xlsx";

    let title = "Raporlar";
    let report_working = false;

    async function fetch_asset_report() {
        if (report_working) {
            return;
        }
        report_working = true;
        let answer = await API("/report/asset");

        if (!answer || !answer.success) {
            report_working = false;
            return;
        }

        let excel_data = [];

        excel_data.push(["No", "Seri"]);

        const ws = XLSX.utils.aoa_to_sheet(excel_data);

        report_working = false;
    }
    async function fetch_stock_report() {
        if (report_working) return;
        report_working = true;

        let answer = await API("/report/stock");

        if (!answer || !answer.success) {
            report_working = false;
            return;
        }

        let data = answer.data;
        const warehouses = data.warehouses;
        const warehouseMap = {};
        warehouses.forEach((w) => (warehouseMap[w.no] = w.name));

        const headers = ["Stok Kodu", "Stok Adı", ...warehouses.map((w) => w.name), "TOTAL"];
        const aoa = [headers];

        const stocks = data.stocks;
        for (const key in stocks) {
            const stock = stocks[key].stock;
            const counts = stocks[key].counts;

            const depo_sayilari = warehouses.map((w) => counts[w.no] ?? 0);
            const toplam = depo_sayilari.reduce((a, b) => a + b, 0);

            const row = [stock.code, stock.name, ...depo_sayilari, toplam];

            aoa.push(row);
        }

        const ws = XLSX.utils.aoa_to_sheet(aoa);

        ws["!cols"] = headers.map(() => ({ wch: 25 }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stoklar");
        XLSX.writeFile(wb, "stok_raporu.xlsx");

        report_working = false;
    }

    async function fetch_count_report() {
        if (report_working) return;
        report_working = true;

        let answer = await API("/report/count");

        if (!answer || !answer.success) {
            report_working = false;
            return;
        }

        let aoa = [];

        for (let [key, value] of Object.entries(answer.data)) {
            aoa.push([value.warehouse.name + ": " + (value.assets.processed.length + value.assets.raw.length) + " Adet"]);

            if (value.assets.raw.length) {
                aoa.push(["", "HAMLAR: " + value.assets.raw.length + " Adet"]);
                aoa.push(["", "", "", "", "", "", "", "", ""]);
                aoa.push(["", "", "SERİ", "STOK KODU", "STOK ADI", "ALIŞ FİYATI", "ALIŞ ORAN", "ALIŞ KDV", "ALIŞ TOPLAM"]);

                for (let asset of value.assets.raw) {
                    aoa.push(["", "", asset.serial, asset.stock.code, asset.stock.name, asset.buy_cost, asset.buy_rate * 100, asset.buy_tax, asset.buy_total]);
                }
            }
            if (value.assets.processed.length) {
                aoa.push(["", "", "", "", "", "", "", "", ""]);
                aoa.push(["---------", "---------", "---------", "---------", "---------", "---------", "---------", "---------", "---------"]);
                aoa.push(["", "", "", "", "", "", "", "", ""]);

                aoa.push(["", "İŞLENMİŞLER: " + value.assets.processed.length + " Adet"]);
                aoa.push(["", "", "", "", "", "", "", "", ""]);
                aoa.push(["", "", "SERİ", "STOK KODU", "STOK ADI", "ALIŞ FİYATI", "ALIŞ ORAN", "ALIŞ KDV", "ALIŞ TOPLAM"]);

                for (let asset of value.assets.processed) {
                    aoa.push(["", "", asset.serial, asset.stock.code, asset.stock.name, asset.buy_cost, asset.buy_rate * 100, asset.buy_tax, asset.buy_total]);
                }
            }
            
            aoa.push(["", "", "", "", "", "", "", "", ""]);
            aoa.push(["", "", "", "", "", "", "", "", ""]);
            aoa.push(["---------", "---------", "---------", "---------", "---------", "---------", "---------", "---------", "---------"]);
            aoa.push(["", "", "", "", "", "", "", "", ""]);
            aoa.push(["", "", "", "", "", "", "", "", ""]);
        }

        const ws = XLSX.utils.aoa_to_sheet(aoa);

        ws["!cols"] = [{ wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 80 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stoklar");
        XLSX.writeFile(wb, "sayim_raporu.xlsx");

        report_working = false;
    }
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<Container>
    <div class="flex flex-col gap-6">
        <div
            class="bg-float-light rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onclick={() => {
                Alerter.Question("Soru", "Stok raporu oluşturulsun mu?", () => {
                    fetch_stock_report();
                });
            }}>
            <div class="flex items-center p-4 gap-4 bg-brand-back/5">
                <div class="rounded-full bg-brand-back/10 p-3">
                    <PrinterIcon />
                </div>
                <div>
                    <h1 class="text-2xl font-semibold text-reverse">Stok Raporu</h1>
                </div>
            </div>
            <div class="px-4 py-3">
                <p class="text-sm text-reverse">Depolardaki stokların görüntülenmesini sağlar</p>
            </div>
        </div>

        <div
            class="bg-float-light rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onclick={() => {
                Alerter.Question("Soru", "Sayım raporu oluşturulsun mu?", () => {
                    fetch_count_report();
                });
            }}>
            <div class="flex items-center p-4 gap-4 bg-brand-back/5">
                <div class="rounded-full bg-brand-back/10 p-3">
                    <PrinterIcon />
                </div>
                <div>
                    <h1 class="text-2xl font-semibold text-reverse">Sayım Raporu</h1>
                </div>
            </div>
            <div class="px-4 py-3">
                <p class="text-sm text-reverse">Bu raporun içinde sayım raporunu analiz edebilirsiniz</p>
            </div>
        </div>
    </div>
</Container>
