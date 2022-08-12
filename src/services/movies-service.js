import constants from "../constants";

const { baseUrl } = constants;

export default class MoviesService {
  apiKey = "424d480cb781ff25c9bb676fd91b8713";

  async getResource(requestMode, query, page = 1, sessionId, rate) {
    if (query && page) {
      const url = `${baseUrl}${requestMode}?api_key=${this.apiKey}&language=en-US&query=${query}&page=${page}&include_adult=false`;
      if (!query) return;
      const res = await fetch(url);
      return res.json();
    }

    if (sessionId && rate) {
      const url = `${baseUrl}${requestMode}?api_key=${this.apiKey}&&guest_session_id=${sessionId}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          value: rate
        })
      });
      return res.json();
    }

    const url = `${baseUrl}${requestMode}?api_key=${this.apiKey}&page=${page}&include_adult=false`;
    const res = await fetch(url);
    return res.json();
  }

  //Получаем список фильмов по запросу:
  getMovies = (query, page) => {
    return this.getResource("search/movie", query, page);
  };

  //Получаем список жанров:
  getGenres = () => {
    return this.getResource("genre/movie/list");
  };

  //создаём гостевую сессию:
  createSession = () => {
    return this.getResource("authentication/guest_session/new");
  };

  //Посылаем оценку фильма на сервер
  setRateMovies = (movieId, sessionId, rate) => {
    return this.getResource(
      `movie/${movieId}/rating`,
      null,
      null,
      sessionId,
      rate
    );
  };

  //Получаем с сервера список оцененных фильмов
  getRateMovies = async (sessionId, page) => {
    return this.getResource(
      `/guest_session/${sessionId}/rated/movies`,
      null,
      page
    );
  };
}
