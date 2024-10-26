import fs from 'fs/promises'

class CartManager{
    constructor(path){
        this.path = path
    }

    async getCarts(){
        try {
            const data = await fs.readFile(this.path, "utf-8")
            return JSON.parse(data)
            
        } catch (error) {
            console.error("Error leyendo los carritos", error)
            return []
        }
    }

    async postCarts(carts){
        try {
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2))
        } catch (error) {
            console.log('Error agregando el producto', error)
        }
    }

    async addCart(cart){
        const carts = await this.getCarts()
        carts.push(cart)
        await this.postCarts(carts)
        return cart
    }

    async getCartById(cartId){
        const carts = await this.getCarts()
        return carts.findIndex(c => c.id === cartId)
    }

    async addProductoCart(cartId, productId) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId);
    
        if (cartIndex === -1) {
            throw Error('Carrito no encontrado');
        }
    
        const cart = carts[cartIndex];
        const productIndex = cart.productos.findIndex(p => p.id === productId);
    
        if (productIndex >= 0) {
            cart.productos[productIndex].quantity += 1;
        } else {
            cart.productos.push({ id: productId, quantity: 1 });
        }
    
        carts[cartIndex] = cart;
    
        await this.postCarts(carts);
    }
    
}

export default CartManager;