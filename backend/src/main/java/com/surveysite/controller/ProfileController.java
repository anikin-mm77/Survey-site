package com.surveysite.controller;

import com.surveysite.service.AuthService;
import com.surveysite.service.SurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/profile")
public class ProfileController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private SurveyService surveyService;
    
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(authService.getProfile(userId));
    }
    
    @GetMapping("/surveys/created")
    public ResponseEntity<List<Map<String, Object>>> getCreatedSurveys(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(surveyService.getUserCreatedSurveys(userId));
    }
    
    @GetMapping("/surveys/passed")
    public ResponseEntity<List<Map<String, Object>>> getPassedSurveys(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(surveyService.getUserPassedSurveys(userId));
    }
    
    @GetMapping("/surveys/saved")
    public ResponseEntity<List<Map<String, Object>>> getSavedSurveys(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(surveyService.getUserSavedSurveys(userId));
    }
}

