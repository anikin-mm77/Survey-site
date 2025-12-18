package com.surveysite.repository;

import com.surveysite.model.Survey;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, Long> {
    
    List<Survey> findByTopic(String topic);
    
    Page<Survey> findByTopic(String topic, Pageable pageable);
    
    List<Survey> findByAuthorId(Long authorId);
    
    List<Survey> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
    
    @Query("SELECT COUNT(l) FROM Like l WHERE l.survey.id = :surveyId")
    Long countLikes(Long surveyId);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.survey.id = :surveyId")
    Long countComments(Long surveyId);
}

