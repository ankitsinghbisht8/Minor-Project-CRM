const dotenv = require('dotenv');
dotenv.config();

const sequelize = require('../config/database');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomDateInPastDays(daysBack) {
    const now = new Date();
    const past = new Date(now.getTime() - getRandomInt(0, daysBack) * 24 * 60 * 60 * 1000);
    // randomize time within the day
    past.setHours(getRandomInt(0, 23), getRandomInt(0, 59), getRandomInt(0, 59), 0);
    return past.toISOString();
}

const categories = ['Electronics', 'Fashion', 'Groceries', 'Beauty', 'Home & Kitchen'];
const commModes = ['SMS', 'WhatsApp', 'Email', 'Call', 'In-App'];
const locations = ['Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat', 'Noida', 'Gurgaon'];
const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Advait', 'Kabir', 'Rohan', 'Ishaan', 'Ayaan', 'Kunal', 'Arjun', 'Isha', 'Ananya', 'Neha', 'Sara', 'Aisha', 'Diya', 'Kiara', 'Riya', 'Anika', 'Meera'];
const lastNames = ['Sharma', 'Gupta', 'Verma', 'Singh', 'Mehta', 'Rao', 'Kapoor', 'Ali', 'Iyer', 'Patel', 'Chopra', 'Khanna', 'Bose', 'Das', 'Mishra'];

function generateCustomers(count) {
    const records = [];
    for (let i = 1; i <= count; i++) {
        const fn = pick(firstNames);
        const ln = pick(lastNames);
        const full_name = `${fn} ${ln}`;
        const email = `${fn}.${ln}.${i}`.toLowerCase() + '@example.com';
        const phone_number = '9' + String(800000000 + i).padStart(9, '0');
        const age = getRandomInt(18, 60);
        const gender = pick(['Male', 'Female']);
        const location = pick(locations);
        const preferred_category = pick(categories);
        const mode_of_communication = pick(commModes);

        records.push({
            full_name,
            email,
            phone_number,
            age,
            gender,
            location,
            preferred_category,
            mode_of_communication
        });
    }
    return records;
}

const sampleCustomers = generateCustomers(Number(process.env.SEED_CUSTOMERS) || 100);
const paymentMethods = ['Cash', 'Card', 'UPI', 'Wallet', 'NetBanking'];
const orderStatuses = ['Pending', 'Completed', 'Cancelled', 'Returned'];
const interactionTypes = ['Visit', 'Email', 'SMS', 'Call', 'WhatsApp'];

async function seed() {
    const t = await sequelize.transaction();
    try {
        const inserted = [];

        // Insert or update customers, collect ids
        for (const c of sampleCustomers) {
            const [rows] = await sequelize.query(`
                INSERT INTO customers (
                    full_name, email, phone_number, age, gender, location,
                    preferred_category, mode_of_communication, created_at, updated_at
                ) VALUES (
                    :full_name, :email, :phone_number, :age, :gender, :location,
                    :preferred_category, :mode_of_communication, NOW(), NOW()
                )
                ON CONFLICT (email) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    phone_number = EXCLUDED.phone_number,
                    age = EXCLUDED.age,
                    gender = EXCLUDED.gender,
                    location = EXCLUDED.location,
                    preferred_category = EXCLUDED.preferred_category,
                    mode_of_communication = EXCLUDED.mode_of_communication,
                    updated_at = NOW()
                RETURNING customer_id, email
            `, { replacements: c, transaction: t });

            inserted.push({ customer_id: rows[0].customer_id, email: rows[0].email });
        }

        // For each customer, create random orders and interactions
        for (const rec of inserted) {
            const numOrders = getRandomInt(3, 10);
            for (let i = 0; i < numOrders; i++) {
                const status = pick(orderStatuses);
                const amount = (Math.random() * 20000 + 200).toFixed(2); // 200 - 20200
                const category = pick(categories);
                const orderDate = randomDateInPastDays(365);
                const payment = pick(paymentMethods);

                await sequelize.query(`
                    INSERT INTO orders (
                        customer_id, order_date, order_amount, category, order_status, payment_method, created_at
                    ) VALUES (
                        :customer_id, :order_date, :order_amount, :category, :order_status, :payment_method, NOW()
                    )
                `, {
                    replacements: {
                        customer_id: rec.customer_id,
                        order_date: orderDate,
                        order_amount: amount,
                        category: category,
                        order_status: status,
                        payment_method: payment
                    },
                    transaction: t
                });
            }

            const numInteractions = getRandomInt(1, 8);
            for (let j = 0; j < numInteractions; j++) {
                const type = pick(interactionTypes);
                const when = randomDateInPastDays(180);
                await sequelize.query(`
                    INSERT INTO interactions (
                        customer_id, interaction_type, interaction_date, notes
                    ) VALUES (
                        :customer_id, :interaction_type, :interaction_date, :notes
                    )
                `, {
                    replacements: {
                        customer_id: rec.customer_id,
                        interaction_type: type,
                        interaction_date: when,
                        notes: `${type} interaction`
                    },
                    transaction: t
                });
            }
        }

        // Update aggregates on customers (total_orders, total_amount, last_visited)
        await sequelize.query(`
            UPDATE customers AS c SET
                total_orders = COALESCE(o.cnt, 0)::int,
                total_amount = COALESCE(o.sum, 0)::numeric(12,2),
                last_visited = v.last_visit
            FROM (
                SELECT customer_id, COUNT(*) AS cnt, SUM(order_amount) AS sum
                FROM orders WHERE order_status = 'Completed'
                GROUP BY customer_id
            ) AS o
            FULL OUTER JOIN (
                SELECT customer_id, MAX(interaction_date) AS last_visit
                FROM interactions WHERE interaction_type = 'Visit'
                GROUP BY customer_id
            ) AS v ON o.customer_id = v.customer_id
            WHERE c.customer_id = COALESCE(o.customer_id, v.customer_id)
        `, { transaction: t });

        await t.commit();
        console.log('Seed data inserted successfully');
    } catch (err) {
        await t.rollback();
        console.error('Seeding failed:', err.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

seed();


