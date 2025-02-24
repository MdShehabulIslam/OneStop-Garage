import express from "express";
import { sql } from "../config/db.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await sql`
    SELECT * FROM products
    ORDER BY created_at DESC`;

    console.log("fetched products", products);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log("Error in getProducts function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createProduct = async (req, res) => {
  const { name, price, image } = req.body;

  if (!name || !price || !image) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newProduct = await sql`
    INSERT INTO products (name, price, image)
    VALUES (${name}, ${price}, ${image})
    RETURNING *
  `;

    console.log("New created product", newProduct);
    res.status(201).json({ success: true, data: newProduct[0] });
  } catch (error) {
    console.log("Error in createProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await sql`
    SELECT * FROM products
    WHERE id = ${id}
    `;

    res.status(200).json({ success: true, data: product[0] });
  } catch (error) {
    console.log("Error in getProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await sql`
    UPDATE products
    SET name = ${req.body.name}, price = ${req.body.price}, image = ${req.body.image}
    WHERE id = ${req.params.id}
    RETURNING *
    `;

    if (updatedProduct.length == 0) {
      res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: updatedProduct[0] });
  } catch (error) {
    console.log("Error in updateProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await sql`
    DELETE FROM products
    WHERE id = ${req.params.id}
    RETURNING *
    `;

    if (deletedProduct.length == 0) {
      res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: deletedProduct[0] });
  } catch (error) {
    console.log("Error in deleteProduct function", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
