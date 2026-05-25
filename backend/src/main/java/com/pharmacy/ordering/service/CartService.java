package com.pharmacy.ordering.service;

import com.pharmacy.ordering.dto.CartAddRequest;
import com.pharmacy.ordering.dto.CartItemResponse;
import com.pharmacy.ordering.entity.CartItem;
import com.pharmacy.ordering.entity.Medicine;
import com.pharmacy.ordering.entity.User;
import com.pharmacy.ordering.exception.BadRequestException;
import com.pharmacy.ordering.exception.ResourceNotFoundException;
import com.pharmacy.ordering.repository.CartItemRepository;
import com.pharmacy.ordering.repository.MedicineRepository;
import com.pharmacy.ordering.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;

    public List<CartItemResponse> getCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<CartItem> items = cartItemRepository.findByUserUserId(user.getUserId());
        return items.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public CartItemResponse addToCart(String email, CartAddRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found"));

        if (medicine.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock. Available: " + medicine.getStockQuantity());
        }

        Optional<CartItem> existingItemOpt = cartItemRepository
                .findByUserUserIdAndMedicineMedicineId(user.getUserId(), medicine.getMedicineId());

        CartItem cartItem;
        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            int newQty = cartItem.getQuantity() + request.getQuantity();
            if (medicine.getStockQuantity() < newQty) {
                throw new BadRequestException("Insufficient stock. Available: " + medicine.getStockQuantity());
            }
            cartItem.setQuantity(newQty);
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .medicine(medicine)
                    .quantity(request.getQuantity())
                    .build();
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return mapToResponse(saved);
    }

    @Transactional
    public void removeFromCart(String email, Integer cartId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CartItem cartItem = cartItemRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getUserId().equals(user.getUserId())) {
            throw new BadRequestException("Access denied: This cart item does not belong to you.");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public CartItemResponse updateQuantity(String email, Integer cartId, int quantity) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CartItem cartItem = cartItemRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getUserId().equals(user.getUserId())) {
            throw new BadRequestException("Access denied: This cart item does not belong to you.");
        }

        Medicine medicine = cartItem.getMedicine();
        if (medicine.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock. Available: " + medicine.getStockQuantity());
        }

        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero.");
        }

        cartItem.setQuantity(quantity);
        CartItem saved = cartItemRepository.save(cartItem);
        return mapToResponse(saved);
    }

    private CartItemResponse mapToResponse(CartItem item) {
        Medicine med = item.getMedicine();
        return CartItemResponse.builder()
                .cartId(item.getCartId())
                .medicineId(med.getMedicineId())
                .name(med.getName())
                .price(med.getPrice())
                .quantity(item.getQuantity())
                .requiresPrescription(med.getRequiresPrescription())
                .stockQuantity(med.getStockQuantity())
                .dosage(med.getDosage())
                .packaging(med.getPackaging())
                .build();
    }
}
