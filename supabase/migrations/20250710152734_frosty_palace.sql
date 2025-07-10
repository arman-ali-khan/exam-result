/*
  # Fix User Creation Trigger

  1. Problem
    - The handle_new_user function is failing with "Database error saving new user"
    - This is caused by the SECURITY DEFINER function not having the correct search path

  2. Solution
    - Update the handle_new_user function to explicitly set the search path
    - This ensures the function can access the public schema tables correctly
*/

-- Function to create user profile on sign up with proper search path
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public, auth;
  
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();