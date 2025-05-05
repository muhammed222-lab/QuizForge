require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function getCurrentUser() {
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
    
    console.log('Current user ID:', user.id);
    console.log('Current user email:', user.email);
    console.log('Current user metadata:', user.user_metadata);
    
    return user;
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

getCurrentUser()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
