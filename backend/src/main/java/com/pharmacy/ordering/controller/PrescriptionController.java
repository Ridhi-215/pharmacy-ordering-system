package com.pharmacy.ordering.controller;

import com.pharmacy.ordering.dto.PrescriptionResponse;
import com.pharmacy.ordering.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping("/upload")
    public ResponseEntity<PrescriptionResponse> uploadPrescription(
            Principal principal,
            @RequestParam("file") MultipartFile file) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        PrescriptionResponse response = prescriptionService.uploadPrescription(principal.getName(), file);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptions(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Authentication authentication = (Authentication) principal;
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return ResponseEntity.ok(prescriptionService.getAllPrescriptions());
        } else {
            return ResponseEntity.ok(prescriptionService.getCustomerPrescriptions(principal.getName()));
        }
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PrescriptionResponse> approvePrescription(
            @PathVariable Integer id,
            Principal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        PrescriptionResponse response = prescriptionService.approvePrescription(id, principal.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PrescriptionResponse> rejectPrescription(
            @PathVariable Integer id,
            Principal principal,
            @RequestParam(required = false) String reason) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        PrescriptionResponse response = prescriptionService.rejectPrescription(id, principal.getName(), reason);
        return ResponseEntity.ok(response);
    }
}
