require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { Oso } = require("oso-cloud");

const oso = new Oso("https://cloud.osohq.com", process.env.OSO_API_KEY);
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CREATE route
app.get("/create", async (req, res) => {
  const { user, star, constellation } = req.query;
  try {
    const newStar = await prisma.star.create({
      data: {
        name: star,
        constellation: constellation,
      },
    });
    const newFact = await oso.tell(
      "has_role",
      { type: "User", id: user },
      "owner",
      {
        type: "Star",
        id: star,
      }
    );
    res.json(newStar);
  } catch (error) {
    res.status(500).send("Error in Create operation");
  }
});

// READ route
app.get("/read", async (req, res) => {
  const { user, star } = req.query;
  console.log(star);
  const osoUser = { type: "User", id: user };
  const OsoResource = { type: "Star", id: star };

  if (await oso.authorize(osoUser, "read", OsoResource)) {
    // Action is allowed

    try {
      const foundStar = await prisma.star.findMany({
        where: {
          name: star,
        },
      });
      console.log(foundStar);
      if (foundStar) {
        res.json(foundStar);
      } else {
        res.status(404).send("Star not found");
      }
    } catch (error) {
      res.status(500).send("Error in Read operation");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

// UPDATE route
app.get("/update", async (req, res) => {
  const { user, star, newStar, newConstellation } = req.query;
  const osoUser = { type: "User", id: user };
  const OsoResource = { type: "Star", id: star };

  if (await oso.authorize(osoUser, "update", OsoResource)) {
    try {
      const updatedStar = await prisma.star.update({
        where: {
          name: star,
        },
        data: {
          star: newStar,
          constellation: newConstellation,
        },
      });
      res.json(updatedStar);
    } catch (error) {
      res.status(500).send("Error in Update operation");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

// DELETE route
app.get("/delete", async (req, res) => {
  const { user, star } = req.query;
  const osoUser = { type: "User", id: user };
  const OsoResource = { type: "Star", id: star };

  if (await oso.authorize(osoUser, "delete", OsoResource)) {
    try {
      await prisma.star.delete({
        where: {
          name: star,
        },
      });
      res.send(`User ${star} deleted successfully`);
    } catch (error) {
      res.status(500).send("Error in Delete operation");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
