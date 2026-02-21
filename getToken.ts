import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

async function main() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: "manager@test.com",  // change if needed
        password: "Test1234!"          // change if needed
    });

    if (error) {
        console.error("Login failed:", error.message);
        return;
    }

    console.log("\nACCESS TOKEN:\n");
    console.log(data.session?.access_token);
}

main();