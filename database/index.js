const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: 'gametime',
  password: process.env.DB_PASS,
});

// takes a *string* representing the user's Discord ID (NOT the database ID)
// returns array containing user object with a nested array of the user's scores
async function getUser(idDiscord) {
  const getUserCommand = `
    SELECT
      u.id AS "idUser",
      u.id_discord AS "idDiscord",
      u.username,
      u.profile_photo_url AS "profilePhotoUrl",
      u.location
    FROM users AS u
    WHERE id_discord = $1
  `;

  const getUserScoresCommand = `
    SELECT
      s.id AS "idScore",
      s.value,
      s.id_user AS "idUser",
      s.id_game AS "idGame",
      s.created_at AS "createdAt"
    FROM scores AS s
    WHERE id_user = $1
    ORDER BY s.id_game, s.value DESC
  `;

  try {
    let user = await pool.query(getUserCommand, [idDiscord]);
    user = user.rows;
    // console.log('USER: ', user);
    if (user.length) {
      const { idUser } = user[0];
      const scores = await pool.query(getUserScoresCommand, [idUser]);
      if (scores) user[0].scores = scores.rows;
    }
    return user;
  } catch (error) {
    return console.error('COULD NOT GET USER FROM DATABASE', error);
  }
}

// takes an object with user properties: idDiscord (string), username, profilePhotoUrl, location
// returns array containing newly created user object
async function addUser(userObj) {
  const {
    idDiscord, username, profilePhotoUrl, location,
  } = userObj;

  const addUserCommand = `
    INSERT INTO users AS u (id_discord, username, profile_photo_url, location)
    VALUES ($1, $2, $3, $4)
    RETURNING
      u.id AS "idUser",
      u.id_discord AS "idDiscord",
      u.username,
      u.profile_photo_url AS "profilePhotoUrl",
      u.location
  `;

  try {
    let addedUser = await pool.query(addUserCommand,
      [idDiscord, username, profilePhotoUrl, location]);
    addedUser = addedUser.rows;
    addedUser[0].scores = [];
    return addedUser;
  } catch (error) {
    return console.error('COULD NOT ADD USER TO DATABASE', error);
  }
}

// takes a number representing the channel ID
// returns array of threads with user info and a nested array of thread replies with user info
async function getThreads(idChannel) {
  const getThreadsCommand = `
    SELECT
      t.id AS "idThread",
      t.text,
      t.id_channel AS "idChannel",
      t.updated_at AS "updatedAt",
      t.created_at AS "createdAt",
      t.id_user AS "idUser",
      u.id_discord AS "idDiscord",
      u.username,
      u.profile_photo_url AS "profilePhotoUrl",
      u.location
    FROM threads t
    LEFT JOIN users u
    ON t.id_user = u.id
    WHERE id_channel = $1
    ORDER BY t.created_at DESC, t.id
  `;

  try {
    let threads = await pool.query(getThreadsCommand, [idChannel]);
    threads = threads.rows;
    const results = [];
    await Promise.all(threads.map(async (thread) => {
      const { idThread } = thread;
      const getRepliesCommand = `
        SELECT
          r.id AS "idReply",
          r.text,
          r.id_thread AS "idThread",
          r.created_at AS "createdAt",
          r.id_user AS "idUser",
          u.id_discord AS "idDiscord",
          u.username,
          u.profile_photo_url AS "profilePhotoUrl",
          u.location
        FROM replies r
        LEFT JOIN users u
        ON r.id_user = u.id
        WHERE id_thread = ${idThread}
        ORDER BY r.created_at, r.id
      `;
      const replies = await pool.query(getRepliesCommand);
      const finishedThread = thread;
      finishedThread.replies = replies.rows ? replies.rows : [];
      results.push(finishedThread);
    }));
    return await results;
  } catch (error) {
    return console.error('COULD NOT GET THREADS FROM DATABASE', error);
  }
}

// takes an object with thread properties: text, idUser, idChannel
// returns array containing newly created thread object with user info
async function addThread(threadObj) {
  const {
    text, idUser, idChannel,
  } = threadObj;

  const addThreadCommand = `
    INSERT INTO threads AS t (text, id_user, id_channel)
    VALUES ($1, $2, $3)
    RETURNING
      t.id AS "idThread"
  `;

  try {
    const thread = await pool.query(addThreadCommand, [text, idUser, idChannel]);
    const { idThread } = thread.rows[0];
    const getAddedThreadCommand = `
      SELECT
        t.id AS "idThread",
        t.text,
        t.id_channel AS "idChannel",
        t.updated_at AS "updatedAt",
        t.created_at AS "createdAt",
        t.id_user AS "idUser",
        u.id_discord AS "idDiscord",
        u.username,
        u.profile_photo_url AS "profilePhotoUrl",
        u.location
      FROM threads t
      LEFT JOIN users u
      ON t.id_user = u.id
      WHERE t.id = ${idThread}
      ORDER BY t.created_at DESC, t.id
    `;
    let addedThread = await pool.query(getAddedThreadCommand);
    addedThread = addedThread.rows;
    addedThread[0].replies = [];
    return addedThread;
  } catch (error) {
    return console.error('COULD NOT ADD THREAD TO DATABASE', error);
  }
}

// takes an object with reply properties: text, idUser, idThread
// returns array containing newly created reply object with user info
async function addReply(replyObj) {
  const {
    text, idUser, idThread,
  } = replyObj;

  const addReplyCommand = `
    INSERT INTO replies AS r (text, id_user, id_thread)
    VALUES ($1, $2, $3)
    RETURNING
      r.id AS "idReply"
  `;
  try {
    const reply = await pool.query(addReplyCommand, [text, idUser, idThread]);
    const { idReply } = reply.rows[0];
    const getRepliesCommand = `
      SELECT
        r.id AS "idReply",
        r.text,
        r.id_thread AS "idThread",
        r.created_at AS "createdAt",
        r.id_user AS "idUser",
        u.id_discord AS "idDiscord",
        u.username,
        u.profile_photo_url AS "profilePhotoUrl",
        u.location
      FROM replies r
      LEFT JOIN users u
      ON r.id_user = u.id
      WHERE r.id = ${idReply}
      ORDER BY r.created_at, r.id
    `;
    let addedReply = await pool.query(getRepliesCommand);
    addedReply = addedReply.rows;
    return addedReply;
  } catch (error) {
    return console.error('COULD NOT ADD REPLY TO DATABASE', error);
  }
}

// takes a number representing the game ID
// returns array of scores with user info
async function getScores(idGame) {
  const getScoresCommand = `
    SELECT
      s.id,
      s.value,
      s.id_game AS "idGame",
      s.created_at AS "createdAt",
      s.id_user AS "idUser",
      u.id_discord AS "idDiscord",
      u.username,
      u.profile_photo_url AS "profilePhotoUrl",
      u.location
    FROM scores s
    LEFT JOIN users u
    ON s.id_user = u.id
    WHERE id_game = $1
    ORDER BY s.value DESC
    LIMIT 10
  `;

  try {
    let scores = await pool.query(getScoresCommand, [idGame]);
    scores = scores.rows;
    return scores;
  } catch (error) {
    return console.error('COULD NOT ADD SCORE TO DATABASE', error);
  }
}

// takes an object with score properties: value, idUser, idGame
// returns array containing newly created score object with user info
async function addScore(scoreObj) {
  const {
    value, idUser, idGame,
  } = scoreObj;

  const addScoreCommand = `
    INSERT INTO scores AS s (value, id_user, id_game)
    VALUES ($1, $2, $3)
    RETURNING
      s.id AS "idScore"
  `;

  try {
    const score = await pool.query(addScoreCommand, [value, idUser, idGame]);
    const { idScore } = score.rows[0];
    const getAddedScoreCommand = `
      SELECT
        s.id AS "idScore",
        s.value,
        s.id_game AS "idGame",
        s.created_at AS "createdAt",
        s.id_user AS "idUser",
        u.id_discord AS "idDiscord",
        u.username,
        u.profile_photo_url AS "profilePhotoUrl",
        u.location
      FROM scores s
      LEFT JOIN users u
      ON s.id_user = u.id
      WHERE s.id = ${idScore}
      ORDER BY s.value DESC
      LIMIT 10
    `;
    let addedScore = await pool.query(getAddedScoreCommand);
    addedScore = addedScore.rows;
    return addedScore;
  } catch (error) {
    return console.error('COULD NOT ADD SCORE TO DATABASE', error);
  }
}

// ************************************************************************
// TO DO WITH JAMES: remove age; reassign userObj = req.body, id => idDiscord, id => idChannel,
// import new helpers, make helper destructuring into column
// ************************************************************************

module.exports = {
  getUser,
  addUser,
  getThreads,
  addThread,
  addReply,
  getScores,
  addScore,
};
