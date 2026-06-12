"use strict";

const SUPABASE_URL = "__SUPABASE_URL__";
const SUPABASE_KEY = "__SUPABASE_PUBLISHABLE_KEY__";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const VishiDB = {
  async getSchedule() {
    const { data, error } = await supabaseClient.from("global_schedule").select("*").eq("id","main").single();
    if (error) return null;
    return data?.schedule_json || null;
  },
  async saveSchedule(schedule) {
    return supabaseClient.from("global_schedule").upsert({id:"main",schedule_json:schedule,updated_at:new Date().toISOString()});
  },
  async logLogin(username, success) {
    return supabaseClient.from("login_logs").insert({username,success,user_agent:navigator.userAgent});
  },
  async getUserOverride(username) {
    const { data } = await supabaseClient.from("user_overrides").select("*").eq("username",username).single();
    return data || null;
  }
};

window.VishiDB = VishiDB;