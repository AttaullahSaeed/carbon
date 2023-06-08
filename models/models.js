import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
const DB_TYPE = 'mysql';

export const initDB = async () => {
  const sequelize = new Sequelize(
    process.env.DB,
    process.env.MYSQL_USER,
    process.env.MYSQL_PWD,

    {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      dialect: DB_TYPE,
    }
  );

  try {
    await sequelize.authenticate();
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database: ', error);
    return null;
  }
};
const sequelize = await initDB();

export const Tokens = sequelize.define('users_xero_tokens', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tokenSet: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  dateCreated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  dateUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

export const Companies = sequelize.define('companies', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  scopeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
export const Vehicle = sequelize.define('vehicle', {
  registrationNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  co2Emissions: {
    type: DataTypes.STRING,
  },
  engineCapacity: {
    type: DataTypes.STRING,
  },

  markedForExport: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fuelType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  motStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  colour: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  make: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  typeApproval: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  yearOfManufacture: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taxStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateOfLastV5CIssued: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  motExpiryDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  wheelplan: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  monthOfFirstRegistration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export const Scopes = sequelize.define('scopes', {
  detail: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

sequelize
  .sync()
  .then(() => {
    console.log('Tables created successfully!');
  })
  .catch((error) => {
    console.error('Unable to create tables: ', error);
  });
