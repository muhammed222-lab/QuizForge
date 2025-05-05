require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTeacherForUser(userId) {
  try {
    // Get user details
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error('Error getting user:', userError);
      return;
    }
    
    if (!user) {
      console.error('User not found');
      return;
    }
    
    console.log('User:', user.id, user.email);
    
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
    return teacher;
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Get user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('Please provide a user ID as a command line argument');
  process.exit(1);
}

createTeacherForUser(userId)
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
