const express = require('express');
const app = express();
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const voteRoutes = require('./routes/voteRoutes');
const llmRoutes = require('./routes/llmRoutes');

// Import models
const User = require('./models/user');
const Idea = require('./models/idea');
const Vote = require('./models/vote');

// Set up associations
const models = { User, Idea, Vote };
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', ideaRoutes);
app.use('/api', voteRoutes);
app.use('/api', llmRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      await sequelize.sync();
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();