import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
  
const app = express();
const port = 3000;

dotenv.config();

const api_key = process.env.API_KEY;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${api_key}`
    );
    const responseObject = response.data;

    res.render("index.ejs", {
      image: responseObject.url,
      title: responseObject.title,
      message: responseObject.explanation,
      date: responseObject.date,
      currentPage: "home",
    });
  } catch (error) {
    res.render("index.ejs", { theerror: error });
  }
});

app.post("/image", async (req, res) => {
  const dateEntered = req.body.date;
  let renderData = {};

  try {
    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${api_key}&date=${dateEntered}`
    );
    const responseObject = response.data;


  renderData = {
      image: responseObject.url,
      title: responseObject.title,
      message: responseObject.explanation,
      date: responseObject.date,
      currentPage: 'home',
    };
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.msg) {
      renderData.errormessage = error.response.data.msg;
    } else {
      renderData.theerror = error.message;
    }
  }

  res.render("index.ejs", renderData);
});



app.get("/objects", async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
  const day = String(today.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  try {
    const response = await axios.get(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${formattedDate}&end_date=${formattedDate}&api_key=${api_key}`
    );

    const responseObject = response.data;

    const allObjects = responseObject.near_earth_objects[formattedDate];

  

    res.render("objects.ejs", {
      elements: responseObject.element_count,
      objects : allObjects,
      currentPage: 'Objects',

    });
  } catch (error) {
    res.render("index.ejs", { theerror: error });
  }
});


app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
