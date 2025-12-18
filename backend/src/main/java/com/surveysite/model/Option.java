package com.surveysite.model;

import jakarta.persistence.*;

@Entity
@Table(name = "options")
public class Option {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
    
    @Column(nullable = false)
    private String text;
    
    @Column(nullable = false)
    private Integer orderIndex;
    
    public Option() {}
    
    public Option(Long id, Question question, String text, Integer orderIndex) {
        this.id = id;
        this.question = question;
        this.text = text;
        this.orderIndex = orderIndex;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }
    
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}

