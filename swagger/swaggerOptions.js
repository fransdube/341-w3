const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const swaggerOptions = {
    explorer: true,
    customCss: `
        .swagger-ui .topbar { background-color: #2c3e50; }
        .swagger-ui .info .title { color: #2c3e50; }
        .swagger-ui .scheme-container { background: #f8f9fa; }
    `,
    customSiteTitle: 'Bookstore API Documentation',
    customfavIcon: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-32x32.png',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        syntaxHighlight: {
            activate: true,
            theme: 'agate'
        }
    }
};

module.exports = {
    serve: swaggerUi.serve,
    setup: swaggerUi.setup(swaggerSpec, swaggerOptions)
};