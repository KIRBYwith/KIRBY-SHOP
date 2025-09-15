// src/components/product/ProductListItem.js

import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import styles from '../../styles/ProductListItem.module.css';

const ProductListItem = ({ product, onProductClick, onWishlistToggle, onCartAdd, wishlistIds, cartItems }) => {
  const isWishlisted = wishlistIds.includes(product.id);
  
  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    onWishlistToggle(product.id);
  };
  
  const handleCartAdd = (e) => {
    e.stopPropagation();
    onCartAdd(product, 1);
  };

  return (
    <div className={styles.productItem} onClick={() => onProductClick(product)}>
      <div className={styles.imageContainer}>
        <img 
          src={product.image} 
          alt={product.title} 
          className={styles.productImage} 
        />
        <div className={styles.actions}>
          <button 
            className={`${styles.iconButton} ${isWishlisted ? styles.wishlisted : ''}`}
            onClick={handleWishlistToggle}
          >
            <Heart size={20} />
          </button>
          <button 
            className={styles.iconButton}
            onClick={handleCartAdd}
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.price}>{product.price.toLocaleString()}원</p>
      </div>
    </div>
  );
};

export default ProductListItem;