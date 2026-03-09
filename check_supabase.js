
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fdlfqbvuawrgezxygeof.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbGZxYnZ1YXdyZ2V6eHlnZW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjU4NDAsImV4cCI6MjA4NzgwMTg0MH0.gG3nxp4LEpfPNab3rL-oiOr7CLgwy7e1cVUrBZTHLCM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching services:', error)
        return
    }

    if (data && data.length > 0) {
        console.log('Columns in services table:', Object.keys(data[0]))
        if (Object.keys(data[0]).includes('adicionais')) {
            console.log('Column "adicionais" EXISTS.')
        } else {
            console.log('Column "adicionais" is MISSING.')
        }
    } else {
        console.log('No data found to check columns.')
    }
}

checkSchema()
