import * as XLSX from "xlsx";

/**
 * Export data to Excel file
 * @param {Object} config - Configuration object for Excel export
 * @param {string} config.fileName - Name of the Excel file (without extension)
 * @param {string} config.sheetName - Name of the sheet
 * @param {Array<Array>} config.data - 2D array of data to export (array of arrays)
 */
export function exportToExcel({ fileName = 'excel', sheetName = 'sayfa 1', headers = [], data = [], footerData = [] }) {
    // Create worksheet from array of arrays, add footerData to the end
    const ws = XLSX.utils.aoa_to_sheet([
        headers,
        ...data,
        ...footerData
    ]);

    // Create workbook and append worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Write file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
}
