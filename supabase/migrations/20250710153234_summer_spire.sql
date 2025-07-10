/*
  # Fix result_status type casting error

  1. Problem
    - The calculate_gpa function is trying to set result_status as text
    - But the column expects result_status enum type
    
  2. Solution
    - Cast the text values to the proper enum type
    - Update the function to use proper type casting
*/

-- Fix the calculate_gpa function to properly cast result_status
CREATE OR REPLACE FUNCTION calculate_gpa(result_id_param uuid)
RETURNS decimal AS $$
DECLARE
  total_points decimal := 0;
  total_subjects integer := 0;
  grade_value decimal;
  gpa_result decimal;
  new_status result_status;
BEGIN
  SELECT 
    SUM(
      CASE 
        WHEN grade = 'A+' THEN 5.0
        WHEN grade = 'A' THEN 4.0
        WHEN grade = 'A-' THEN 3.5
        WHEN grade = 'B' THEN 3.0
        WHEN grade = 'C' THEN 2.0
        WHEN grade = 'D' THEN 1.0
        ELSE 0.0
      END
    ),
    COUNT(*)
  INTO total_points, total_subjects
  FROM result_subjects
  WHERE result_id = result_id_param;
  
  IF total_subjects > 0 THEN
    gpa_result := total_points / total_subjects;
    -- Cap GPA at 5.0
    IF gpa_result > 5.0 THEN
      gpa_result := 5.0;
    END IF;
  ELSE
    gpa_result := 0.0;
  END IF;
  
  -- Determine the result status with proper type casting
  IF gpa_result = 0.0 THEN
    new_status := 'Failed'::result_status;
  ELSIF gpa_result < 2.0 THEN
    new_status := 'Critical'::result_status;
  ELSE
    new_status := 'Passed'::result_status;
  END IF;
  
  -- Update the result table with proper type casting
  UPDATE results 
  SET gpa = gpa_result,
      result_status = new_status
  WHERE id = result_id_param;
  
  RETURN gpa_result;
END;
$$ LANGUAGE plpgsql;