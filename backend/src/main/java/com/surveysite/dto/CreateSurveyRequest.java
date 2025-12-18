package com.surveysite.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateSurveyRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String topic;
    
    @NotEmpty(message = "At least one question is required")
    private List<QuestionRequest> questions;
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    
    public List<QuestionRequest> getQuestions() { return questions; }
    public void setQuestions(List<QuestionRequest> questions) { this.questions = questions; }
    
    public static class QuestionRequest {
        @NotBlank(message = "Question text is required")
        private String text;
        
        @NotEmpty(message = "At least two options are required")
        private List<String> options;
        
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
    }
}

