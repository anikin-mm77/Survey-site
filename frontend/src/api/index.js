import * as http from "./http.js";
import * as mock from "./mock.js";
const useMock = String(import.meta.env.VITE_USE_MOCK ?? "1") !== "0";
const impl = useMock ? mock : http;

export const getSurveys = impl.getSurveys || impl.getPosts;
export const getSurveyById = impl.getSurveyById || impl.getPostById;
export const createSurvey = impl.createSurvey;

export const getPosts = impl.getSurveys || impl.getPosts;
export const getPostById = impl.getSurveyById || impl.getPostById;

export const getComments = impl.getComments;
export const addComment = impl.addComment;

export const getPopularTopics = impl.getPopularTopics;

export const getUserSurveyState = impl.getUserSurveyState || impl.getUserPostState;
export const toggleLike = impl.toggleLike;
export const toggleSave = impl.toggleSave;

export const getUserPostState = impl.getUserSurveyState || impl.getUserPostState;

export const getPollAnswers = impl.getPollAnswers;
export const savePollAnswer = impl.savePollAnswer;
export const getPollStats = impl.getPollStats;

export const login = impl.login;
export const register = impl.register;
export const logout = impl.logout;
export const me = impl.me;

export const getProfile = impl.getProfile;
export const getCreatedSurveys = impl.getCreatedSurveys;
export const getPassedSurveys = impl.getPassedSurveys;
export const getSavedSurveys = impl.getSavedSurveys;
