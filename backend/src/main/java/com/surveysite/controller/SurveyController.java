package com.surveysite.controller;

import com.surveysite.dto.*;
import com.surveysite.service.SurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class SurveyController {
    
    @Autowired
    private SurveyService surveyService;
    
    @GetMapping("/topics")
    public ResponseEntity<List<String>> getTopics() {
        return ResponseEntity.ok(surveyService.getTopics());
    }
    
    @GetMapping("/surveys")
    public ResponseEntity<List<Map<String, Object>>> getSurveys(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(surveyService.getSurveys(topic, page, limit));
    }
    
    @GetMapping("/surveys/{id}")
    public ResponseEntity<Map<String, Object>> getSurveyById(@PathVariable Long id) {
        return ResponseEntity.ok(surveyService.getSurveyById(id));
    }
    
    @PostMapping("/surveys")
    public ResponseEntity<Map<String, Object>> createSurvey(
            @RequestBody CreateSurveyRequest request, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(surveyService.createSurvey(request, userId));
    }
    
    @GetMapping("/surveys/{id}/state")
    public ResponseEntity<Map<String, Object>> getSurveyState(
            @PathVariable Long id, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(surveyService.getSurveyState(id, userId));
    }
    
    @PostMapping("/surveys/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long id, @RequestBody Map<String, Boolean> body, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        boolean liked = body.getOrDefault("liked", false);
        return ResponseEntity.ok(surveyService.toggleLike(id, liked, userId));
    }
    
    @PostMapping("/surveys/{id}/save")
    public ResponseEntity<Map<String, Object>> toggleSave(
            @PathVariable Long id, @RequestBody Map<String, Boolean> body, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        boolean saved = body.getOrDefault("saved", false);
        return ResponseEntity.ok(surveyService.toggleSave(id, saved, userId));
    }
    
    @GetMapping("/surveys/{id}/answers")
    public ResponseEntity<Map<String, String>> getPollAnswers(
            @PathVariable Long id, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(surveyService.getPollAnswers(id, userId));
    }
    
    @PostMapping("/surveys/{id}/answers")
    public ResponseEntity<Map<String, String>> savePollAnswer(
            @PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        Integer questionIndex = (Integer) body.get("questionIndex");
        String answer = (String) body.get("answer");
        return ResponseEntity.ok(surveyService.savePollAnswer(id, questionIndex, answer, userId));
    }
    
    @GetMapping("/surveys/{id}/stats")
    public ResponseEntity<Map<String, Object>> getPollStats(
            @PathVariable Long id, @RequestParam Integer questionIndex) {
        return ResponseEntity.ok(surveyService.getPollStats(id, questionIndex));
    }
    
    @GetMapping("/surveys/{id}/comments")
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(surveyService.getComments(id));
    }
    
    @PostMapping("/surveys/{id}/comments")
    public ResponseEntity<Map<String, Object>> addComment(
            @PathVariable Long id, @RequestBody CommentRequest request, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(surveyService.addComment(id, request.getText(), userId));
    }
}
