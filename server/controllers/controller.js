const { User } = require("../config/db.js");

const getRoot = (req, res) => {
  res.render("index");
}; 

const registerUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFeedback = (req, res) => {
  const feedback = [
    {
      quote: "A terrific piece of praise",
      name: "Prospective Customer",
      role: "Role at Organization"
    },
    {
      quote: "A fantastic bit of feedback",
      name: "Final Year Student",
      role: "Student"
    },
    {
      quote: "A genuinely glowing review",
      name: "Name",
      role: "Occupation"
    }
  ];

  const feedbackHTML = feedback.map(item => `
    <div class="feedback-card">
      <p class="feedback-quote">"${item.quote}"</p>
      <div class="feedback-author">
        <div class="author-avatar"></div>
        <div>
          <p class="author-name">${item.name}</p>
          <p class="author-role">${item.role}</p>
        </div>
      </div>
    </div>
  `).join('');

  res.send(feedbackHTML);
};

const getRoutes = (req, res) => {
  const routes = [
    { id: 1, zone: "Islamabad", stop: "G-9, Kashmir Highway" },
    { id: 2, zone: "Islamabad", stop: "6th Road, Murree Road" },
    { id: 3, zone: "Islamabad", stop: "Kurri Road, Khanna PULL Stop, Expressway" },
    { id: 4, zone: "Islamabad", stop: "Fizaia, Gangal, Express Way" },
    { id: 5, zone: "Islamabad", stop: "Bahria Enclave" },
    { id: 6, zone: "Rawalpindi", stop: "Askari 14, Sector A,B, Main Gate" },
    { id: 7, zone: "Rawalpindi", stop: "Main Peshawar Road" }
  ];

  const routesHTML = `
    <table class="routes-table">
      <thead>
        <tr>
          <th></th>
          <th>Zone</th>
          <th>Stop</th>
        </tr>
      </thead>
      <tbody>
        ${routes.map(route => `
          <tr>
            <td>${route.id}</td>
            <td>${route.zone}</td>
            <td>${route.stop}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  res.send(routesHTML);
};

module.exports = { getRoot, registerUser, getAllUsers, getFeedback, getRoutes }; 
