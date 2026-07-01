import express from "express";
import { Client } from "ssh2";

const app = express();
app.use(express.json());

// =========================
// ENDPOINT
// =========================
app.post("/olt/query", async (req, res) => {

  const { serial } = req.body;

  const config = {
    mikrotik: {
      host: "45.70.201.81",
      port: 8322,
      username: "ANGEL",
      password: "D1q6G7u0C7"
    },

    olt: {
      ip: "172.40.0.132",
      username: "admin",
      password: "Xpon@Olt9417#"
    },
    serial,
    timeout: 15000
  };

  const steps = [
    {
      wait: />\s*/i,
      send: () => `/system telnet ${config.olt.ip}`
    },
    // =========================
    // 1. LOGIN USER
    // =========================
    {
      wait: /login\s*:/i,
      send: () => config.olt.username
    },

    // =========================
    // 2. LOGIN PASSWORD
    // =========================
    {
      wait: /password\s*:/i,
      send: () => config.olt.password
    },

    // =========================
    // 3. PROMPT NORMAL OLT
    // =========================
    {
      wait: />\s*$/i,
      send: () => "enable"
    },

    // =========================
    // 4. ENABLE PASSWORD (IMPORTANTE)
    // =========================
    {
      wait: /password\s*:/i,
      send: () => config.olt.password
    },

    // =========================
    // 5. PROMPT PRIVILEGIADO
    // =========================
    {
      wait: /#\s*$/i,
      send: () => "configure terminal"
    },

    // =========================
    // 6. CONFIG MODE
    // =========================
    {
      wait: /\(config.*\)#\s*$/i,
      send: () => `show ont info by-sn ${config.serial}`
    }
  ];

  return new Promise((resolve, reject) => {

    const conn = new Client();

    let currentStep = 0;
    let acc = "";
    let output = "";
    let timeout;

    function cleanAnsi(str) {
      return str
        .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "") // ANSI codes
        .replace(/\x1b7/g, "")
        .replace(/\x1b8/g, "")
        .replace(/\r/g, "");
    }

    function resetTimeout(stream) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        conn.end();
        reject(new Error("Timeout en step: " + currentStep));
      }, config.timeout);
    }

    function next(stream) {

      if (currentStep >= steps.length) {
        stream.end();
        conn.end();
        resolve({ success: true, output });
        return;
      }

      const step = steps[currentStep];

      console.log("SEND:", step.send());

      stream.write(step.send() + "\n");

      currentStep++;
      resetTimeout(stream);
    }

    conn.on("ready", () => {

      conn.shell({
        term: "xterm",
        rows: 80,
        cols: 120
      }, (err, stream) => {

        if (err) return reject(err);

        resetTimeout(stream);

        stream.on("data", (data) => {

          console.log("RAW STREAM >>>", JSON.stringify(data.toString()));

          const txt = cleanAnsi(data.toString());

          console.log("RAW:", JSON.stringify(txt));

          output += txt;
          acc += txt.replace(/\r/g, "");
          acc = acc.replace(/(\[.*?\]\s*>\s*){2,}/g, "$1");

          const full = acc;

          const tail = acc.slice(-300);

          // console.log("STEP:", currentStep);
          // console.log("TAIL:", JSON.stringify(tail));

          console.log("TAIL CLEAN:", JSON.stringify(tail));

          if (currentStep >= steps.length) return;

          const step = steps[currentStep];

          console.log("FULL:", full);
          console.log("REGEX:", step.wait);
          console.log("MATCH:", step.wait.test(tail));

          if (step.wait.test(full)) {
            console.log("MATCH STEP:", currentStep);
            next(stream);
          }

        });

        stream.on("close", () => {
          clearTimeout(timeout);
          conn.end();
        });

      });

    });

    conn.on("error", reject);

    conn.connect(config.mikrotik);
  });

});

app.listen(3001, () => {
  console.log("🚀 API running on http://localhost:3001");
});


// import { RouterOSAPI } from "node-routeros";
// import express from "express";

// const app = express();
// app.use(express.json());

// app.get("/mikrotik/resource", async (req, res) => {
//   const conn = new RouterOSAPI({
//     host: "45.70.201.81",
//     user: "ANGEL",
//     password: "D1q6G7u0C7",
//     port: 8728,
//     secure: false,
//     timeout: 30000
//   });

//   await conn.connect();

//   const data = await conn.write("/system/resource/print");

//   await conn.close();

//   res.json(data);
// });

// app.listen(3001);