package com.surveysite.repository;

import com.surveysite.model.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    
    List<UserAnswer> findByUserIdAndQuestionSurveyId(Long userId, Long surveyId);
    
    List<UserAnswer> findByUserId(Long userId);
    
    Optional<UserAnswer> findByUserIdAndQuestionId(Long userId, Long questionId);
    
    @Query("SELECT COUNT(ua) FROM UserAnswer ua WHERE ua.question.id = :questionId AND ua.option.text = :optionText")
    Long countByQuestionAndOption(Long questionId, String optionText);
    
    @Query("SELECT DISTINCT ua.question.survey.id FROM UserAnswer ua WHERE ua.user.id = :userId")
    List<Long> findSurveyIdsByUserId(Long userId);
}

