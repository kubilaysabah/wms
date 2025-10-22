export default {
    APP_NAME: 'WMS',
    API_URL: 'https://dev.wms.senatech.co',
    WS_URL: 'https://dev.wms.senatech.co',
    COPYRIGHT_YEAR: new Date().getFullYear(),
    TIMEOUT: 30000,
    DEBUG: process.env.NODE_ENV === 'development'
};