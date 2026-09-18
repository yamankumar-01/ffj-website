import { Sequelize } from 'sequelize';

let sequelize;

const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  console.log('🐘 Connecting to PostgreSQL database via DATABASE_URL...');
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' || !dbUrl.includes('localhost')
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  console.log('📁 No DATABASE_URL found. Using local SQLite storage (dev.sqlite) for seamless instant development...');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './dev.sqlite',
    logging: false,
  });
}

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connection established successfully (${sequelize.getDialect().toUpperCase()}).`);
    
    // Auto-sync schema (create tables if they do not exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synchronized.');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    throw error;
  }
};

export { sequelize };
