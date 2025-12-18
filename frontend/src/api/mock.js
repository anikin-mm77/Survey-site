import { getToken, setToken } from "./session";

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

const LS_USER = "mock_user_state_v1";
const LS_COMMENTS = "mock_comments_v1";
const LS_POSTS = "mock_posts_v1";
const LS_USERS = "mock_users_v1";

const read = (k, fb) => {
  try {
    const s = localStorage.getItem(k);
    return s ? JSON.parse(s) : fb;
  } catch {
    return fb;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

const now = Date.now();
const seedPosts = [
  {
    id: 1,
    authorId: 1,
    author: "Author",
    time: "6 hr. ago",
    createdAt: now - 6 * 3600 * 1000,
    title: "Find out your character",
    type: "poll",
    topic: "character",
    likes: 8300,
    comments: 0,
    saved: false,
    poll: {
      questions: [
        {
          text: "Choose the most beautiful colour of this:",
          options: ["Red", "Green", "Blue", "White"],
        },
      ],
    },
  },
  {
    id: 2,
    authorId: 1,
    author: "Kate",
    time: "3 hr. ago",
    createdAt: now - 3 * 3600 * 1000,
    title: "Marketing habits 2025",
    type: "poll",
    topic: "marketing",
    likes: 1200,
    comments: 0,
    saved: false,
    poll: {
      questions: [{ text: "Best channel?", options: ["SEO", "PPC", "SMM", "Email"] }],
    },
  },
  {
    id: 3,
    authorId: 1,
    author: "Teacher",
    time: "1 hr. ago",
    createdAt: now - 1 * 3600 * 1000,
    title: "Education tools",
    type: "poll",
    topic: "education",
    likes: 540,
    comments: 0,
    saved: false,
    poll: {
      questions: [{ text: "Pick a tool:", options: ["Moodle", "Notion", "Sheets"] }],
    },
  },
];

const seedComments = {
  1: [
    { id: 101, author: "Anna", text: "Nice test!" },
    { id: 102, author: "Max", text: "I chose white too." },
  ],
  2: [],
  3: [],
};

let postsDB = read(LS_POSTS, seedPosts).map(p => ({ ...p }));
let commentsDB = read(LS_COMMENTS, seedComments);
let usersDB = read(LS_USERS, [
  { id: 1, name: "Demo", email: "demo@example.com", password: "demo" },
]);
write(LS_USERS, usersDB);

function recalcComments() {
  postsDB = postsDB.map(p => ({ ...p, comments: commentsDB[p.id]?.length || 0 }));
}
recalcComments();

let userState = { liked: {}, saved: {}, answers: {}, created: [], ...read(LS_USER, {}) };
const saveUserState = () => write(LS_USER, userState);

function userFromToken() {
  const t = getToken();
  if (!t) return null;
  const id = String(t).split(".")[1] || t;
  return usersDB.find(u => String(u.id) === String(id)) || null;
}
function ensureAuth() {
  const u = userFromToken();
  if (!u) {
    const e = new Error("Unauthorized");
    e.status = 401;
    throw e;
  }
  return u;
}

export const getSurveys = async (params = {}) => {
  await delay();
  let result = postsDB.map(p => ({ ...p }));

  if (params.topic) {
    result = result.filter(p => p.topic === params.topic);
  }

  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 20;
  const start = (page - 1) * limit;
  const end = start + limit;

  return result.slice(start, end);
};

export const getPosts = getSurveys;

export const getSurveyById = async id => {
  await delay();
  const p = postsDB.find(p => String(p.id) === String(id));
  if (!p) throw new Error("Survey not found");
  return { ...p };
};

export const getPostById = getSurveyById;

export const getComments = async postId => {
  await delay();
  return (commentsDB[postId] || []).map(c => ({ ...c }));
};

export const addComment = async (postId, text, author = "You") => {
  await delay();
  const c = { id: Date.now(), author, text };
  commentsDB[postId] ||= [];
  commentsDB[postId].push(c);
  write(LS_COMMENTS, commentsDB);

  const i = postsDB.findIndex(p => String(p.id) === String(postId));
  if (i >= 0) {
    postsDB[i] = { ...postsDB[i], comments: (postsDB[i].comments || 0) + 1 };
    write(LS_POSTS, postsDB);
  }
  return { ...c };
};

export const getPopularTopics = async () => {
  await delay(150);
  return ["marketing", "business", "education", "character", "medicine", "attention"];
};

export const getUserSurveyState = async surveyId => {
  await delay(80);
  return { liked: !!userState.liked[surveyId], saved: !!userState.saved[surveyId] };
};

export const getUserPostState = getUserSurveyState;

export const toggleLike = async (postId, liked) => {
  ensureAuth();
  await delay(120);
  const was = !!userState.liked[postId];
  userState.liked[postId] = !!liked;
  saveUserState();

  const i = postsDB.findIndex(p => String(p.id) === String(postId));
  if (i < 0) throw new Error("Post not found");
  const delta = liked && !was ? 1 : !liked && was ? -1 : 0;
  const next = Math.max(0, (postsDB[i].likes || 0) + delta);
  postsDB[i] = { ...postsDB[i], likes: next };
  write(LS_POSTS, postsDB);
  return { likes: next, liked: !!liked };
};

export const toggleSave = async (postId, saved) => {
  ensureAuth();
  await delay(100);
  userState.saved[postId] = !!saved;
  saveUserState();
  return { saved: !!saved };
};

const votesDB = {};
function ensureVotes(postId) {
  if (votesDB[postId]) return;
  votesDB[postId] = {};
  const post = postsDB.find(p => String(p.id) === String(postId));
  post?.poll?.questions?.forEach((q, i) => {
    const counts = {};
    q.options.forEach(o => (counts[o] = Math.floor(10 + Math.random() * 60)));
    votesDB[postId][i] = counts;
  });
}

export const getPollAnswers = async postId => {
  await delay(80);
  return { ...(userState.answers[postId] || {}) };
};

export const savePollAnswer = async (surveyId, questionIndex, answer) => {
  ensureAuth();
  await delay(120);
  ensureVotes(surveyId);

  const prev = userState.answers[surveyId]?.[questionIndex];
  if (prev === answer) return { ...userState.answers[surveyId] };

  if (prev) {
    votesDB[surveyId][questionIndex][prev] = Math.max(
      0,
      (votesDB[surveyId][questionIndex][prev] || 0) - 1
    );
  }
  votesDB[surveyId][questionIndex][answer] = (votesDB[surveyId][questionIndex][answer] || 0) + 1;

  userState.answers[surveyId] ||= {};
  userState.answers[surveyId][questionIndex] = answer;
  saveUserState();
  return { ...userState.answers[surveyId] };
};

export const getPollStats = async (surveyId, questionIndex) => {
  await delay(80);
  ensureVotes(surveyId);
  const counts = { ...(votesDB[surveyId]?.[questionIndex] || {}) };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { counts, total };
};

export async function getProfile() {
  await delay(120);
  const u = userFromToken();
  if (!u) throw new Error("Unauthorized");

  const createdIds = new Set([...(userState.created || [])]);
  postsDB.forEach(p => {
    if (String(p.authorId) === String(u.id)) createdIds.add(p.id);
  });
  const created = [...createdIds].map(id => postsDB.find(p => p.id === id)).filter(Boolean);

  const passedIds = Object.keys(userState.answers || {});
  const passed = passedIds
    .map(id => postsDB.find(p => String(p.id) === String(id)))
    .filter(Boolean);

  const favIds = Object.entries(userState.saved || {})
    .filter(([, v]) => v)
    .map(([k]) => k);
  const favourites = favIds
    .map(id => postsDB.find(p => String(p.id) === String(id)))
    .filter(Boolean);

  return {
    user: { id: u.id, name: u.name, email: u.email },
    created: created.map(p => ({ id: p.id, title: p.title })),
    passed: passed.map(p => ({ id: p.id, title: p.title })),
    favourites: favourites.map(p => ({ id: p.id, title: p.title })),
  };
}

export async function getCreatedSurveys() {
  await delay(100);
  const u = userFromToken();
  if (!u) throw new Error("Unauthorized");

  const createdIds = new Set([...(userState.created || [])]);
  postsDB.forEach(p => {
    if (String(p.authorId) === String(u.id)) createdIds.add(p.id);
  });
  const created = [...createdIds].map(id => postsDB.find(p => p.id === id)).filter(Boolean);

  return created.map(p => ({ id: p.id, title: p.title }));
}

export async function getPassedSurveys() {
  await delay(100);
  const u = userFromToken();
  if (!u) throw new Error("Unauthorized");

  const passedIds = Object.keys(userState.answers || {});
  const passed = passedIds
    .map(id => postsDB.find(p => String(p.id) === String(id)))
    .filter(Boolean);

  return passed.map(p => ({ id: p.id, title: p.title }));
}

export async function getSavedSurveys() {
  await delay(100);
  const u = userFromToken();
  if (!u) throw new Error("Unauthorized");

  const favIds = Object.entries(userState.saved || {})
    .filter(([, v]) => v)
    .map(([k]) => k);
  const favourites = favIds
    .map(id => postsDB.find(p => String(p.id) === String(id)))
    .filter(Boolean);

  return favourites.map(p => ({ id: p.id, title: p.title }));
}

export async function createSurvey(payload) {
  const u = ensureAuth();
  await delay(200);

  const nowTs = Date.now();
  const newPost = {
    id: nowTs,
    authorId: u.id,
    author: u.name || u.email,
    time: "just now",
    createdAt: nowTs,
    title: payload.title || "Untitled survey",
    type: "poll",
    topic: payload.topic || "general",
    likes: 0,
    comments: 0,
    saved: false,
    poll: {
      questions: (payload.questions || []).map(q => ({
        text: q.text || "Question",
        options: (q.options || []).filter(Boolean),
      })),
    },
  };

  postsDB.unshift(newPost);
  write(LS_POSTS, postsDB);
  userState.created ||= [];
  if (!userState.created.includes(newPost.id)) userState.created.push(newPost.id);
  saveUserState();

  return { id: newPost.id };
}

export const login = async (email, password) => {
  await delay(200);
  const u = usersDB.find(x => x.email === email && x.password === password);
  if (!u) throw new Error("Invalid email or password");
  const token = `mock.${u.id}`;
  setToken(token);
  return { token, user: { id: u.id, name: u.name, email: u.email } };
};

export const register = async (name, email, password) => {
  await delay(200);
  if (usersDB.some(u => u.email === email)) throw new Error("Email already used");
  const u = { id: Date.now(), name, email, password };
  usersDB.push(u);
  write(LS_USERS, usersDB);
  const token = `mock.${u.id}`;
  setToken(token);
  return { token, user: { id: u.id, name: u.name, email: u.email } };
};

export const me = async () => {
  await delay(80);
  const u = userFromToken();
  return u ? { id: u.id, name: u.name, email: u.email } : null;
};

export const logout = async () => {
  await delay(50);
  setToken(null);
  return { ok: true };
};
