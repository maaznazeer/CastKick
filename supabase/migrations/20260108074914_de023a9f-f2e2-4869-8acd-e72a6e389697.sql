-- Update the handle_new_user function to use the requested_role from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role app_role;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Get requested role from metadata, default to 'user' if not provided or invalid
  requested_role := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'requested_role', '')::app_role,
    'user'::app_role
  );
  
  -- Assign the requested role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, requested_role);
  
  RETURN NEW;
EXCEPTION
  WHEN invalid_text_representation THEN
    -- If the role value is invalid, default to 'user'
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$;