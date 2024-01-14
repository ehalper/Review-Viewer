import express from "express"
import cors from "cors"
import { appendFileSync } from 'fs';
import { join } from 'path';

declare var require: any;
const request = require('request');
const fs = require('node:fs');
const app = express()

app.use(express.json())
app.use(cors())

//Converts date string to miliseconds
function convertDateToMilis(date: string) {
  //Format from apple store api: 2023-06-01T05:39:31-07:00
  return new Date(date.substring(0, 19)).getTime()
}

function parseData(body: string, req: any) {
  let today = new Date();

  let timeperiod = req.body.timeperiod //User input for desired time period
  let lowerBound = (new Date().setDate(today.getDate() - 2)) //Last 48 hours

  if (timeperiod == 'h96') {
    //Last 96 hours
    lowerBound = (new Date().setDate(today.getDate() - 4))
  } else if (timeperiod == 'd7') {
    //Last 7 days
    lowerBound = (new Date().setDate(today.getDate() - 7))
  }

  //Array of json Review objects to be accumulated and returned in response
  let jsonArrayObject: { id: string; user: string; content: string; date: string; rating: string; miliseconds: string; today: string; appId: string }[] = []

  //Read file storing seen reviews to avoid adding duplicates
  let wordList: string | any[] = []
  const data = fs.readFileSync(join(__dirname, "./reviewData.txt"), 'utf-8');
  wordList = data.split('\n');

  //Parse body returned from api call
  let info = JSON.parse(body)
  let results = info.feed.entry

  //Handles improperly formatted user input for app id since results returned will be undefined in this case
  if (results == undefined) {
    return jsonArrayObject
  }

  let newReviewStr = ""
  let appId = req.body.appId //User input for app id

  //Iterates through each review from the body
  for (let i = 0; i < results.length; i++) {
    let id = results[i].id.label
    let date = results[i].updated.label

    let miliseconds = convertDateToMilis(date)

    if (!wordList.includes(id)) { //Continue if id is not stored already

      if (lowerBound > miliseconds) { //If not within time frame, can return since rest are earlier
        return jsonArrayObject
      }

      let rating = results[i]["im:rating"].label
      let user = results[i].author.name.label
      let content = results[i].content.label.replace(/\s+/g, ' ');

      let todayNew = new Date;
      newReviewStr = id + "\n" + user + "\n" + content + "\n" + date.substring(0, 19) + "\n" + rating + "\n" + miliseconds + "\n" + todayNew + "\n" + appId + "\n\n"
      addNewReviewsToFile('./reviewData.txt', newReviewStr) //Add new reviews to store in file

      jsonArrayObject.push({ id: id, user: user, content: content, date: date.substring(0, 19), rating: rating, miliseconds: miliseconds.toString(), today: todayNew.toString(), appId: appId });
    }
  }

  return jsonArrayObject
}


//Adds new reviews from api call to be stored in file where each field is on its own line
function addNewReviewsToFile(fname: string, data: any) {
  fs.readFile(join(__dirname, fname), (err: any, file: string | any[]) => {
    if (file.length == 0) { //no reviews stored so no new line
      const contents = appendFileSync(join(__dirname, fname), data);
      return contents;

    } else { //reviews stored so append new line first
      const contents = appendFileSync(join(__dirname, fname), "\n" + data);
      return contents;
    }
  })
}

//Calls api to get reviews for specified app id and will be used to call for pages 1-10
function apiCall(reqOps: string) {
  return new Promise<string>((resolve, reject) => {
    request(reqOps, (err: any, res: { statusCode: number; }, body: string) => {
      if (!err && res.statusCode == 200) {
        return resolve(body);
      }
      reject(err);
    });
  });
}

//Endpoint to get seen reviews from persisting reviews data in file
//Returns the reviews that have been seen and added already in the response
app.get("/reviews", async (req, res) => {
  fs.readFile(join(__dirname, "./reviewData.txt"), 'utf8', (err: any, data: any) => {
    const wordList = data.split('\n'); //store each line as token
    let newList = []
    let li: any[] = []

    //Make new array for every 8 items to have array of arrays where each row represents a review and each column represents a field of that review
    //Fields include: review id, user, content, date, rating, miliseconds, today, appId
    for (let i = 0; i < wordList.length; i++) {
      if (wordList[i].length == 0) { //Make new row for new review when blank line found
        newList.push(li)
        li = []
      } else {
        li.push(wordList[i])
      }
    }

    //For each row (represents a review), create a new json object to add to the array of them to then send as the response when complete
    let jsonArrayObject = []
    for (let i = 0; i < newList.length; i++) {
      jsonArrayObject.push({
        id: newList[i][0],
        user: newList[i][1],
        content: newList[i][2],
        date: newList[i][3],
        rating: newList[i][4],
        miliseconds: newList[i][5],
        today: newList[i][6],
        appId: newList[i][7],
      });

    }
    res.json(jsonArrayObject)

    if (err) {
      console.error(err);
      return;
    }

  });
})

//Endpoint to call the api to get new entries and see if any new ones are within specified time period
//Adds new entries to be stored in the file and then returns those new entries in the response
app.post("/update-reviews", async (req, res) => {
  let search = req.body.appId //Use appId field from user input 
  let data1: any, data2: any, data3: any, data4: any, data5: any, data6: any, data7: any, data8: any, data9: any, data10: any
  let url1 = `https://itunes.apple.com/us/rss/customerreviews/id=${search}/sortBy=mostRecent/page=1/json`
  
  //Calls api for pages 1-10 and concatenates their results to send as response
  apiCall(url1).then(result => {
    data1 = parseData(result, req)
    return apiCall(`https://itunes.apple.com/us/rss/customerreviews/id=${search}/sortBy=mostRecent/page=2/json`);
  }).then(result => {
    data2 = parseData(result, req)
    return apiCall(`https://itunes.apple.com/us/rss/customerreviews/id=${search}/sortBy=mostRecent/page=3/json`);
  }).then(result => {
    data3 = parseData(result, req)
    return apiCall(`https://itunes.apple.com/us/rss/customerreviews/id=${search}/sortBy=mostRecent/page=4/json`);
  }).then(result => {
    data4 = parseData(result, req)
    return apiCall(`https://itunes.apple.com/us/rss/customerreviews/id=${search}/sortBy=mostRecent/page=5/json`);
  }).then(result => {
    data5 = parseData(result, req)
    return apiCall(`https://itunes.apple.com/us/rss/customerreviews/id=${search}/sortBy=mostRecent/page=6/json`);
  }).then(result => {
    data6 = parseData(result, req)
    return apiCall(`https://itunes.apple.com/us/rss/customerreviews/id=${search}/sortBy=mostRecent/page=7/json`);
  }).then(result => {
    data7 = parseData(result, req)
    return apiCall(`https://itunes.apple.com/us/rss/customerreviews/id=${search}/sortBy=mostRecent/page=8/json`);
  }).then(result => {
    data8 = parseData(result, req)
    return apiCall(`https://itunes.apple.com/us/rss/customerreviews/id=${search}/sortBy=mostRecent/page=9/json`);
  }).then(result => {
    data9 = parseData(result, req)
    return apiCall(`https://itunes.apple.com/us/rss/customerreviews/id=${search}/sortBy=mostRecent/page=10/json`);
  }).then(result => {
      data10 = parseData(result, req)
      res.json(data1.concat(data2).concat(data3).concat(data4).concat(data5).concat(data6).concat(data7).concat(data8).concat(data9).concat(data10))

    }).catch(err => {
      console.log("Error from an API call: ", err);

    });
})

app.listen(4000, () => {
  console.log("Server is currently running on port 4000.")
})
