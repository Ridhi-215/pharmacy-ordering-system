package com.pharmacy.ordering.controller;

import com.pharmacy.ordering.dto.CartAddRequest;
import com.pharmacy.ordering.dto.CartItemResponse;
import com.pharmacy.ordering.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCart(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(cartService.getCart(principal.getName()));
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemResponse> addToCart(Principal principal, @Valid @RequestBody CartAddRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CartItemResponse response = cartService.addToCart(principal.getName(), request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<Void> removeFromCart(Principal principal, @PathVariable Integer id) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        cartService.removeFromCart(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CartItemResponse> updateQuantity(
            Principal principal,
            @PathVariable Integer id,
            @RequestParam Integer quantity) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CartItemResponse response = cartService.updateQuantity(principal.getName(), id, quantity);
        return ResponseEntity.ok(response);
    }
}
