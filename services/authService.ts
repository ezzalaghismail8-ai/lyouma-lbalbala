
import { Project, User } from "../types";
import { supabase } from "./supabaseClient";

// نظام تخزين محلي متقدم للمحاكاة في حال فشل الاتصال بالسيرفر أو عدم وجود مفاتيح
const getLocalUsers = () => JSON.parse(localStorage.getItem('tl_users') || '[]');
const getLocalProjects = () => JSON.parse(localStorage.getItem('tl_projects') || '[]');
const saveLocalUsers = (users: any[]) => localStorage.setItem('tl_users', JSON.stringify(users));
const saveLocalProjects = (projects: any[]) => localStorage.setItem('tl_projects', JSON.stringify(projects));

const IS_SUPABASE_CONFIGURED = !supabase.supabaseUrl.includes('your-project');

export const authService = {
  async signUp(email: string, password: string, username: string) {
    if (IS_SUPABASE_CONFIGURED) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } }
        });
        if (error) throw error;
        return data.user;
      } catch (err: any) {
        if (err.message !== 'Failed to fetch') throw err;
      }
    }

    // Fallback: نظام محلي يحاكي السيرفر تماماً
    const users = getLocalUsers();
    if (users.find((u: any) => u.email === email)) throw new Error('البريد الإلكتروني مسجل مسبقاً');
    
    const newUser = { id: Math.random().toString(36).substr(2, 9), email, username, joinedAt: Date.now(), password };
    users.push(newUser);
    saveLocalUsers(users);
    
    // حفظ الجلسة محلياً
    localStorage.setItem('tl_session', JSON.stringify(newUser));
    return newUser;
  },

  async signIn(email: string, password: string) {
    if (IS_SUPABASE_CONFIGURED) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data.user;
      } catch (err: any) {
        if (err.message !== 'Failed to fetch') throw err;
      }
    }

    // Fallback: تسجيل دخول محلي
    const users = getLocalUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    
    localStorage.setItem('tl_session', JSON.stringify(user));
    return user;
  },

  async logout() {
    if (IS_SUPABASE_CONFIGURED) {
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem('tl_session');
  },

  async getCurrentUser(): Promise<User | null> {
    if (IS_SUPABASE_CONFIGURED) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          return {
            id: session.user.id,
            username: session.user.user_metadata.username || 'مبدع',
            email: session.user.email || '',
            joinedAt: new Date(session.user.created_at).getTime()
          };
        }
      } catch (e) {}
    }

    const session = localStorage.getItem('tl_session');
    return session ? JSON.parse(session) : null;
  },

  async saveProject(userId: string, project: Project) {
    if (IS_SUPABASE_CONFIGURED) {
      try {
        const { error } = await supabase.from('projects').insert([{ 
          user_id: userId,
          name: project.name,
          media_type: project.mediaType,
          target_language: project.targetLanguage,
          score: project.score,
          user_translation: project.userTranslation,
          exercise_data: project.exerciseData,
          media_url: project.mediaUrl
        }]);
        if (!error) return;
      } catch (e) {}
    }

    // Fallback
    const projects = getLocalProjects();
    projects.push({ ...project, userId, createdAt: new Date().toISOString() });
    saveLocalProjects(projects);
  },

  async getUserProjects(userId: string): Promise<Project[]> {
    if (IS_SUPABASE_CONFIGURED) {
      try {
        const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            name: item.name,
            mediaType: item.media_type,
            targetLanguage: item.target_language,
            score: item.score,
            timestamp: new Date(item.created_at).getTime(),
            userTranslation: item.user_translation,
            exerciseData: item.exercise_data,
            mediaUrl: item.media_url
          }));
        }
      } catch (e) {}
    }

    // Fallback
    const projects = getLocalProjects();
    return projects
      .filter((p: any) => p.userId === userId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};
