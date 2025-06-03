module.exports = {
  apps: [
    {
      name: "pos-R3701",
      script: "index.js",
      env: {
        R3701: "mongodb+srv://houseofsupr:m0JyvZmxsEKi4CMK@clusterhos.4ifj7.mongodb.net/database",
        R3747: "mongodb+srv://supratikde090:ztDTTjn5upUs2gai@cluster0.hgdwptz.mongodb.net/database",
        CURRENT_DB: "R3701",
        PORT: 4000
      }
    },
    {
      name: "pos-R3747",
      script: "index.js",
      env: {
        R3701: "mongodb+srv://houseofsupr:m0JyvZmxsEKi4CMK@clusterhos.4ifj7.mongodb.net/database",
        R3747: "mongodb+srv://supratikde090:ztDTTjn5upUs2gai@cluster0.hgdwptz.mongodb.net/database",
        CURRENT_DB: "R3747",
        PORT: 4010
      }
    }
  ]
};
