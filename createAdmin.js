import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fdlfqbvuawrgezxygeof.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbGZxYnZ1YXdyZ2V6eHlnZW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjU4NDAsImV4cCI6MjA4NzgwMTg0MH0.gG3nxp4LEpfPNab3rL-oiOr7CLgwy7e1cVUrBZTHLCM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
    const { data, error } = await supabase.auth.signUp({
        email: 'admin@managerloja.com',
        password: 'diego01'
    })
    if (error) {
        console.error('Error:', error.message)
    } else {
        console.log('Success:', data)
    }
}

createAdmin()
