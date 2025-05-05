require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createTeacherForCurrentUser() {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      return;
    }
    
    if (!user) {
      console.error('No authenticated user found');
      return;
    }
    
    console.log('Current user:', user.id, user.email);
    
    // Check if teacher record already exists
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();
    
    if (!checkError && existingTeacher) {
      console.log('Teacher record already exists:', existingTeacher.id);
      return;
    }
    
    // Create teacher record
    const { data: teacher, error: insertError } = await supabase
      .from('teachers')
      .insert({
        auth_user_id: user.id,
        name: user.user_metadata?.full_name || user.email,
        email: user.email
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating teacher record:', insertError);
      return;
    }
    
    console.log('Teacher record created successfully:', teacher.id);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTeacherForCurrentUser();
