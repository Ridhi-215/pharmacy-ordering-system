package com.pharmacy.ordering.config;

import com.pharmacy.ordering.entity.*;
import com.pharmacy.ordering.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;
    private final LoyaltyPointsRepository loyaltyPointsRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking if database needs to be initialized...");

        // 1. Seed Users
        if (userRepository.count() == 0) {
            log.info("Seeding users...");
            
            User admin = User.builder()
                    .fullName("System Admin")
                    .email("admin@pharmacy.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("1234567890")
                    .role(Role.ADMIN)
                    .address("123 Health Street, MedCity")
                    .isVerified(true)
                    .build();
            userRepository.save(admin);

            User customer = User.builder()
                    .fullName("John Doe")
                    .email("customer@pharmacy.com")
                    .password(passwordEncoder.encode("customer123"))
                    .phone("0987654321")
                    .role(Role.CUSTOMER)
                    .address("456 Wellness Avenue, CareTown")
                    .isVerified(true)
                    .build();
            User savedCustomer = userRepository.save(customer);

            // Seed Loyalty Points
            LoyaltyPoints loyaltyPoints = LoyaltyPoints.builder()
                    .user(savedCustomer)
                    .totalPoints(50)
                    .build();
            loyaltyPointsRepository.save(loyaltyPoints);
            log.info("Users and loyalty points seeded successfully!");
        }

        // 2. Seed Categories
        if (categoryRepository.count() == 0) {
            log.info("Seeding categories...");
            
            Category analgesics = Category.builder().categoryName("Analgesics").description("Medicines used to achieve relief from pain.").build();
            Category antibiotics = Category.builder().categoryName("Antibiotics").description("Medicines that inhibit the growth of or destroy microorganisms.").build();
            Category vitamins = Category.builder().categoryName("Vitamins & Supplements").description("Organic compounds essential for normal growth and nutrition.").build();
            Category cardiologic = Category.builder().categoryName("Cardiologic").description("Medicines relating to the functioning of the heart.").build();
            Category antidiabetic = Category.builder().categoryName("Antidiabetic").description("Medicines used to treat diabetes mellitus.").build();

            categoryRepository.saveAll(Arrays.asList(analgesics, antibiotics, vitamins, cardiologic, antidiabetic));
            log.info("Categories seeded successfully!");
        }

        // 3. Seed Medicines
        if (medicineRepository.count() == 0) {
            log.info("Seeding medicines...");
            
            Category analgesics = categoryRepository.findByCategoryName("Analgesics")
                    .orElseGet(() -> categoryRepository.save(Category.builder().categoryName("Analgesics").description("Medicines used to achieve relief from pain.").build()));
            Category antibiotics = categoryRepository.findByCategoryName("Antibiotics")
                    .orElseGet(() -> categoryRepository.save(Category.builder().categoryName("Antibiotics").description("Medicines that inhibit the growth of or destroy microorganisms.").build()));
            Category vitamins = categoryRepository.findByCategoryName("Vitamins & Supplements")
                    .orElseGet(() -> categoryRepository.save(Category.builder().categoryName("Vitamins & Supplements").description("Organic compounds essential for normal growth and nutrition.").build()));
            Category cardiologic = categoryRepository.findByCategoryName("Cardiologic")
                    .orElseGet(() -> categoryRepository.save(Category.builder().categoryName("Cardiologic").description("Medicines relating to the functioning of the heart.").build()));
            Category antidiabetic = categoryRepository.findByCategoryName("Antidiabetic")
                    .orElseGet(() -> categoryRepository.save(Category.builder().categoryName("Antidiabetic").description("Medicines used to treat diabetes mellitus.").build()));

            List<Medicine> medicines = Arrays.asList(
                    Medicine.builder()
                            .category(analgesics)
                            .name("Paracetamol (Acetaminophen)")
                            .description("Common pain reliever and fever reducer.")
                            .dosage("500mg")
                            .packaging("Strip of 10 Tablets")
                            .price(new BigDecimal("1.50"))
                            .stockQuantity(150)
                            .requiresPrescription(false)
                            .manufacturer("GlaxoSmithKline")
                            .productType(ProductType.MEDICINE)
                            .build(),
                    Medicine.builder()
                            .category(analgesics)
                            .name("Ibuprofen")
                            .description("Nonsteroidal anti-inflammatory drug (NSAID) used to reduce pain and inflammation.")
                            .dosage("400mg")
                            .packaging("Strip of 12 Tablets")
                            .price(new BigDecimal("2.20"))
                            .stockQuantity(100)
                            .requiresPrescription(false)
                            .manufacturer("Pfizer")
                            .productType(ProductType.MEDICINE)
                            .build(),
                    Medicine.builder()
                            .category(antibiotics)
                            .name("Amoxicillin")
                            .description("Penicillin antibiotic used to treat bacterial infections.")
                            .dosage("500mg")
                            .packaging("Box of 20 Capsules")
                            .price(new BigDecimal("8.50"))
                            .stockQuantity(50)
                            .requiresPrescription(true)
                            .manufacturer("Novartis")
                            .productType(ProductType.MEDICINE)
                            .build(),
                    Medicine.builder()
                            .category(antibiotics)
                            .name("Azithromycin")
                            .description("Macrolide antibiotic used for treating various bacterial infections.")
                            .dosage("250mg")
                            .packaging("Pack of 6 Tablets")
                            .price(new BigDecimal("12.00"))
                            .stockQuantity(30)
                            .requiresPrescription(true)
                            .manufacturer("Pfizer")
                            .productType(ProductType.MEDICINE)
                            .build(),
                    Medicine.builder()
                            .category(vitamins)
                            .name("Vitamin C (Ascorbic Acid)")
                            .description("Essential vitamin for immune system support and skin health.")
                            .dosage("1000mg")
                            .packaging("Bottle of 60 Gummies")
                            .price(new BigDecimal("9.99"))
                            .stockQuantity(200)
                            .requiresPrescription(false)
                            .manufacturer("Nature Made")
                            .productType(ProductType.PHARMACY_PRODUCT)
                            .build(),
                    Medicine.builder()
                            .category(vitamins)
                            .name("Multivitamin Men Active")
                            .description("Comprehensive multivitamin customized for men.")
                            .dosage("Daily")
                            .packaging("Bottle of 90 Tablets")
                            .price(new BigDecimal("15.50"))
                            .stockQuantity(75)
                            .requiresPrescription(false)
                            .manufacturer("GNC")
                            .productType(ProductType.PHARMACY_PRODUCT)
                            .build(),
                    Medicine.builder()
                            .category(cardiologic)
                            .name("Atorvastatin (Lipitor)")
                            .description("Statin medication used to prevent cardiovascular disease and lower lipids.")
                            .dosage("20mg")
                            .packaging("Strip of 14 Tablets")
                            .price(new BigDecimal("18.00"))
                            .stockQuantity(40)
                            .requiresPrescription(true)
                            .manufacturer("Pfizer")
                            .productType(ProductType.MEDICINE)
                            .build(),
                    Medicine.builder()
                            .category(cardiologic)
                            .name("Metoprolol Succinate")
                            .description("Beta-blocker used to treat chest pain (angina), heart failure, and high blood pressure.")
                            .dosage("50mg")
                            .packaging("Strip of 10 Tablets")
                            .price(new BigDecimal("11.50"))
                            .stockQuantity(60)
                            .requiresPrescription(true)
                            .manufacturer("AstraZeneca")
                            .productType(ProductType.MEDICINE)
                            .build(),
                    Medicine.builder()
                            .category(antidiabetic)
                            .name("Metformin Hydrochloride")
                            .description("First-line medication for the treatment of type 2 diabetes.")
                            .dosage("500mg")
                            .packaging("Strip of 15 Tablets")
                            .price(new BigDecimal("4.50"))
                            .stockQuantity(120)
                            .requiresPrescription(true)
                            .manufacturer("Merck")
                            .productType(ProductType.MEDICINE)
                            .build(),
                    Medicine.builder()
                            .category(antidiabetic)
                            .name("Glipizide")
                            .description("Sulfonylurea class antidiabetic medication used to treat type 2 diabetes.")
                            .dosage("5mg")
                            .packaging("Strip of 10 Tablets")
                            .price(new BigDecimal("6.00"))
                            .stockQuantity(80)
                            .requiresPrescription(true)
                            .manufacturer("Sanofi")
                            .productType(ProductType.MEDICINE)
                            .build()
            );
            medicineRepository.saveAll(medicines);
            log.info("Medicines seeded successfully!");
        }

        log.info("Database checking and initialization completed.");
    }
}
