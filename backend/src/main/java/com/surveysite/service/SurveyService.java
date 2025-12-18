package com.surveysite.service;

import com.surveysite.dto.CreateSurveyRequest;
import com.surveysite.model.*;
import com.surveysite.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SurveyService {
    
    @Autowired
    private SurveyRepository surveyRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private OptionRepository optionRepository;
    
    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private SaveRepository saveRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private UserAnswerRepository userAnswerRepository;

    public List<String> getTopics() {
        return Arrays.asList("marketing", "business", "education", "character", "medicine", "attention");
    }

    public List<Map<String, Object>> getSurveys(String topic, Integer page, Integer limit) {
        List<Survey> surveys;
        
        if (topic != null && !topic.isEmpty()) {
            if (page != null && limit != null) {
                surveys = surveyRepository.findByTopic(topic, PageRequest.of(page - 1, limit)).getContent();
            } else {
                surveys = surveyRepository.findByTopic(topic);
            }
        } else {
            if (page != null && limit != null) {
                surveys = surveyRepository.findAll(PageRequest.of(page - 1, limit)).getContent();
            } else {
                surveys = surveyRepository.findAll();
            }
        }
        
        return surveys.stream().map(this::toMapDetailed).collect(Collectors.toList());
    }
    
    public Map<String, Object> getSurveyById(Long id) {
        Survey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Survey not found"));
        return toMapDetailed(survey);
    }
    
    @Transactional
    public Map<String, Object> createSurvey(CreateSurveyRequest request, Long userId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Survey survey = new Survey();
        survey.setAuthor(author);
        survey.setTitle(request.getTitle());
        survey.setTopic(request.getTopic());
        survey = surveyRepository.save(survey);
        
        int questionIndex = 0;
        for (CreateSurveyRequest.QuestionRequest qReq : request.getQuestions()) {
            Question question = new Question();
            question.setSurvey(survey);
            question.setText(qReq.getText());
            question.setOrderIndex(questionIndex++);
            question = questionRepository.save(question);
            
            int optionIndex = 0;
            for (String optionText : qReq.getOptions()) {
                Option option = new Option();
                option.setQuestion(question);
                option.setText(optionText);
                option.setOrderIndex(optionIndex++);
                optionRepository.save(option);
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", survey.getId());
        response.put("message", "Survey created successfully");
        return response;
    }

    public Map<String, Object> getSurveyState(Long surveyId, Long userId) {
        Map<String, Object> state = new HashMap<>();
        state.put("liked", likeRepository.existsByUserIdAndSurveyId(userId, surveyId));
        state.put("saved", saveRepository.existsByUserIdAndSurveyId(userId, surveyId));
        return state;
    }
    
    @Transactional
    public Map<String, Object> toggleLike(Long surveyId, boolean liked, Long userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (liked) {
            if (!likeRepository.existsByUserIdAndSurveyId(userId, surveyId)) {
                Like like = new Like();
                like.setUser(user);
                like.setSurvey(survey);
                likeRepository.save(like);
            }
        } else {
            likeRepository.deleteByUserIdAndSurveyId(userId, surveyId);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("likes_count", likeRepository.countBySurveyId(surveyId));
        response.put("liked", liked);
        return response;
    }
    
    @Transactional
    public Map<String, Object> toggleSave(Long surveyId, boolean saved, Long userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (saved) {
            if (!saveRepository.existsByUserIdAndSurveyId(userId, surveyId)) {
                Save save = new Save();
                save.setUser(user);
                save.setSurvey(survey);
                saveRepository.save(save);
            }
        } else {
            saveRepository.deleteByUserIdAndSurveyId(userId, surveyId);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("saved", saved);
        return response;
    }

    public Map<String, String> getPollAnswers(Long surveyId, Long userId) {
        List<UserAnswer> answers = userAnswerRepository.findByUserIdAndQuestionSurveyId(userId, surveyId);
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));
        
        List<Question> questions = survey.getQuestions().stream()
                .sorted(Comparator.comparing(Question::getOrderIndex))
                .collect(Collectors.toList());
        
        Map<String, String> result = new HashMap<>();
        for (UserAnswer answer : answers) {
            int questionIndex = questions.indexOf(answer.getQuestion());
            if (questionIndex >= 0) {
                result.put(String.valueOf(questionIndex), answer.getOption().getText());
            }
        }
        return result;
    }
    
    @Transactional
    public Map<String, String> savePollAnswer(Long surveyId, Integer questionIndex, String answerText, Long userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));
        
        List<Question> questions = survey.getQuestions().stream()
                .sorted(Comparator.comparing(Question::getOrderIndex))
                .collect(Collectors.toList());
        
        if (questionIndex < 0 || questionIndex >= questions.size()) {
            throw new RuntimeException("Invalid question index");
        }
        
        Question question = questions.get(questionIndex);
        Option selectedOption = question.getOptions().stream()
                .filter(opt -> opt.getText().equals(answerText))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Option not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userAnswerRepository.findByUserIdAndQuestionId(userId, question.getId())
                .ifPresent(userAnswerRepository::delete);
        
        UserAnswer userAnswer = new UserAnswer();
        userAnswer.setUser(user);
        userAnswer.setQuestion(question);
        userAnswer.setOption(selectedOption);
        userAnswerRepository.save(userAnswer);
        
        return getPollAnswers(surveyId, userId);
    }
    
    public Map<String, Object> getPollStats(Long surveyId, Integer questionIndex) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));
        
        List<Question> questions = survey.getQuestions().stream()
                .sorted(Comparator.comparing(Question::getOrderIndex))
                .collect(Collectors.toList());
        
        if (questionIndex < 0 || questionIndex >= questions.size()) {
            throw new RuntimeException("Invalid question index");
        }
        
        Question question = questions.get(questionIndex);
        Map<String, Long> counts = new HashMap<>();
        long total = 0;
        
        for (Option option : question.getOptions()) {
            Long count = userAnswerRepository.countByQuestionAndOption(question.getId(), option.getText());
            counts.put(option.getText(), count);
            total += count;
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("counts", counts);
        result.put("total", total);
        return result;
    }

    public List<Map<String, Object>> getComments(Long surveyId) {
        return commentRepository.findBySurveyIdOrderByCreatedAtDesc(surveyId).stream()
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", c.getId());
                    map.put("text", c.getText());
                    map.put("createdAt", c.getCreatedAt());
                    map.put("author", c.getAuthor().getName());
                    map.put("authorId", c.getAuthor().getId());
                    return map;
                }).collect(Collectors.toList());
    }
    
    public Map<String, Object> addComment(Long surveyId, String text, Long userId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Survey not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Comment comment = new Comment();
        comment.setSurvey(survey);
        comment.setAuthor(user);
        comment.setText(text);
        comment = commentRepository.save(comment);
        
        Map<String, Object> map = new HashMap<>();
        map.put("id", comment.getId());
        map.put("text", comment.getText());
        map.put("createdAt", comment.getCreatedAt());
        map.put("author", user.getName());
        map.put("authorId", user.getId());
        return map;
    }

    private Map<String, Object> toMap(Survey survey) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", survey.getId());
        map.put("title", survey.getTitle());
        map.put("topic", survey.getTopic());
        map.put("createdAt", survey.getCreatedAt());
        map.put("author", survey.getAuthor().getName());
        map.put("authorId", survey.getAuthor().getId());
        map.put("type", "poll");
        map.put("time", formatTime(survey.getCreatedAt()));
        map.put("likes", likeRepository.countBySurveyId(survey.getId()));
        map.put("likesCount", likeRepository.countBySurveyId(survey.getId()));
        map.put("comments", commentRepository.countBySurveyId(survey.getId()));
        map.put("commentsCount", commentRepository.countBySurveyId(survey.getId()));
        return map;
    }
    
    private Map<String, Object> toMapDetailed(Survey survey) {
        Map<String, Object> map = toMap(survey);
        
        List<Map<String, Object>> questions = survey.getQuestions().stream()
                .sorted(Comparator.comparing(Question::getOrderIndex))
                .map(q -> {
                    Map<String, Object> qMap = new HashMap<>();
                    qMap.put("text", q.getText());
                    qMap.put("options", q.getOptions().stream()
                            .sorted(Comparator.comparing(Option::getOrderIndex))
                            .map(Option::getText)
                            .collect(Collectors.toList()));
                    return qMap;
                }).collect(Collectors.toList());
        
        Map<String, Object> poll = new HashMap<>();
        poll.put("questions", questions);
        map.put("poll", poll);
        
        return map;
    }
    
    private String formatTime(java.time.LocalDateTime createdAt) {
        if (createdAt == null) return "recently";
        long seconds = java.time.Duration.between(createdAt, java.time.LocalDateTime.now()).getSeconds();
        if (seconds < 60) return "just now";
        if (seconds < 3600) return (seconds / 60) + " min. ago";
        if (seconds < 86400) return (seconds / 3600) + " hr. ago";
        return (seconds / 86400) + " days ago";
    }
    
    public List<Map<String, Object>> getUserCreatedSurveys(Long userId) {
        List<Survey> surveys = surveyRepository.findByAuthorIdOrderByCreatedAtDesc(userId);
        return surveys.stream().map(this::toMap).collect(Collectors.toList());
    }
    
    public List<Map<String, Object>> getUserPassedSurveys(Long userId) {
        List<UserAnswer> answers = userAnswerRepository.findByUserId(userId);
        Set<Long> surveyIds = answers.stream()
                .map(a -> a.getQuestion().getSurvey().getId())
                .collect(Collectors.toSet());
        
        List<Survey> surveys = surveyRepository.findAllById(surveyIds);
        return surveys.stream().map(this::toMap).collect(Collectors.toList());
    }
    
    public List<Map<String, Object>> getUserSavedSurveys(Long userId) {
        List<Save> saves = saveRepository.findByUserId(userId);
        List<Long> surveyIds = saves.stream()
                .map(s -> s.getSurvey().getId())
                .collect(Collectors.toList());
        
        List<Survey> surveys = surveyRepository.findAllById(surveyIds);
        return surveys.stream().map(this::toMap).collect(Collectors.toList());
    }
}
