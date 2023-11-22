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
  const { star, constellation } = req.query;
  try {
    const newStar = await prisma.star.create({
      data: {
        name: star,
        constellation: constellation,
      },
    });
    res.json(newStar);
  } catch (error) {
    res.status(500).send("Error in Create operation");
  }
});

// READ route
app.get("/read", async (req, res) => {
  const { star } = req.query;
  console.log(star);
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
});

// UPDATE route
app.get("/update", async (req, res) => {
  const { star, newStar, newConstellation } = req.query;
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
});

// DELETE route
app.get("/delete", async (req, res) => {
  const { star } = req.query;
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
});

// DELETE ALL route
app.get("/delete-all", async (req, res) => {
  try {
    await prisma.star.deleteMany({});
    res.send("All stars deleted successfully");
  } catch (error) {
    res.status(500).send("Error in Delete All operation");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
