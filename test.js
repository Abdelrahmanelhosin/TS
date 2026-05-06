const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$queryRawUnsafe(`
                SELECT 
                    s.id, s.title, s.description, s.survey_link, s.completion_code,
                    s.platform::text as platform, s.reward_amount::text as reward_amount,
                    s.estimated_time, s.total_cost::text as total_cost, s.status::text as status,
                    s.created_at, s.creator_id, s.target_audience,
                    array_to_json(s.target_gender) as target_gender, array_to_json(s.target_age_group) as target_age_group,
                    array_to_json(s.target_city) as target_city, array_to_json(s.target_occupation) as target_occupation,
                    array_to_json(s.target_education) as target_education, array_to_json(s.target_employment_status) as target_employment_status,
                    array_to_json(s.target_sector) as target_sector, array_to_json(s.target_position) as target_position,
                    array_to_json(s.target_marital_status) as target_marital_status, array_to_json(s.target_child_count) as target_child_count,
                    s.target_income, s.duration::text as duration, s.video_conference_optin,
                    p.full_name as creator_name,
                    (SELECT count(*)::int FROM public.submissions sub WHERE sub.survey_id = s.id) as submission_count
                FROM public.surveys s
                JOIN public.profiles p ON s.creator_id = p.id
                ORDER BY s.created_at DESC LIMIT 50
`)
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
