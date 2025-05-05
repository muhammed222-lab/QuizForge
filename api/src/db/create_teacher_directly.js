require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function getCurrentUser() {
  try {
    // Get the current user session
    const { data, error } = await supabaseAdmin.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    if (!data.session) {
      console.log('No active session found');
      return null;
    }
    
    // Get user details
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(data.session.access_token);
    
    if (userError) {
      console.error('Error getting user:', userError);
      return null;
    }
    
    return userData.user;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

async function createTeacherRecord() {
  try {
    // List all users
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error listing users:', usersError);
      return;
    }
    
    console.log(`Found ${users.users.length} users`);
    
    // Process each user
    for (const user of users.users) {
      console.log(`Processing user: ${user.id} (${user.email})`);
      
      // Check if teacher record already exists
      const { data: existingTeacher, error: checkError } = await supabaseAdmin
        .from('teachers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      
      if (!checkError && existingTeacher) {
        console.log(`Teacher record already exists for user ${user.id}: ${existingTeacher.id}`);
        continue;
      }
      
      // Create teacher record
      const { data: teacher, error: insertError } = await supabaseAdmin
        .from('teachers')
        .insert({
          auth_user_id: user.id,
          name: user.user_metadata?.full_name || user.email,
          email: user.email
        })
        .select()
        .single();
      
      if (insertError) {
        console.error(`Error creating teacher record for user ${user.id}:`, insertError);
      } else {
        console.log(`Teacher record created successfully for user ${user.id}: ${teacher.id}`);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createTeacherRecord()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
