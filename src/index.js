/**Descripción General
 Desarrollar un servidor que contenga los endpoints y servicios necesarios para gestionar 
 los productos y carritos de compra para tu API.
 
 ######## Requisitos de la Primera Entrega ##########
 Desarrollo del Servidor
 El servidor debe estar basado en Node.js y Express, y debe escuchar en el puerto 8080. 
 Se deben disponer dos grupos de rutas: /products y /carts. 
 Estos endpoints estarán implementados con el router de Express, con las siguientes especificaciones:
 */

import express from 'express'
import ProductManager from './productManager.js'
import CartManager from './cartManager.js'
const app = express()
const PORT = 8080

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const productManager = new ProductManager('./productos.json')
const cartManager = new CartManager('./carts.json')


/*
Rutas para Manejo de Productos (/api/products/)
GET /:
Debe listar todos los productos de la base de datos.
*/

app.get('/api/productos', async (req, res) => {
    try {
        const productos = await productManager.getProducts()
        res.send({status: "Success", data: productos})
    } catch (error) {
        res.status(500).send('Error obtenido', error)
    }
})


//GET /:pid:
//Debe traer solo el producto con el id proporcionado.
app.get('/api/productos/:productId', async (req, res) => {
    try {
        let productId = parseInt(req.params.productId)
        const productos = await productManager.getProducts()
        const product = productos.find(p => p.id === productId)
        
        if(!product){
            return res.status(404).send('Producto no encontrado')
        }

        res.send({status: "Success", msg: "Producto encontrado", data: product})
    } catch (error) {
        res.status(500).send('Error al buscar producto', error)
    }
})

/*
POST /:
Debe agregar un nuevo producto con los siguientes campos:
id: Number/String (No se manda desde el body, se autogenera para asegurar que nunca se repitan los ids).
title: String
description: String
code: String
price: Number
status: Boolean
stock: Number
category: String
thumbnails: Array de Strings (rutas donde están almacenadas las imágenes del producto).
*/
//Asegurandonos que no se repita el ID generado

app.post('/api/productos', async (req, res) => {
    let product = req.body
    
    if (!product.title || !product.description || !product.code || !product.price || !product.status || !product.stock || !product.category || !product.thumbnails){
        return res.status(400).send('Todos los campos son obligatorios')
    }

    try {
        const productos = await productManager.getProducts()
        // Validando primero que el ID no se vaya a repetir
        const unicoId = () => {
            const numRandom = Math.floor(Math.random() * 400 + 1)
            return productos.find(p => p.id === numRandom) ? unicoId(): numRandom
        }
        product.id = unicoId()
        
        await productManager.agregarProductos(product)
        res.send({status: "success", msg: "Producto agregado", data: product})
    } catch (error) {
        res.status(500).send('Error al agregar el producto')
    }
})

// PUT /:pid:
// Debe actualizar un producto por los campos enviados desde el body. No se debe actualizar ni eliminar el idal momento de hacer la actualización.

app.put('/api/productos/:productId', async (req,res) => {
    let productId = parseInt(req.params.productId)
    let prodUpdate = req.body
    try {
        await productManager.putProducts(productId, prodUpdate)
        res.send({ status: "Success", msg: "Sus datos han sido actualizados", data: prodUpdate })
        
    } catch (error) {
        res.status(500).send('Error al actualizar el producto', error)   
    }
})


// DELETE /:pid:
// Debe eliminar el producto con el pid indicado.

app.delete('/api/productos/:productId', async (req, res)=>{
    let productId = parseInt(req.params.productId)

    try {
        await productManager.deleteProduct(productId)
        res.send({ status:"Success", msg: "Producto borrado con exito", data: productos[posicionProd] })
        
    } catch (error) {
        res.status(500).send('Error al eliminar el producto', error)
    }

})

/* ####### Rutas para Manejo de Carritos (/api/carts/) ########## */
// POST /:
// Debe crear un nuevo carrito con la siguiente estructura:
// id: Number/String (Autogenerado para asegurar que nunca se dupliquen los ids).
// products: Array que contendrá objetos que representen cada producto.

// app.get('/api/carts', (req, res) => {
//     res.send(carts) //Antes de usar los .json
// })

app.post('/api/carts', async (req, res) => {
    try {
        const carts = await cartManager.getCarts()
        const unicoId = () => {
            const numRandom = Math.floor(Math.random() * 400 + 1)
            return carts.find(c => c.id === numRandom) ? unicoId(): numRandom
        }
        
        const newCart = {
            id: unicoId(),
            productos: []    
        }
    
        await cartManager.addCart(newCart)
        res.send({ status: "Success", msg: "El producto ha sido agregado al carrito", data: newCart })
    } catch (error) {
        res.status(500).send('Error al crear el carrito')
    }
})

// GET /:cid:
// Debe listar los productos que pertenecen al carrito con el cid proporcionado.

app.get('/api/carts/:cartId', async (req, res) => {
    let cartId = parseInt(req.params.cartId)
    
    try {
        const cart = await cartManager.getCartById(cartId)
        if(!cart){
            res.status(404).send("Carrito no encontrado")
        }
        res.send({ status: "Success", msg: "Carrito encontrado", data: cart })
    } catch (error) {
        res.status(500).send("Carrito no encontrado")
    }
})

/* 
POST /:cid/product/:pid:
Debe agregar el producto al arreglo products del carrito seleccionado, utilizando el siguiente formato:
product: Solo debe contener el ID del producto.
quantity: Debe contener el número de ejemplares de dicho producto (se agregará de uno en uno).
Si un producto ya existente intenta agregarse, se debe incrementar el campo quantity de dicho producto.
*/
// POST /:cid/product/:pid
// Debe agregar el producto al arreglo productos del carrito seleccionado,
// Si un producto ya existente intenta agregarse, se debe incrementar el campo quantity de dicho producto.

app.post('/api/carts/:cartId/productos/:productoId', async (req, res) => {
    let cartId = parseInt(req.params.cartId)
    let productId = parseInt(req.params.productoId)
    
    try{
        await cartManager.addProductoCart(cartId, productId)
        res.send({ status: "Success", msg: "Producto agregado al carrito"})

    }catch(error){
        res.status(500).send('Error al agregar producto al carrito')
    }
})

app.listen(PORT, () => {
    console.log(`Se esta escuchando en el puerto ${PORT}`);
    
})