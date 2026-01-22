export const api_routes = {
    login: 'api/TokenAuth/Authenticate',
    signup: 'api/services/app/Account/Register',
    //Tax Module
    getAllTaxes: 'api/services/app/Product/GetAllProductTax',
    createTax: 'api/services/app/Product/CreateProductTax',
    updateTax: 'api/services/app/Product/UpdateProductTax',
    getTaxById: 'api/services/app/Product/GetProductTax',
    deleteTax: 'api/services/app/Product/DeleteProductTax',
    //Attributes Module
    getAllAttributes: 'api/services/app/Product/GetAllProductAttribute',
    createAttributes: 'api/services/app/Product/CreateProductAttribute',
    updateAttributes: 'api/services/app/Product/UpdateProductAttribute',
    getAttributesById: 'api/services/app/Product/GetProductAttribute',
    deleteAttributes: 'api/services/app/Product/DeleteProductAttribute',
    // Product Images
    getAllProductImage: 'api/services/app/Product/GetAllProductImage',
    createProductImage: 'api/services/app/Product/CreateProductImage',
    updateProductImage: 'api/services/app/Product/UpdateProductImage',
    getProductImageById: 'api/services/app/Product/GetProductImage',
    deleteProductImage: 'api/services/app/Product/DeleteProductImage',
    // Product category
    getAllProductCategory: 'api/services/app/Product/GetAllProductCategory',
    createProductCategory: 'api/services/app/Product/CreateProductCategory',
    updateProductCategory: 'api/services/app/Product/UpdateProductCategory',
    getProductCategoryById: 'api/services/app/Product/GetProductCategory',
    deleteProductCategory: 'api/services/app/Product/DeleteProductCategory',
    //Items
    getAllItems: 'api/services/app/Product/GetAllProductDetails',
    createProductItem: 'api/services/app/Product/CreateProductDetail',
    updateProductItem: 'api/services/app/Product/UpdateProductDetail',
    getItemById: 'api/services/app/Product/GetProductDetail',
    deleteItem: 'api/services/app/Product/DeleteProductDetail',
    //Product Layout
    getAllLayOuts: 'api/services/app/Product/GetAllProductLayout',
    createProductLayOut: 'api/services/app/Product/CreateProductLayout',
    updateProductLayOut: 'api/services/app/Product/UpdateProductLayout',
    getProductLayOutById: 'api/services/app/Product/GetProductLayout',
    deleteProductLayOut: 'api/services/app/Product/DeleteProductLayout',
    //Permissions
    getUserPermissions: 'api/services/app/Role/GetRoleForEdit',

    //profiles
    getMyProfile: 'api/services/app/Profile/GetProfile',
    updateProfile: 'api/services/app/Profile/UpdateProfile',

    //Smtp
    getMyEmailSettings: 'api/services/app/HostSettings/GetEmailSettings',
    updateAllSettings: 'api/services/app/HostSettings/UpdateAllSettings'
};
