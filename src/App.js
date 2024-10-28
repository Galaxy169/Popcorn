import { useEffect, useRef, useState } from "react";
import StarRatings from "./StarRatings";

const KEY = "7373e789";

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(() => {
    // console.log(inputEl.current)

    if (document.activeElement === inputEl.current) return;

    const callback = (e) => {
      console.log(e.key);
      if (e.key === "Enter") {
        inputEl.current.focus();
        setQuery("");
      }
    };
    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [setQuery]);

  // Without useRef
  // useEffect(()=>{
  //   const inputEl = document.querySelector(".search");
  //   inputEl.focus();
  // },[])

  return <input className="search" type="text" placeholder="Search movies..." value={query} onChange={(e) => setQuery(e.target.value)} ref={inputEl} />;
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  // const [watched, setWatched] = useState([]);
  // using callback in initial render to load watched movie from local storage
  /* Using arrow function */
  // const [watched, setWatched] = useState(() => JSON.parse(localStorage.getItem("watched")));
  const [watched, setWatched] = useState(function () {
    const getLocalStorage = localStorage.getItem("watched");
    return JSON.parse(getLocalStorage);
  });

  function addWatchedMovie(movie) {
    setWatched((watched) => [...watched, movie]);
    // We have to store it in new object cuz due to async the watched array will be undefined at that time
    /* localStorage.setItem('watched', JSON.stringify([...watched, movie])) */
  }

  function handleSelectedMovie(id) {
    setSelectedMovie((selected) => (selected === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedMovie(null);
  }

  function handleRemoveMovie(id) {
    setWatched((movie) => movie.filter((mov) => mov.imdbID !== id));
  }

  // Add to local storage
  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);

  useEffect(
    function () {
      const controller = new AbortController();
      async function getMovie() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, { signal: controller.signal });
          if (!res.ok) throw new Error(`Can't fetch data ${res.status}`);

          const data = await res.json();
          if (data.Response === "False") throw new Error(data.Error);
          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") setError(err.message);
          console.log(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setError("");
        setMovies([]);
        return;
      }

      handleCloseMovie();
      getMovie();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectedMovie} />}
          {error && <ErrorMessage message={error} />}
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
        </Box>
        <Box>
          {selectedMovie ? (
            <MovieDetails selectedMovie={selectedMovie} onCloseMovie={handleCloseMovie} onAddWatchedMovie={addWatchedMovie} watched={watched} />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} onRemoveMovie={handleRemoveMovie} />
            </>
          )}
        </Box>

        {/* Using element prop */}
        {/* <Box element={<MovieList movies={movies} />}/> */}
      </Main>
    </>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function Box({ children }) {
  const [isOpen, setIsOpen1] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen1((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies ">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button className="btn-toggle" onClick={() => setIsOpen2((open) => !open)}>
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (

//       )}
//     </div>
//   );
// }

// function MovieDetails({selectedId}) {
//   return <div className="details">
//     <button className="btn-back">&larw;</button>

//   </div>
// }

function MovieDetails({ selectedMovie, onCloseMovie, onAddWatchedMovie, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const isWatched = watched.map((watched) => watched.imdbID).includes(selectedMovie);
  const watchedUserRating = watched.find((movie) => movie.imdbID === selectedMovie)?.userRating;
  const countRef = useRef(0);

  const { Title: title, Year: year, Poster: poster, Runtime: runtime, imdbRating, Plot: plot, Released: released, Director: director, Genre: genre, Actors: actors } = movie;

  function handleAddMovie() {
    const newWatchedMovie = {
      imdbID: selectedMovie,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      userRatingDecision: countRef.current,
    };
    onAddWatchedMovie(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(() => {
    if (userRating) countRef.current++;
  }, [userRating]);

  useEffect(() => {
    const getMovieDetails = async () => {
      try {
        setIsLoading(true);
        // setError("");
        const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedMovie}`);
        if (!res.ok) throw new Error(`Can't fetch data ${res.status}`);

        const data = await res.json();
        if (data.Response === "False") throw new Error(data.Error);
        setMovie(data);
        setIsLoading(false);
      } catch (err) {
        console.error(err.message);
        // setError(err.message);
      }
    };
    getMovieDetails();
  }, [selectedMovie]);

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;

    return function () {
      document.title = "usePopcorn";
      // console.log(`Cleanup effect for movie ${title}`);
    };
  }, [title]);

  useEffect(
    function () {
      function back(e) {
        if (e.code === "Backspace") onCloseMovie();
      }
      document.addEventListener("keydown", back);

      return function () {
        document.removeEventListener("keydown", back);
      };
    },
    [onCloseMovie]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRatings maxRating={10} size={24} onSetRating={setUserRating} />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAddMovie}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p className="">You rated with movie {watchedUserRating}</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starting by {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(0)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onRemoveMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbRating} onRemoveMovie={onRemoveMovie} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onRemoveMovie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onRemoveMovie(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  );
}
