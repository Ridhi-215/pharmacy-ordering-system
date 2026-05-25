package com.pharmacy.ordering.service;

import com.pharmacy.ordering.dto.PrescriptionResponse;
import com.pharmacy.ordering.entity.Prescription;
import com.pharmacy.ordering.entity.PrescriptionStatus;
import com.pharmacy.ordering.entity.User;
import com.pharmacy.ordering.exception.BadRequestException;
import com.pharmacy.ordering.exception.ResourceNotFoundException;
import com.pharmacy.ordering.repository.PrescriptionRepository;
import com.pharmacy.ordering.repository.UserRepository;
import com.pharmacy.ordering.repository.OrderRepository;
import com.pharmacy.ordering.entity.Order;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final OrderRepository orderRepository;

    private static final String UPLOAD_DIR = "uploads";

    @Transactional
    public PrescriptionResponse uploadPrescription(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (file.isEmpty()) {
            throw new BadRequestException("Please select a file to upload.");
        }

        try {
            // Get root upload path
            String userDir = System.getProperty("user.dir");
            Path uploadPath = Paths.get(userDir, UPLOAD_DIR);
            
            // Create uploads directory if it doesn't exist
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Create a unique filename
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            String newFileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(newFileName);
            
            // Save file to local folder
            Files.copy(file.getInputStream(), filePath);
            log.info("Saved prescription file to: {}", filePath.toString());

            // Save info in database
            // We expose uploads under /uploads/**
            String fileUrl = "/uploads/" + newFileName;

            Prescription prescription = Prescription.builder()
                    .user(user)
                    .fileUrl(fileUrl)
                    .status(PrescriptionStatus.PENDING)
                    .build();

            Prescription saved = prescriptionRepository.save(prescription);
            return mapToResponse(saved);

        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }
    }

    public List<PrescriptionResponse> getCustomerPrescriptions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return prescriptionRepository.findByUserUserIdOrderByUploadedAtDesc(user.getUserId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<PrescriptionResponse> getAllPrescriptions() {
        return prescriptionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PrescriptionResponse approvePrescription(Integer id, String adminEmail) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));

        prescription.setStatus(PrescriptionStatus.APPROVED);
        prescription.setVerifiedBy(adminEmail);
        prescription.setRejectionReason(null);
        
        Prescription saved = prescriptionRepository.save(prescription);
        
        // Trigger business email notification
        emailService.sendPrescriptionApprovedEmail(saved.getUser(), saved);
        
        return mapToResponse(saved);
    }

    @Transactional
    public PrescriptionResponse rejectPrescription(Integer id, String adminEmail, String reason) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));

        prescription.setStatus(PrescriptionStatus.REJECTED);
        prescription.setVerifiedBy(adminEmail);
        if (reason != null && !reason.trim().isEmpty()) {
            prescription.setRejectionReason(reason.trim());
        }

        Prescription saved = prescriptionRepository.save(prescription);
        return mapToResponse(saved);
    }

    private PrescriptionResponse mapToResponse(Prescription p) {
        Integer linkedOrderId = orderRepository.findByPrescriptionPrescriptionId(p.getPrescriptionId())
                .map(Order::getOrderId)
                .orElse(null);

        return PrescriptionResponse.builder()
                .prescriptionId(p.getPrescriptionId())
                .userId(p.getUser().getUserId())
                .userFullName(p.getUser().getFullName())
                .fileUrl(p.getFileUrl())
                .status(p.getStatus().name())
                .uploadedAt(p.getUploadedAt())
                .verifiedBy(p.getVerifiedBy())
                .rejectionReason(p.getRejectionReason())
                .orderId(linkedOrderId)
                .build();
    }
}
