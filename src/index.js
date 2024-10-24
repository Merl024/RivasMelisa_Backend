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
const app = express()
const PORT = 8080


// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/*
Rutas para Manejo de Productos (/api/products/)
GET /:
Debe listar todos los productos de la base de datos.
*/

const productos = []

app.get('/api/productos', (req, res) => {
    res.send(productos)
    // console.log(productos); // Comprobando que se esta agregando los productos
})


//GET /:pid:
//Debe traer solo el producto con el id proporcionado.
app.get('/api/productos/:productId', (req, res) => {
    let productId = parseInt(req.params.productId)

    const product = productos.find(p => p.id === productId)
    
    if (!product){
        res.status(404).send('Producto no encontrado')
    }
    
    res.send({ status: "Success", msg: "Aqui esta su producto", data: product})

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

app.post('/api/productos', (req, res) => {
    let product = req.body
    
    // Validando primero que el ID no se vaya a repetir
    const unicoId = () => {
        const numRandom = Math.floor(Math.random() * 400 + 1)
        return productos.find(p => p.id === numRandom) ? unicoId(): numRandom
    }
    
    
    product.id = unicoId()
    
    if (!product.title || !product.description || !product.code || !product.price || !product.status || !product.stock || !product.category || !product.thumbnails){
        return res.status(400).send('Todos los campos son obligatorios')
    }

    productos.push(product)
    res.send({status: "success", msg: "Producto agregado", data: product})
})

// PUT /:pid:
// Debe actualizar un producto por los campos enviados desde el body. No se debe actualizar ni eliminar el idal momento de hacer la actualización.

app.put('/api/productos/:productId', (req,res) => {
    let productId = parseInt(req.params.productId)
    let prodUpdate = req.body

    const posicionProd = productos.findIndex(p => p.id === productId)
    
    if (posicionProd < 0) {
        res.status(202).send('Producto no encontrado')
    }
    productos[posicionProd] = prodUpdate
    
    res.send({ status: "Success", msg: "Sus datos han sido actualizados", data: productos[posicionProd] })
})


// DELETE /:pid:
// Debe eliminar el producto con el pid indicado.

app.delete('/api/productos/:productId', (req, res)=>{
    let productId = parseInt(req.params.productId)

    const productosSize = productos.length
    const posicionProd = productos.findIndex(p => p.id === productId)

    if (posicionProd < 0){
        return res.status(202).send({ status: "failed", msg: "No se encontro el producto" })
    }

    productos.splice(posicionProd, 1)

    if (productos.length === productosSize){
        return res.status(500).send({ status: "Error", msg: "El producto no se pudo eliminar" })
    }

    res.send({ status:"Success", msg: "Producto borrado con exito", data: productos[posicionProd] })

})

/* ####### Rutas para Manejo de Carritos (/api/carts/) ########## */
// POST /:
// Debe crear un nuevo carrito con la siguiente estructura:
// id: Number/String (Autogenerado para asegurar que nunca se dupliquen los ids).
// products: Array que contendrá objetos que representen cada producto.

const carts = []

app.get('/api/carts', (req, res) => {
    res.send(carts)
})

app.post('/api/carts', (req, res) => {

    const unicoId = () => {
        const numRandom = Math.floor(Math.random() * 400 + 1)
        return carts.find(c => c.id === numRandom) ? unicoId(): numRandom
    }
    
    const newCart = {
        id: unicoId(),
        productos: []    
    }

    carts.push(newCart)
    res.send({ status: "Success", msg: "El producto ha sido agregado al carrito", data: newCart })

})

// GET /:cid:
// Debe listar los productos que pertenecen al carrito con el cid proporcionado.

app.get('/api/carts/:cartId', (req, res) => {
    let cartId = parseInt(req.params.cartId)
    let cart = carts.find(c => c.id === cartId)

    if(!cart){
        res.status(404).send("Carrito no encontrado")
    }
    
    res.send({ status: "Success", msg: "Carrito encontrado", data: cart })
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

app.post('/api/carts/:cartId/productos/:productoId', (req, res) => {
    let cartId = parseInt(req.params.cartId)
    const cart = carts.find(c => c.id === cartId)

    if (!cart) {
        return res.status(404).send({ status: "Error", msg: "Carrito no encontrado" })
    }

    let productId = parseInt(req.params.productoId)
    let product = cart.productos.find(p => p.id === productId)

    if (product) {
        product.quantity += 1
        return res.send({ status: "Success", msg: "Producto ya existente, cantidad incrementada", data: product })
    }

    // Agregando el id del producto al carrito que seleccionamos
    cart.productos.push({ id: productId, quantity: 1 })

    if (!product) {
        return res.status(500).send({ status: "Error", msg: "Fallo al agregar el producto al carrito" })
    }

    res.send({ status: "Success", msg: "Producto agregado al carrito", data: product })
})



/* Persistencia de la Información
La persistencia se implementará utilizando el sistema de archivos, 
donde los archivos products.json y carts.json respaldarán la información.
Se debe utilizar el ProductManager desarrollado en el desafío anterior y 
crear un CartManager para gestionar el almacenamiento de estos archivos JSON.
*/


app.listen(PORT, () => {
    console.log(`Se esta escuchando en el puerto ${PORT}`);
    
})