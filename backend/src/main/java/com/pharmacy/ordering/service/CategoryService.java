package com.pharmacy.ordering.service;

import com.pharmacy.ordering.entity.Category;
import com.pharmacy.ordering.exception.BadRequestException;
import com.pharmacy.ordering.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(Category category) {
        if (categoryRepository.findByCategoryName(category.getCategoryName()).isPresent()) {
            throw new BadRequestException("Category already exists: " + category.getCategoryName());
        }
        return categoryRepository.save(category);
    }
}
