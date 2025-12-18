import { request } from "./client";

export const getSurveys = (params = {}) => {
  const query = new URLSearchParams();
  if (params.topic) query.set("topic", params.topic);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);
  const queryString = query.toString();
  return request(`/surveys${queryString ? `?${queryString}` : ""}`);
};

export const getSurveyById = id => request(`/surveys/${id}`);

export const createSurvey = payload => request("/surveys", { method: "POST", body: payload });

export const getComments = surveyId => request(`/surveys/${surveyId}/comments`);
export const addComment = (surveyId, text) =>
  request(`/surveys/${surveyId}/comments`, { method: "POST", body: { text } });

export const getPopularTopics = () => request("/topics");

export const getUserSurveyState = surveyId => request(`/surveys/${surveyId}/state`);
export const toggleLike = (surveyId, liked) =>
  request(`/surveys/${surveyId}/like`, { method: "POST", body: { liked } });
export const toggleSave = (surveyId, saved) =>
  request(`/surveys/${surveyId}/save`, { method: "POST", body: { saved } });

export const getPollAnswers = surveyId => request(`/surveys/${surveyId}/answers`);
export const savePollAnswer = (surveyId, questionIndex, answer) =>
  request(`/surveys/${surveyId}/answers`, { method: "POST", body: { questionIndex, answer } });
export const getPollStats = (surveyId, questionIndex) =>
  request(`/surveys/${surveyId}/stats?questionIndex=${questionIndex}`);

export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: { email, password } });
export const register = (name, email, password) =>
  request("/auth/register", { method: "POST", body: { name, email, password } });
export const logout = () => request("/auth/logout", { method: "POST" });
export const me = () => request("/auth/me");

export const getProfile = () => request("/profile/me");
export const getCreatedSurveys = () => request("/profile/surveys/created");
export const getPassedSurveys = () => request("/profile/surveys/passed");
export const getSavedSurveys = () => request("/profile/surveys/saved");
