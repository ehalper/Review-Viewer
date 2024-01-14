import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

type Review = {
  id: string;
  user: string;
  date: string;
  content: string;
  rating: string;
  miliseconds: string;
  today: string;
  appId: string;
}

const App = () => {

  const [reviews, setReviews] = useState<Review[]>([]);
  const [appId, setAppId] = useState<string>("");
  const [timeperiod, setTimePeriod] = useState<string>("h48"); //Default time frame is for 48 hours

  //Updates app id based on user input changes
  const handleChangeId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppId(e.target.value);
  }

  //Updates time period based on user input changes
  const handleChangeTime = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimePeriod(e.target.value);
  }

  //Calls get endpoint to fetch the stored reviews being persisted
  useEffect(() => {
    const fetchReviews = async () => {

      try {
        await axios.get('http://localhost:4000/reviews').then((resp) => {

          let reviews: Review[] = resp.data;
          reviews = reviews.filter((review) => review.content != null);
          setReviews(reviews)
        })

      } catch (e) {
        console.log(e);
      }
    };

    fetchReviews();
  }, []);


  //Calls post endpoint to update reviews being stored to include any new ones
  const handleApiCall = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    setAppId("")
    let sendData = { "appId": appId, "timeperiod": timeperiod } //Sending user input in request

    try {
      await axios.post('http://localhost:4000/update-reviews', sendData).then((response) => {
        let newreviews: Review[] = response.data;
        newreviews = newreviews.filter((review) => review.content != null); //Remove blank items from response
        setReviews(newreviews.concat(reviews)) //Show new reviews by adding to reviews 
      })

    } catch (e) {
      console.log(e);
    }
  };

  //Converts rating to number of stars for frontend display
  function ratingToStars(rating: string) {
    if (rating === "1") {
      return "⭐"
    } else if (rating === "2") {
      return "⭐ ⭐"
    } else if (rating === "3") {
      return "⭐ ⭐ ⭐"
    } else if (rating === "4") {
      return "⭐ ⭐ ⭐ ⭐"
    } else if (rating === "5") {
      return "⭐ ⭐ ⭐ ⭐ ⭐"
    }
    return ""
  }

  //Sorts reviews from most recent to least
  function sortByMostRecent(reviewList: Review[]) {
    return reviewList.sort((review1, review2) => review2.date.localeCompare(review1.date)) 
  }

  return (
    <>
      <div className="header-div">
        <h1>App Store Review Viewer</h1>

        <form onSubmit={(event) => handleApiCall(event)}>

          <input placeholder="App ID" type="text" name="appId" id="appId" onChange={handleChangeId} value={appId}></input>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

          <select name="timeperiod" id="timeperiod" onChange={handleChangeTime} value={timeperiod} required>
            <option value="h48">Last 48 Hours</option>
            <option value="h96">Last 96 Hours</option>
            <option value="d7">Last 7 Days</option>
          </select>

          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

          <button type="submit">Find</button>
        </form>

      </div>

      <br></br>

      {sortByMostRecent(reviews).map((review) => (
        <div className="review">
          <div className="review-header">

            <div >
              <p>🏷️ {review.appId}</p>
              <p>👀 {review.today}</p>
            </div>

            <h2>{ratingToStars(review.rating)}</h2>

            <div >
              <p>@{review.user}</p>
              <p>📝 {review.date}</p>
            </div>

          </div>

          <h4>{review.content}</h4>

        </div>
      ))}
    </>
  );
};

export default App;
