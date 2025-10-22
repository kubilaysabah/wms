import { exportToExcel } from "../excel.js";

/**
 * Excel sütun genişlikleri için varsayılan ayarlar
 */
export const DEFAULT_COLUMN_WIDTHS = {
    transaction: [
        { wch: 15 }, // Stok Kodu
        { wch: 30 }, // Stok Adı
        { wch: 10 }, // Adet
        { wch: 10 }, // KDV
        { wch: 15 }, // Vergi
        { wch: 15 }, // Ara Toplam
        { wch: 15 }, // Toplam
    ],
    transfer: [
        { wch: 25 }, // Seri
        { wch: 25 }, // Stok Kodu
        { wch: 100 }, // Stok Adı
        { wch: 25 }, // Depo
    ],
};

/**
 * Excel başlıkları için varsayılan ayarlar
 */
export const DEFAULT_HEADERS = {
    transaction: {
        entry: ["Stok Kodu", "Stok Adı", "Adet", "KDV", "Vergi", "Ara Toplam", "Toplam"],
        asset: ["", "Seri", "Fiyat", "Vergi", "Toplam"],
    },
    transfer: ["Seri", "Stok Kodu", "Stok Adı", "Depo"],
};

/**
 * Hareket verilerini Excel formatına dönüştüren yardımcı fonksiyon
 * @param {Object} config - Excel dışa aktarma konfigürasyonu
 * @param {Object} config.data - API'den gelen veri
 * @param {string} config.docNumber - Belge numarası
 * @param {string} config.date - Belge tarihi
 * @param {string} config.type - İşlem tipi ('buy' veya 'sell')
 * @returns {Array} Excel formatında veri
 */
export const prepareTransactionData = ({ data, docNumber, date, type }) => {
    const excelData = [];
    const transactionType =
        type === "buy"
            ? {
                  title: "Alış Faturası",
                  prefix: "Alis",
                  costField: "buy_cost",
                  taxField: "buy_tax",
                  totalField: "buy_total",
                  stockCodeField: "stock_code",
                  stockNameField: "stock_name",
              }
            : {
                  title: "Satış Faturası",
                  prefix: "Satis",
                  costField: "sell_cost",
                  taxField: "sell_tax",
                  totalField: "sell_total",
                  stockCodeField: "stock.code",
                  stockNameField: "stock.name",
              };

    // Başlık bilgileri
    excelData.push([`Belge No: ${docNumber}`]);
    excelData.push([`Tarih: ${date}`]);
    excelData.push([]); // Boş satır

    // Entry headers
    excelData.push(DEFAULT_HEADERS.entry);

    // Entry verileri
    for (const entry of data.entries) {
        excelData.push([type === "buy" ? entry.stock_code : entry.stock.code, type === "buy" ? entry.stock_name : entry.stock.name, entry.count, "%" + entry.rate * 100, entry.tax, entry.sub, entry.total]);

        // Asset'ler varsa
        if (entry.assets?.length > 0) {
            excelData.push(DEFAULT_HEADERS.asset);
            for (const asset of entry.assets) {
                excelData.push(["", asset.serial, asset[transactionType.costField], asset[transactionType.taxField], asset[transactionType.totalField]]);
            }
            excelData.push([]); // Boş satır
        }
    }

    // Toplam bilgileri
    const totals = data[type];
    excelData.push([]);
    excelData.push(["Ara Toplam:", "", "", "", "", "", totals.sub]);
    excelData.push(["Vergiler Toplam:", "", "", "", "", "", totals.tax]);
    excelData.push(["Toplam:", "", "", "", "", "", totals.total]);

    return {
        data: excelData,
        filename: `${transactionType.prefix}_${docNumber}`,
        sheetName: transactionType.title,
    };
};

/**
 * İşlem verilerini Excel dosyasına aktaran ana fonksiyon
 * @param {Object} config - Excel dışa aktarma konfigürasyonu
 * @param {Object} config.data - API'den gelen veri
 * @param {string} config.docNumber - Belge numarası
 * @param {string} config.date - Belge tarihi
 * @param {string} config.type - İşlem tipi ('buy' veya 'sell')
 * @param {Array} [config.columnWidths] - Özel sütun genişlikleri
 */
export const exportTransaction = ({ data, docNumber, date, type }) => {
    const {
        data: excelData,
        filename,
        sheetName,
    } = prepareTransactionData({
        data,
        docNumber,
        date,
        type,
    });

    exportToExcel({
        filename,
        sheetName,
        data: excelData,
        columnWidths: DEFAULT_COLUMN_WIDTHS.transaction
    });
};

/**
 * Transfer verilerini Excel formatına dönüştüren yardımcı fonksiyon
 * @param {Object} config - Excel dışa aktarma konfigürasyonu
 * @param {Array} config.assets - Transfer asset verileri
 * @param {string} config.docNumber - Belge numarası
 * @returns {Object} Excel formatında veri ve ayarlar
 */
const prepareTransferData = ({ assets, docNumber }) => {
    const excelData = [DEFAULT_HEADERS.transfer];

    for (const asset of assets) {
        excelData.push([
            asset.serial,
            asset.stock.code,
            asset.stock.name,
            asset.warehouse.name
        ]);
    }

    return {
        data: excelData,
        filename: `Transfer_${docNumber}`,
        sheetName: "Stoklar"
    };
};

/**
 * Transfer verilerini Excel dosyasına aktaran fonksiyon
 * @param {Object} config - Excel dışa aktarma konfigürasyonu
 * @param {Array} config.assets - Transfer asset verileri
 * @param {string} config.docNumber - Belge numarası
 */
export const exportTransfer = ({ assets, docNumber }) => {
    const { data: excelData, filename, sheetName } = prepareTransferData({
        assets,
        docNumber
    });

    exportToExcel({
        filename,
        sheetName,
        data: excelData,
        columnWidths: DEFAULT_COLUMN_WIDTHS.transfer
    });
};
