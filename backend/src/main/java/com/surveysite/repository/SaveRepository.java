package com.surveysite.repository;

import com.surveysite.model.Save;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SaveRepository extends JpaRepository<Save, Long> {
    
    Optional<Save> findByUserIdAndSurveyId(Long userId, Long surveyId);
    
    boolean existsByUserIdAndSurveyId(Long userId, Long surveyId);
    
    void deleteByUserIdAndSurveyId(Long userId, Long surveyId);
    
    List<Save> findByUserId(Long userId);
}

