// Custom CSS for Swagger UI branding
const customCss = `
    .swagger-ui .topbar {
        background-color: #2c3e50;
    }
    .swagger-ui .topbar .download-url-wrapper .select-label select {
        border-color: #2c3e50;
    }
    .swagger-ui .info .title {
        color: #2c3e50;
        font-size: 36px;
    }
    .swagger-ui .btn.authorize {
        border-color: #49cc90;
        color: #49cc90;
    }
    .swagger-ui .btn.authorize svg {
        fill: #49cc90;
    }
    .swagger-ui .opblock-tag {
        font-size: 24px;
    }
    .swagger-ui .response-col_status {
        font-weight: bold;
    }
    .swagger-ui .scheme-container {
        background: #f8f9fa;
        box-shadow: none;
    }
    .swagger-ui .response-col_description__response {
        background-color: #f8f9fa;
    }
`;

module.exports = customCss;