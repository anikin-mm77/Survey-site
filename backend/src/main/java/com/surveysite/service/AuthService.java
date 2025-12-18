package com.surveysite.service;

import com.surveysite.dto.*;
import com.surveysite.model.User;
import com.surveysite.repository.*;
import com.surveysite.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SurveyRepository surveyRepository;
    
    @Autowired
    private UserAnswerRepository userAnswerRepository;
    
    @Autowired
    private SaveRepository saveRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already used");
        }
        
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        
        return new AuthResponse(token, userMap);
    }
    
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        
        return new AuthResponse(token, userMap);
    }
    
    public Map<String, Object> getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        
        return userMap;
    }
    
    public Map<String, Object> getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());

        List<Map<String, Object>> created = surveyRepository.findByAuthorId(userId).stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getId());
                    map.put("title", s.getTitle());
                    return map;
                }).collect(Collectors.toList());

        List<Map<String, Object>> passed = userAnswerRepository.findSurveyIdsByUserId(userId).stream()
                .map(id -> surveyRepository.findById(id).orElse(null))
                .filter(s -> s != null)
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getId());
                    map.put("title", s.getTitle());
                    return map;
                }).collect(Collectors.toList());

        List<Map<String, Object>> favourites = saveRepository.findByUserId(userId).stream()
                .map(save -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", save.getSurvey().getId());
                    map.put("title", save.getSurvey().getTitle());
                    return map;
                }).collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("user", userMap);
        result.put("created", created);
        result.put("passed", passed);
        result.put("favourites", favourites);
        
        return result;
    }
}
