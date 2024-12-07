package com.dan.shoe.shoe.services.impls;

import com.dan.shoe.shoe.dtos.requests.CartRequest;
import com.dan.shoe.shoe.dtos.requests.OrderNowCreation;
import com.dan.shoe.shoe.dtos.responses.CartItemResponse;
import com.dan.shoe.shoe.dtos.responses.CartResponse;
import com.dan.shoe.shoe.dtos.responses.ProductVariantDetailsResponse;
import com.dan.shoe.shoe.dtos.responses.ResponseMessage;
import com.dan.shoe.shoe.models.*;
import com.dan.shoe.shoe.repositories.*;
import com.dan.shoe.shoe.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartServiceImpl implements CartService {
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private SeasonalDiscountRepository seasonalDiscountRepository;

    @Override
    public CartResponse getCartByUser(String username) {
        User user = userRepository.findByUsername(username);
        Cart cart = cartRepository.findByUser(user);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        }
        return fromCartToCartResponse(cart);
    }

    @Override
    public ResponseMessage addToCart(String username, CartRequest cartRequest) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("Người dùng không tồn tại");
        }

        Cart cart = cartRepository.findByUser(user);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        }

        ProductVariant productVariant = productVariantRepository.findById(cartRequest.getProductVariantId()).orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        ProductVariantDetailsResponse p = fromProductVariantToProductVariantDetailsResponse(productVariant);
        int totalPrice = p.getPriceAfterDiscount();
        System.out.println("totalPrice" + totalPrice);

        CartItem existingCartItem = cart.getCartItems().stream()
                .filter(item -> item.getProductVariant().getId().equals(cartRequest.getProductVariantId()))
                .findFirst()
                .orElse(null);

        if (existingCartItem != null) {
            existingCartItem.setQuantity(existingCartItem.getQuantity() + cartRequest.getQuantity());
            existingCartItem.setPrice(existingCartItem.getQuantity() * totalPrice);
            cartItemRepository.save(existingCartItem);
        } else {
            CartItem newCartItem = CartItem.builder()
                    .cart(cart)
                    .productVariant(productVariant)
                    .quantity(cartRequest.getQuantity())
                    .price(totalPrice * cartRequest.getQuantity())
                    .build();
            cart.getCartItems().add(newCartItem);
            cartItemRepository.save(newCartItem);
        }

        cart.setTotalPrice(cart.getCartItems().stream().mapToInt(CartItem::getPrice).sum());
        cartRepository.save(cart);

        return new ResponseMessage(200, "Thêm vào giỏ hàng thành công");
    }

    @Override
    @Transactional
    public ResponseMessage removeFromCart(String username, Long cartItemId) {
        User user = userRepository.findByUsername(username);
        Cart cart = cartRepository.findByUser(user);
        CartItem cartItem = cartItemRepository.findById(cartItemId).orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        cart.getCartItems().remove(cartItem);
        cart.setTotalPrice(cart.getCartItems().stream().mapToInt(CartItem::getPrice).sum());
        cartRepository.save(cart);

        return new ResponseMessage(200, "Xóa khỏi giỏ hàng thành công");
    }

    @Override
    public ResponseMessage updateCart(String username, Long cartItemId, int quantity) {
        User user = userRepository.findByUsername(username);
        Cart cart = cartRepository.findByUser(user);
        for (CartItem item : cart.getCartItems()) {
            if (item.getId().equals(cartItemId)) {
                item.setQuantity(quantity);
                item.setPrice(fromProductVariantToProductVariantDetailsResponse(item.getProductVariant()).getPriceAfterDiscount() * quantity);
                cartItemRepository.save(item);
                break;
            }
        }

        cart.setTotalPrice(cart.getCartItems().stream().mapToInt(CartItem::getPrice).sum());
        cartRepository.save(cart);

        return new ResponseMessage(200, "Cập nhật giỏ hàng thành công");
    }

    @Override
    @Transactional
    public ResponseMessage clearCart(String username) {
        User user = userRepository.findByUsername(username);
        Cart cart = cartRepository.findByUser(user);
        cart.getCartItems().clear();
        cart.setTotalPrice(0);
        cartRepository.save(cart);

        return new ResponseMessage(200, "Xóa giỏ hàng thành công");
    }

    @Override
    public Integer getCartTotal(String username) {
        User user = userRepository.findByUsername(username);
        Cart cart = cartRepository.findByUser(user);
        if (cart == null) {
            return 0;
        }
        Integer total = 0;
        for (CartItem item : cart.getCartItems()) {
            total += item.getQuantity();
        }
        return total;
    }

    @Override
    public ResponseMessage addCartNow(String username, OrderNowCreation orderNowCreation) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("Người dùng không tồn tại");
        }

        Cart cart = cartRepository.findByUser(user);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        }

        ProductVariant productVariant = productVariantRepository.findByColorSizeAndProductId(orderNowCreation.getColor(), orderNowCreation.getSize(), orderNowCreation.getProductId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        ProductVariantDetailsResponse p = fromProductVariantToProductVariantDetailsResponse(productVariant);

        int totalPrice = p.getPriceAfterDiscount();

        System.out.println("totalPrice" + totalPrice);

        CartItem existingCartItem = cart.getCartItems().stream()
                .filter(item -> item.getProductVariant().getId().equals(productVariant.getId()))
                .findFirst()
                .orElse(null);

        if (existingCartItem != null) {
            existingCartItem.setQuantity(existingCartItem.getQuantity() + orderNowCreation.getQuantity());
            existingCartItem.setPrice(existingCartItem.getQuantity() * totalPrice);
            cartItemRepository.save(existingCartItem);
        } else {
            CartItem newCartItem = CartItem.builder()
                    .cart(cart)
                    .productVariant(productVariant)
                    .quantity(orderNowCreation.getQuantity())
                    .price(totalPrice * orderNowCreation.getQuantity())
                    .build();
            cart.getCartItems().add(newCartItem);
            cartItemRepository.save(newCartItem);
        }

        cart.setTotalPrice(cart.getCartItems().stream().mapToInt(CartItem::getPrice).sum());
        cartRepository.save(cart);

        return new ResponseMessage(200, "Thêm vào giỏ hàng thành công");
    }

    private CartResponse fromCartToCartResponse(Cart cart) {
        return CartResponse.builder()
                .id(cart.getId())
                .user(cart.getUser())
                .cartItemResponses(cart.getCartItems().stream().map(this::fromCartItemToCartItemResponse).collect(Collectors.toSet()))
                .totalPrice(cart.getTotalPrice())
                .build();
    }

    private CartItemResponse fromCartItemToCartItemResponse(CartItem cartItem) {
        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productVariantDetailsResponse(fromProductVariantToProductVariantDetailsResponse(cartItem.getProductVariant()))
                .quantity(cartItem.getQuantity())
                .price(cartItem.getPrice())
                .build();
    }

    public ProductVariantDetailsResponse fromProductVariantToProductVariantDetailsResponse(ProductVariant productVariant) {
        SeasonalDiscount discount = seasonalDiscountRepository.findByProductVariant(productVariant, LocalDate.now());
        int priceAfterDiscount = productVariant.getPrice();
        if (discount != null) {
            double discountAmount = discount.getDiscountRate() / 100.0;
            System.out.println(discountAmount);
            priceAfterDiscount = (int) (productVariant.getPrice() * (1 - discountAmount));
        }
        return ProductVariantDetailsResponse.builder()
                .id(productVariant.getId())
                .product(productVariant.getProduct())
                .size(productVariant.getSize())
                .color(productVariant.getColor())
                .stockQuantity(productVariant.getStockQuantity())
                .price(productVariant.getPrice())
                .discountRate(discount != null ? discount.getDiscountRate() : 0)
                .priceAfterDiscount(priceAfterDiscount)
                .defaultVariant(productVariant.isDefaultVariant())
                .imageAvatar(productVariant.getImageAvatar())
                .imageOthers(productVariant.getImageOthers())
                .qrCode(productVariant.getQrCode())
                .colors(productVariantRepository.findDistinctColorByProduct(productVariant.getProduct()))
                .sizes(productVariantRepository.findDistinctSizeByProduct(productVariant.getProduct()))
                .build();
    }
}
