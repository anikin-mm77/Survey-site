package com.surveysite.repository;

import com.surveysite.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
    Optional<Like> findByUserIdAndSurveyId(Long userId, Long surveyId);
    
    boolean existsByUserIdAndSurveyId(Long userId, Long surveyId);
    
    void deleteByUserIdAndSurveyId(Long userId, Long surveyId);
    
    Long countBySurveyId(Long surveyId);
    
    List<Like> findByUserId(Long userId);
}

