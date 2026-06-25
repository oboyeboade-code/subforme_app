// Cart persistence currently lives on the customer document; see
// modules/user/user.service.ts (cart, addToCart, removeFromCart,
// updateCartItemQuantity, clearCart). Re-export here for future migration to a
// standalone cart collection.
export { userService as cartService } from "../user/user.service.js";
