require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://kqwwwcrswzmrlzwlubjm.supabase.co",
  process.env.DATABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;
