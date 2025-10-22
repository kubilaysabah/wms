import * as XLSX from "xlsx";

/**
 * Export data to Excel file
 * @param {Object} config - Configuration object for Excel export
 * @param {string} config.filename - Name of the Excel file (without extension)
 * @param {string} config.sheetName - Name of the sheet
 * @param {Array<Array>} config.data - 2D array of data to export (array of arrays)
 * @param {Array<Object>} config.columnWidths - Array of column width objects [{ wch: 20 }, { wch: 75 }, ...]
 */
export function exportToExcel({ filename, sheetName, data, columnWidths = [] }) {
    // Create worksheet from array of arrays
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Apply column widths if provided
    if (columnWidths.length > 0) {
        ws["!cols"] = columnWidths;
    }

    // Create workbook and append worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Write file
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

export default {
    exportToExcel
};

