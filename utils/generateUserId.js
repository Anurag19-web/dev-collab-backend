const generateUserId = () => {

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let userId = "";

  for (let i = 0; i < 10; i++) {

    const randomIndex = Math.floor(Math.random() * characters.length);

    userId += characters[randomIndex];

  }

  return userId;

};

export default generateUserId;