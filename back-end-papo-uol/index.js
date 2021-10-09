import express from "express";
import dayjs from "dayjs";

const router = express();

router.use(express.json());

// Global variables
const participants = [
  {
    name: "Ruan",
    lastStatus: 1633803324715,
  },
];

const messages = [
  {
    from: "João",
    to: "Todos",
    text: "oi galera",
    type: "message",
    time: "20:04:37",
  },
];

// Methods get
router.get("/participants", (req, res) => {
  return res.send(participants);
});

router.get("/messages", (req, res) => {
  const user = req.headers.from;
  const limit = req.query.limit;
  const userMsgs = messages.filter((message) => {
    if (message.type === "private_message" && user !== message.to) {
      return false;
    } else {
      return true;
    }
  });

  return res
    .status(200)
    .send(
      userMsgs.length > limit
        ? userMsgs.slice(userMsgs.length - limit)
        : userMsgs
    );
});

// Methods post
router.post("/participants", (req, res) => {
  const { name } = req.body;

  if (name === "") {
    return res.status(400).send();
  } else {
    const time = new Date();
    participants.push({
      name,
      lastStatus: time.getTime(),
    });
    messages.push({
      from: name,
      to: "Todos",
      text: "Entra na sala...",
      type: "status",
      time: dayjs(
        `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
      ).format("HH:MM:SS"),
    });
    return res.status(200).send(participants);
  }
});

router.post("/messages", (req, res) => {
  const from = req.headers.from;
  const { to, text, type } = req.body;

  if (
    to === "" ||
    text === "" ||
    !["message", "private_message"].includes(type) ||
    !participants.some((participant) => participants.name === from)
  ) {
    return res.status(400).send();
  } else {
    const time = new Date();
    messages.push({
      from,
      to,
      text,
      type,
      time: dayjs(
        `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
      ).format("HH:MM:SS"),
    });
    return res.status(200).send(messages);
  }
});

// Method to listen any changes
router.listen(4000);
