const { execSync } = require('child_process');

const envs = {
  VITE_SUPABASE_URL: 'https://usymwbefimqcsxbbojyt.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'sb_publishable_gly8hsPH5VGuOtOOM3tOnQ_gvya9P7k',
  VITE_RAZORPAY_KEY_ID: 'rzp_live_SgPkG3d1aCFRNd',
  VITE_API_URL: 'http://localhost:3000'
};

const targets = ['production', 'development'];

console.log('🚀 Adding environment variables to Vercel (Production and Development)...');

for (const [key, value] of Object.entries(envs)) {
  for (const target of targets) {
    try {
      console.log(`Adding ${key} to ${target}...`);
      execSync(`npx vercel env add ${key} ${target} --value "${value}" --yes`, { stdio: 'pipe' });
      console.log(`✅ Successfully added ${key} to ${target}`);
    } catch (err) {
      const errMsg = err.stderr ? err.stderr.toString() : err.message;
      if (errMsg.includes('already exists')) {
        console.log(`ℹ️ ${key} already exists in ${target}. Skipping.`);
      } else {
        console.error(`❌ Failed to add ${key} to ${target}:`, errMsg.trim());
      }
    }
  }
}

console.log('🎉 Done configuring Vercel environment variables!');
