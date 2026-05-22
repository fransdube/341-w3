/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - isbn
 *         - publishedYear
 *         - genre
 *         - price
 *         - pageCount
 *         - publisher
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *         author:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         isbn:
 *           type: string
 *           pattern: '^(97(8|9))?\d{9}(\d|X)$'
 *         publishedYear:
 *           type: integer
 *           minimum: 1450
 *           maximum: 2026
 *         genre:
 *           type: string
 *           enum:
 *             - Fiction
 *             - Non-Fiction
 *             - Mystery
 *             - Science Fiction
 *             - Fantasy
 *             - Biography
 *             - History
 *             - Romance
 *             - Thriller
 *             - Poetry
 *             - Children
 *         price:
 *           type: number
 *           minimum: 0
 *           maximum: 10000
 *         inStock:
 *           type: boolean
 *           default: true
 *         pageCount:
 *           type: integer
 *           minimum: 1
 *           maximum: 5000
 *         publisher:
 *           type: string
 *           minLength: 2
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           default: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Book'
 *     
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: integer
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         pages:
 *           type: integer
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Book'
 *   
 *   parameters:
 *     bookId:
 *       name: id
 *       in: path
 *       required: true
 *       description: MongoDB ObjectId of the book
 *       schema:
 *         type: string
 *         pattern: '^[0-9a-fA-F]{24}$'
 *       example: "507f1f77bcf86cd799439011"
 *     
 *     pageParam:
 *       name: page
 *       in: query
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       description: Page number for pagination
 *     
 *     limitParam:
 *       name: limit
 *       in: query
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 10
 *       description: Number of items per page
 *   
 *   responses:
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             message: "Book not found with id: 507f1f77bcf86cd799439999"
 *     
 *     ValidationError:
 *       description: Validation failed
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             message: "Validation failed"
 *             errors:
 *               - field: "price"
 *                 message: "Price must be between 0 and 10000"
 *     
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             message: "Server Error"
 */