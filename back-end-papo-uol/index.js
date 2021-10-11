import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import { stripHtml } from "string-strip-html";
import Trim from "trim";

const router = express();

router.use(cors());
router.use(express.json());

// Global variables
const participants = [
  {
    name: "Ruan",
    lastStatus: 1633803324715,
  },
];

let messages = [
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
  const user = req.headers.user;
  const limit = req.query.limit;

  const msgs = messages.filter((message) => message.to !== user);

  return msgs.length > limit
    ? res.status(200).send(msgs.slice(limit))
    : res.status(200).send(msgs);
});

// Methods post
router.post("/participants", (req, res) => {
  const name = Trim(stripHtml(req.body.name).result);

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
      time: dayjs().format("hh:mm:ss"),
    });
    return res.status(200).send(participants);
  }
});

router.post("/messages", (req, res) => {
  const from = req.headers.user;
  const { to, text, type } = req.body;

  if (
    to.length === 0 ||
    text.length === 0 ||
    !["message", "private_message"].includes(type) ||
    !participants.some((participant) => participant.name === from)
  ) {
    return res.status(400).send();
  } else {
    messages.push({
      from: to,
      to: Trim(stripHtml(to).result),
      text: Trim(stripHtml(text).result),
      type: Trim(stripHtml(type).result),
      time: dayjs().format("hh:mm:ss"),
    });
    return res.status(200).send(messages);
  }
});

router.post("/status", (req, res) => {
  const user = req.headers.user;
  let isActive = false;
  for (let i = 0; i < participants.length; i++) {
    if (participants[i].name === user) {
      isActive = true;
      participants[i].lastStatus = Date.now();
    }
  }
  return isActive ? res.status(200).send(participants) : res.status(400).send();
});

setTimeout(() => {
  participants.forEach((participant, index) => {
    if (Date.now() - participants.lastStatus > 10) {
      participants.splice(index, 1);
      messages.push({
        from: participant.name,
        to: "Todos",
        text: "sai da sala...",
        type: "status",
        time: dayjs().format("hh:mm:ss"),
      });
    }
  });
}, 15000);

// Method to listen any changes
router.listen(4000);
