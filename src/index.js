import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import "./index.css"
import App from './App';
// import StarRatings from './StarRatings';
// import TextExpender from './TextExpender';


// function Test() {
//   const [textRating, setTextRating] = useState(0)
//   return (
//     <div>
//       <StarRatings color="blue" onSetRating={setTextRating} />
//       <p>The rating is {textRating}</p>
//     </div>
//   );
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRatings maxRating={5} messages = {['Terrible', 'Bad', 'Okay', 'Good', 'Amazing']} />
    <StarRatings maxRating={5} size={24} color='red' defaultRating={3} />
    <Test />
    <TextExpender /> */}
  </React.StrictMode>
);
