import { supabase } from "../supabaseClient";

export const taskService = {
  async getTasks(userId, tier) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .eq("tier", tier)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMilestones(userId) {
    const { data, error } = await supabase
      .from("milestones")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createTask(userId, taskData) {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ user_id: userId, ...taskData }])
      .select();

    if (error) throw error;
    return data[0];
  },

  async createMilestone(userId, milestoneData) {
    const { data, error } = await supabase
      .from("milestones")
      .insert([{ user_id: userId, ...milestoneData }])
      .select();

    if (error) throw error;
    return data[0];
  },

  async completeTask(id) {
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "done",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },

  async completeMilestone(id) {
    const { error } = await supabase
      .from("milestones")
      .update({
        status: "done",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },

  async deleteTask(id) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },

  async deleteMilestone(id) {
    const { error } = await supabase.from("milestones").delete().eq("id", id);
    if (error) throw error;
  },
};
