import fs from 'fs/promises'

class ProductManager{
    constructor(path){
        this.path = path
    }

    async getProducts(){
        try {
            const data = await fs.readFile(this.path, "utf-8")
            return JSON.parse(data)
            
        } catch (error) {
            console.error("Error leyendo el archivo de productos", error)
            return []
        }
    }

    async postProducts(productos){
        try {
            const data = await fs.writeFile(this.path, JSON.stringify(productos, null, 2))
        } catch (error) {
            console.log('Error agregando el producto', error)
        }
    }

    async agregarProductos(producto){
        try {
            const productos = await this.getProducts()
            productos.push(producto)
            await this.postProducts(productos)
            return producto
        } catch (error) {
            console.log('Error a agregar nuevo producto', error)
        }
    }

    async putProducts(productId, putProduct){
        try {
            const productos = await this.getProducts()
            const index = productos.findIndex(p => p.id === productId)
            
            if(index === -1){
                throw Error('Producto no encontrado')
            }

            productos[index] = putProduct
            await this.postProducts(productos) 
        } catch(error){
            console.log(error)
        }
    }

    async deleteProduct(productId){
        const productos = await this.getProducts()
        const deleteProd = productos.filter(p => p.id !== productId)
        await this.postProducts(deleteProd)
    }

}

export default ProductManager;